from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, secret_key: str, expires_delta: timedelta, token_version: int = 0) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    return jwt.encode({"sub": subject, "ver": token_version, "exp": expire}, secret_key, algorithm="HS256")


def decode_access_token(token: str, secret_key: str) -> dict:
    return jwt.decode(token, secret_key, algorithms=["HS256"])
