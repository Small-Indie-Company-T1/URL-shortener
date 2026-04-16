from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
import jwt
import uuid
import asyncpg
import redis.asyncio as redis
from src.core.config import settings
from src.db.database import get_db
from src.db.redis import get_redis
from src.db.queries import UserQueriesQueries
from src.services.session_manager import RedisSessionManager

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login-swagger")
async def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: asyncpg.Connection = Depends(get_db),
        redis_client: redis.Redis = Depends(get_redis)
):
    user_querier = UserQueriesQueries(db)
    session_manager = RedisSessionManager(redis_client)

    wrong_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        token_jti_str: str = payload.get("jti")
        token_type: str = payload.get("type")

        if not user_id_str or not token_jti_str or token_type != "access":
            raise wrong_credentials

        user_id = uuid.UUID(user_id_str)
        token_jti = uuid.UUID(token_jti_str)

    except (jwt.PyJWTError, ValueError):
        raise wrong_credentials

    session = await session_manager.get_session(token_jti)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="session revoked or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await user_querier.GetUserById(id=user_id)
    if user is None:
        raise wrong_credentials

    return user