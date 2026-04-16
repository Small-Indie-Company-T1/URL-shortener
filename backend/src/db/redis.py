import redis.asyncio as redis
from typing import AsyncGenerator
from src.core.config import settings

REDIS_URL = "redis://localhost:6379/0"

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def get_redis() -> AsyncGenerator[redis.Redis, None]:
    yield redis_client