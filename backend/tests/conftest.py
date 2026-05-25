from dataclasses import dataclass
from pathlib import Path
from unittest.mock import AsyncMock
import uuid

from alembic import command
from alembic.config import Config
from argon2 import PasswordHasher
import asyncpg
from httpx import ASGITransport, AsyncClient
import pytest
from redis.asyncio import Redis

from src.services.session_manager import RedisSessionManager
from src.db.queries import LinkQueriesQueries
from src.main import app
from src.core.config import settings
from src.db.database import get_db
from src.db.redis import get_redis, get_bin_redis

TEST_DB_URL = f'postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/test_db'
TEST_REDIS_URL = f'redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/1'

@pytest.fixture(scope='session', autouse=True)
def upgrade_test_database():
    root_dir = Path(__file__).parent.parent
    ini_path = root_dir / 'alembic.ini'
    alembic_cfg = Config(str(ini_path))
    alembic_cfg.set_main_option('script_location', str(root_dir / 'alembic'))
    alembic_cfg.set_main_option('sqlalchemy.url', TEST_DB_URL)
    command.upgrade(alembic_cfg, "head")
    yield

@pytest.fixture
async def test_pool():
    pool = await asyncpg.create_pool(dsn=TEST_DB_URL)
    yield pool
    await pool.close()

@pytest.fixture(autouse=True)
async def redis_client():
    client = Redis.from_url(TEST_REDIS_URL, decode_responses=True)
    await client.flushdb()
    yield client
    await client.aclose()

@pytest.fixture(autouse=True)
async def bin_redis_client():
    client = Redis.from_url(TEST_REDIS_URL, decode_responses=False)
    await client.flushdb()
    yield client
    await client.aclose()

@pytest.fixture
async def client(test_pool, redis_client, bin_redis_client):
    app.state.pool = test_pool

    async def _get_test_db():
        async with test_pool.acquire() as conn:
            yield conn
    
    async def _get_test_redis():
        yield redis_client

    async def _get_test_bin_redis():
        yield bin_redis_client

    app.dependency_overrides[get_db] = _get_test_db
    app.dependency_overrides[get_redis] = _get_test_redis
    app.dependency_overrides[get_bin_redis] = _get_test_bin_redis

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
    if hasattr(app.state, 'pool'):
        del app.state.pool

@pytest.fixture()
async def clear_db(test_pool):
    yield

    async with test_pool.acquire() as conn:
        await conn.execute("TRUNCATE TABLE links, users RESTART IDENTITY CASCADE;")

@dataclass
class MockUser:
    id: uuid.UUID
    email: str

@pytest.fixture
async def test_user(clear_db, test_pool):
    ph = PasswordHasher()
    hashed_password_bytes = ph.hash('Hash456').encode('utf-8')
    user_uuid = uuid.uuid4()
    user_email = f'temp_{uuid.uuid4().hex[:8]}@example.com'
    async with test_pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO users (id, nickname, email, password) "
            "VALUES ($1, 'tester', $2, $3) "
            "ON CONFLICT (id) DO NOTHING", user_uuid, user_email, hashed_password_bytes
        )
    return MockUser(id=user_uuid, email=user_email)

@pytest.fixture
def mock_queries():
    mock = AsyncMock(spec=LinkQueriesQueries)
    return mock

@pytest.fixture
def manager(redis_client):
    return RedisSessionManager(redis_client)
