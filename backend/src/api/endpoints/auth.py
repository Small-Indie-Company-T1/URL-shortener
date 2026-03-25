from fastapi import APIRouter, HTTPException, Depends, status
import asyncpg
from src.db.queries import UserQueriesQueries
from src.db.database import get_db
from src.auth.schemas import UserRegister, UserReturn
from src.auth.hashing import hash_password

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserReturn)
async def register(user_data: UserRegister, db: asyncpg.Connection = Depends(get_db)) -> UserReturn:
    querier = UserQueriesQueries(db)
    if await querier.GetUserByEmail(email = user_data.email):
        raise HTTPException(status_code=400, detail="user already exists")

    hashed = hash_password(user_data.password)

    new_user = await querier.CreateUser(nickname= user_data.nickname, email = user_data.email, password = hashed.encode('utf-8'))
    return new_user