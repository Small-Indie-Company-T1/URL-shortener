import asyncpg
from src.core.config import settings
from typing import AsyncGenerator

pool = None

async def create_db_pool():
    global pool
    pool = await asyncpg.create_pool(
        dsn=settings.DATABASE_URL_SYNC,
        min_size=5,
        max_size=20
    )

async def close_db_pool():
    global pool
    if pool:
        await pool.close()


async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    global pool
    if pool is None:
        raise Exception("db pool is not initialized")

    async with pool.acquire() as connection:
        yield connection