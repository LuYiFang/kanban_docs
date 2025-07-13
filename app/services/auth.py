from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import jwt
from fastapi import HTTPException

from config.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from models.auth import LoginRequest, SignupRequest
from repositories.auth import (get_user_by_username, create_user,
                               verify_password)


async def login_service(request: LoginRequest, db) -> Optional[str]:
    user = await get_user_by_username(request.username, db)
    if not user or not await verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401,
                            detail="Invalid username or password")

    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return access_token


async def signup_service(request: SignupRequest, db) -> Optional[str]:
    existing_user = await get_user_by_username(request.username, db)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    user_data = {
        "username": request.username,
        "password": bcrypt.hashpw(request.password.encode("utf-8"),
                                  bcrypt.gensalt()).decode("utf-8")
    }
    user_id = await create_user(user_data, db)
    return user_id


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
