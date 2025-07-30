import logging

import jwt
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_401_UNAUTHORIZED

from config.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from utils.tools import validate_exp

EXCLUDED_PATHS = {
    "/api/auth/logout",
    "/api/auth/login",
    "/api/auth/signup",
    "/docs",
    "/openapi.json"
}


class ExtendExpMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path in EXCLUDED_PATHS or request.method == "OPTIONS":
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return self._unauthorized(
                "Authorization header missing or invalid")

        token = auth_header[len("Bearer "):]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except jwt.ExpiredSignatureError as e:
            logging.exception(e)
            return self._unauthorized("Token has expired")
        except jwt.InvalidTokenError as e:
            logging.exception(e)
            return self._unauthorized("Invalid token format")

        username = payload.get("sub")
        if not username:
            return self._unauthorized("Token missing 'sub' field")

        try:
            validate_exp(payload)
        except Exception as e:
            return self._unauthorized(f"Token validation failed: {str(e)}")

        new_access_token = jwt.encode(
            {
                "sub": username,
                "exp": datetime.utcnow() + timedelta(
                    minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        response = await call_next(request)
        response.headers["x-new-token"] = new_access_token
        return response

    @staticmethod
    def _unauthorized(detail: str) -> Response:
        return JSONResponse(
            status_code=HTTP_401_UNAUTHORIZED,
            content={"detail": detail}
        )
