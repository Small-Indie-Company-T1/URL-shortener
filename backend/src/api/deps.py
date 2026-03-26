from src.db.queries import JwtQueriesQueries
from src.core.config import settings
from fastapi.security import OAuth2PasswordBearer
import jwt
from src.db.queries import UserQueriesQueries
import asyncpg
from src.auth.schemas import TokenData
from fastapi import HTTPException, Depends, status
from src.db.database import get_db
import uuid

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login-swagger")
async def get_current_user(token: str = Depends(oauth2_scheme), db: asyncpg.Connection = Depends(get_db)):
    user_querier = UserQueriesQueries(db)
    session_querier = JwtQueriesQueries(db)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        token_jti_str: str = payload.get("jti")
        token_type: str = payload.get("type")
        if user_id_str is None or token_jti_str is None or token_type != "access":
            raise credentials_exception

        user_id = uuid.UUID(user_id_str)
        token_jti = uuid.UUID(token_jti_str)

    except (jwt.PyJWTError, ValueError):
        raise credentials_exception

    session = await session_querier.GetSession(id=token_jti)

    if not session or session.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="session revoked or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await user_querier.GetUserById(id=user_id)

    if user is None:
        raise credentials_exception

    return user