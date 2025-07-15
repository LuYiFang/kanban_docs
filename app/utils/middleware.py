from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from datetime import datetime, timedelta
import jwt

from config.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from utils.tools import validate_exp


class ExtendExpMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        excluded_paths = ["/api/auth/logout", "/api/auth/login",
                          "/api/auth/signup"]
        if request.url.path in excluded_paths:
            return await call_next(request)

        token = request.cookies.get("access_token")
        if not token:
            raise jwt.InvalidTokenError("Token not found in cookies")

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username = payload.get("sub")
            if not username:
                raise jwt.InvalidTokenError("Invalid token: 'sub' not found in payload")

            validate_exp(payload)

            new_access_token = jwt.encode(
                {"sub": username, "exp": datetime.utcnow() + timedelta(
                    minutes=ACCESS_TOKEN_EXPIRE_MINUTES)},
                SECRET_KEY,
                algorithm=ALGORITHM
            )

            response = await call_next(request)
            response.set_cookie(key="access_token", value=new_access_token,
                                httponly=True)
            return response
        except jwt.ExpiredSignatureError:
            return await call_next(request)
        except jwt.InvalidTokenError:
            return await call_next(request)
