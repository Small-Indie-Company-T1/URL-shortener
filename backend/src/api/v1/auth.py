import jwt
from fastapi import APIRouter, HTTPException, Depends, status, Request, Response
import asyncpg
from fastapi.security import OAuth2PasswordRequestForm

from src.auth.security import decode_refresh_token
from src.db.models import Users
from src.db.queries import UserQueriesQueries, JwtQueriesQueries
from src.db.database import get_db
from src.auth.schemas import UserCreate, UserOut, Token, UserBase, UserLogin, RefreshResponse
from src.auth.security import hash_password, authenticate_user, create_tokens


router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserOut, tags=["register"])
async def register(user_data: UserCreate, db: asyncpg.Connection = Depends(get_db)) -> Users | None:
    querier = UserQueriesQueries(db)
    if await querier.GetUserByEmail(email = user_data.email):
        raise HTTPException(status_code=400, detail="user already exists")

    hashed = hash_password(user_data.password)

    new_user = await querier.CreateUser(nickname= user_data.nickname, email = user_data.email, password = hashed.encode('utf-8'))
    return new_user

@router.post("/login", response_model=Token, tags=["login"])
async def login(
        request: Request,
        response: Response,
        form_data: UserLogin,
        db: asyncpg.Connection = Depends(get_db)
):
    user_querier = UserQueriesQueries(db)
    user = await authenticate_user(user_querier, form_data.email, form_data.password)

    if not user:
        raise HTTPException(status_code=401, detail="invalid login credentials")

    access_t, refresh_t, refresh_jti, expire_rt = create_tokens(user.id)
    session_querier = JwtQueriesQueries(db)

    user_agent = request.headers.get("user-agent")

    await session_querier.RevokeSessionsByUA(user_id=user.id, user_agent=user_agent)

    await session_querier.CreateSession(id=refresh_jti, user_id=user.id, refresh_token=refresh_t, expires_at=expire_rt, user_agent=user_agent)

    response.set_cookie(
        key="refresh_token",
        value=refresh_t,
        httponly=True,
        secure=False, #need to change in production
        samesite="lax",
        max_age=30 * 24 * 3600,
    )

    return {
        "access_token": access_t,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login-swagger", include_in_schema=False, tags=["login"])
async def login_swagger(response: Response, request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: asyncpg.Connection = Depends(get_db)):
    json_compatible_data = UserLogin(
        email=form_data.username,
        password=form_data.password
    )
    return await login(request, response, json_compatible_data, db=db)

@router.post("/refresh", tags=["token"], response_model=RefreshResponse)
async def refresh_token(request: Request, response: Response,db: asyncpg.Connection = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="refresh token missing"
        )
    try:
        payload = decode_refresh_token(refresh_token)

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="invalid token type")

        token_jti = payload.get("jti")
        user_id = payload.get("sub")

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="refresh token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="invalid token")

    session_querier = JwtQueriesQueries(db)
    session = await session_querier.GetSession(id=token_jti)

    if not session:
        raise HTTPException(status_code=401, detail="session is not found")
    elif session.refresh_token != refresh_token:
        await session_querier.RevokeUserSessions(user_id=user_id)
        raise HTTPException(status_code=401, detail="token reuse detected. all sessions revoked.")
    elif session.is_revoked:
        await session_querier.RevokeUserSessions(user_id=user_id)
        raise HTTPException(status_code=401, detail="session was revoked")

    new_access_t, new_refresh_t, _, new_expire_rt = create_tokens(user_id, jti=session.id)

    user_agent = request.headers.get("user-agent")

    await session_querier.UpdateUserSession(id=session.id, refresh_token=new_refresh_t, expires_at=new_expire_rt, user_agent=user_agent)

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_t,
        httponly=True,
        secure=False,  # need to change in production
        samesite="lax",
        max_age=30 * 24 * 3600,
    )

    return {
        "access_token": new_access_t,
        "token_type": "bearer"
    }

@router.post("/logout", tags=["logout"])
async def logout(request: Request, response: Response, db: asyncpg.Connection = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return {"detail": "already logged out"}
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="refresh token missing"
        )
    try:
        payload = decode_refresh_token(refresh_token)

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="invalid token type")

        token_jti = payload.get("jti")
        if token_jti:
            session_querier = JwtQueriesQueries(db)
            await session_querier.RevokeUserSessionByID(id=token_jti)

    except (jwt.PyJWTError, ValueError):
        pass

    response.delete_cookie(key="refresh_token")

    return {"detail": "logged out"}