from datetime import timedelta

from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth import Token, UserLogin, UserRegister


class AuthService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def register(self, data: UserRegister) -> Token:
        if self.repo.get_by_email(data.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        user = self.repo.create({
            "email": data.email,
            "name": data.name.strip(),
            "password_hash": hash_password(data.password),
        })
        token = create_access_token(
            subject=user.id,
            secret_key=settings.jwt_secret,
            expires_delta=timedelta(minutes=settings.jwt_expire_minutes),
        )
        return Token(access_token=token)

    def login(self, data: UserLogin) -> Token:
        user = self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        token = create_access_token(
            subject=user.id,
            secret_key=settings.jwt_secret,
            expires_delta=timedelta(minutes=settings.jwt_expire_minutes),
        )
        return Token(access_token=token)
