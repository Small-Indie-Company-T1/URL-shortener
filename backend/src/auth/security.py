from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from datetime import datetime, timedelta, timezone
from src.core.config import settings
import jwt
import uuid

hasher = PasswordHasher()

def hash_password(password: str) -> str:
    return hasher.hash(password)

def verify_password(hashed_password: str, plain_password: str) -> bool:
    try:
        return hasher.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False

def create_tokens(user_id: str, jti: uuid.UUID = None):
    now = datetime.now(timezone.utc)

    if not jti:
        refresh_jti = uuid.uuid7()
    else:
        refresh_jti = jti

    access_expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_payload = {
        "sub": str(user_id),
        "exp": access_expire,
        "type": "access",
        "jti": str(refresh_jti)
    }
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    refresh_expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_payload = {
        "sub": str(user_id),
        "exp": refresh_expire,
        "type": "refresh",
        "jti": str(refresh_jti)
    }
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return access_token, refresh_token, refresh_jti, refresh_expire

def decode_refresh_token(refresh_token: str):
    payload = jwt.decode(
        refresh_token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM]
    )
    return payload

async def authenticate_user(querier, email: str, password: str):
    user = await querier.GetUserByEmail(email)
    if not user:
        return False
    if not verify_password(plain_password= password, hashed_password= user.password):
        return False
    return user

