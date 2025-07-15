from fastapi import APIRouter, HTTPException, Depends, Response, Request

from database import get_db
from models.auth import (LoginRequest, SignupRequest)
from services.auth import login_service, signup_service, me_service

router = APIRouter()


@router.post("/signup")
async def signup(request: SignupRequest, db=Depends(get_db)):
    user_id = await signup_service(request, db)
    if not user_id:
        raise HTTPException(status_code=400,
                            detail="Username or email already exists")
    return {"message": "Signup successful"}


@router.post("/login")
async def login(request: LoginRequest, response: Response, db=Depends(get_db)):
    access_token = await login_service(request, db)
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return {"message": "Login successful"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}


@router.get("/me")
async def me(request: Request, db=Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Token not found")
    user_info = await me_service(token, db)
    return user_info
