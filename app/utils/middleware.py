from datetime import datetime, timedelta
import jwt

from config.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from utils.tools import validate_exp
from starlette.types import ASGIApp, Receive, Scope, Send
from fastapi.responses import JSONResponse
from fastapi import status


class ExtendExpMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app
        self.excluded_paths = {
            "/api/auth/logout",
            "/api/auth/login",
            "/api/auth/signup",
            "/docs",
            "/openapi.json"
        }

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        if scope["type"] != "http" or scope["method"] == "OPTIONS":
            await self.app(scope, receive, send)
            return

        path = scope["path"]
        if path in self.excluded_paths:
            await self.app(scope, receive, send)
            return

        headers = dict(scope["headers"])
        auth_header = headers.get(b"authorization")

        if not auth_header or not auth_header.startswith(b"Bearer "):
            await self._send_error(send,
                                   "Authorization header missing or invalid")
            return

        token = auth_header[len(b"Bearer "):].decode()

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except jwt.ExpiredSignatureError:
            await self._send_error(send, "Token has expired")
            return
        except jwt.InvalidTokenError:
            await self._send_error(send, "Invalid token format")
            return

        username = payload.get("sub")
        if not username:
            await self._send_error(send, "Token missing 'sub' field")
            return

        try:
            validate_exp(payload)
        except Exception as e:
            await self._send_error(send, f"Token validation failed: {str(e)}")
            return

        new_access_token = jwt.encode(
            {
                "sub": username,
                "exp": datetime.utcnow() + timedelta(
                    minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = message.setdefault("headers", [])
                headers.append([b"x-new-token", new_access_token.encode()])
            await send(message)

        await self.app(scope, receive, send_wrapper)

    async def _send_error(self, send: Send, detail: str):
        response = JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": detail}
        )
        await response(scope={"type": "http"}, receive=None, send=send)
