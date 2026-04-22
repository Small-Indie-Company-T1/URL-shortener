import redis.asyncio as redis
from typing import AsyncGenerator
from src.core.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
bin_redis_client = redis.from_url(settings.REDIS_URL, decode_responses=False)

async def get_redis() -> AsyncGenerator[redis.Redis, None]:
    yield redis_client

async def get_bin_redis() -> AsyncGenerator[redis.Redis, None]:
    yield bin_redis_client