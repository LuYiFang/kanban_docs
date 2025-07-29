from typing import Dict

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.responses import JSONResponse

from database import get_db
from models.auth import (LoginRequest, SignupRequest, MeResponse)
from services.auth import login_service, signup_service, me_service

router = APIRouter()

security = HTTPBearer()


@router.post("/signup")
async def signup(request: SignupRequest, db=Depends(get_db)):
    user_id = await signup_service(request, db)
    if not user_id:
        raise HTTPException(status_code=400,
                            detail="Username or email already exists")
    return {"message": "Signup successful"}


@router.post("/login")
async def login(request: LoginRequest, db=Depends(get_db)):
    access_token = await login_service(request, db)
    if not access_token:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    response = JSONResponse(
        content={"message": "Login successful"},
        status_code=200
    )
    response.headers["X-New-Token"] = access_token
    return response


@router.post("/logout")
async def logout():
    # TODO
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=MeResponse)
async def me(credentials: HTTPAuthorizationCredentials = Depends(security),
             db=Depends(get_db)):
    token = credentials.credentials
    user_info = await me_service(token, db)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_info
