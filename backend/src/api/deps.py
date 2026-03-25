from fastapi import Depends
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from src.services.links import LinkService
from src.db.link_queries import AsyncQuerier
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv("env/postgres.env"))

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError('DATABASE_URL не установлен в переменных окружения')

engine = create_async_engine(DATABASE_URL)

async def get_db_conn():
    async with engine.connect() as conn:
        yield AsyncQuerier(conn)

async def get_link_service(conn=Depends(get_db_conn)):
    queries = AsyncQuerier(conn)
    return LinkService(queries)
