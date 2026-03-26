import asyncpg
asyncpg.Connection.exec = asyncpg.Connection.execute
from typing import AsyncGenerator
from fastapi import Request

async def get_db(request: Request) -> AsyncGenerator[asyncpg.Connection, None]:
    pool = request.app.state.pool
    if pool is None:
        raise Exception("db pool is not initialized")

    async with pool.acquire() as connection:
        yield connection