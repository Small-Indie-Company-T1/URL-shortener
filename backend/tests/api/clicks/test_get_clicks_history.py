from argon2 import PasswordHasher
import pytest

from src.main import app
from src.api.deps import get_current_user


@pytest.mark.asyncio
async def test_get_clicks_history_pagination(client, test_pool, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    short_code = 'abc123'
    async with test_pool.acquire() as conn:
        link_id = await conn.fetchval(
            "INSERT INTO links (short_code, original_url, creator_id) " \
            "VALUES ($1, $2, $3) RETURNING id",
            short_code, "https://google.com", test_user.id
        )
    for i in range(15):
        async with test_pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO clicks (link_id, ip_address) " \
                "VALUES ($1, $2)", link_id, f"192.168.0.{i}"
            )
    response = await client.get(f'/stats/{short_code}/list?limit=10')
    assert response.status_code == 200
    assert len(response.json()) == 10

    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_clicks_history_forbidden(client, test_pool, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    short_code = 'abc123'
    ph = PasswordHasher()
    async with test_pool.acquire() as conn:
        other_user_id = await conn.fetchval(
            "INSERT INTO users (nickname, email, password) " \
            "VALUES ($1, $2, $3) RETURNING id", "test_user2", "kaban@mail.ru", ph.hash('Hash456').encode('utf-8')
        )
        await conn.execute(
            "INSERT INTO links (short_code, original_url, creator_id) " \
            "VALUES ($1, $2, $3)", short_code, "https://google.com", other_user_id
        )
    response = await client.get(f'/stats/{short_code}/list')
    assert response.status_code == 403
    
    app.dependency_overrides.clear()
