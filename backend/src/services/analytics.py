import uuid

from src.db.queries import ClickQueriesQueries
import asyncpg
from fastapi import Request


async def log_click_task(
    pool: asyncpg.Pool,
    link_id: uuid.UUID,
    user_agent: str | None,
    referer: str | None,
    ip_address: str | None
):
    async with pool.acquire() as db:
        querier = ClickQueriesQueries(db)
        await querier.CreateClick(
            link_id=link_id,
            user_agent=user_agent,
            referred_from=referer,
            ip_address=ip_address
        )


def get_real_ip(request: Request) -> str:
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()

    return request.client.host if request.client else "127.0.0.1"