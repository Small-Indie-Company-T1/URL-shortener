from dataclasses import dataclass
from pathlib import Path
import uuid

from alembic import command
from alembic.config import Config
import asyncpg
from httpx import ASGITransport, AsyncClient
import pytest

from src.main import app
from src.core.config import settings
from src.db.database import get_db

TEST_DB_URL = f'postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/test_db'

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

@pytest.fixture
async def client(test_pool):
    async def _get_test_db():
        async with test_pool.acquire() as conn:
            yield conn
    app.dependency_overrides[get_db] = _get_test_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.fixture()
async def clear_db(test_pool):
    yield

    async with test_pool.acquire() as conn:
        await conn.execute("TRUNCATE TABLE links, users RESTART IDENTITY CASCADE;")

@dataclass
class MockUser:
    id: uuid.UUID

@pytest.fixture
async def test_user(clear_db, test_pool):
    user_uuid = uuid.UUID('5b3f78bb-752b-48aa-8094-da6296f6bf2d')
    async with test_pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO users (id, nickname, email, password) "
            "VALUES ($1, 'tester', 'test@example.com', 'Hash456') "
            "ON CONFLICT (id) DO NOTHING", user_uuid
        )
    return MockUser(id=user_uuid)
