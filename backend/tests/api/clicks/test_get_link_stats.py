from argon2 import PasswordHasher
import pytest

from src.main import app
from src.api.deps import get_current_user


@pytest.mark.asyncio
async def test_get_link_stats_success(client, test_pool, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    short_code = 'abc123'
    async with test_pool.acquire() as conn:
        link_id = await conn.fetchval(
            "INSERT INTO links (short_code, original_url, creator_id) " \
            "VALUES ($1, $2, $3) RETURNING id",
            short_code, "https://google.com", test_user.id
        )
    clicks = [
        (link_id, "1.1.1.1", "Mozilla"),
        (link_id, "1.1.1.1", "Mozilla"),
        (link_id, "2.2.2.2", "Chrome"),
    ]
    for id, ip, ua in clicks:
        async with test_pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO clicks (link_id, user_agent, ip_address) " \
                "VALUES ($1, $2, $3)", id, ua, ip
            )
    response = await client.get(f'/stats/{short_code}')
    assert response.status_code == 200
    data = response.json()
    assert data.get('short_code') == short_code
    assert data.get('clicks_count') == 3
    assert data.get('unique_ip_clicks_count') == 2

    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_link_stats_forbidden(client, test_pool, test_user):
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
    response = await client.get(f'/stats/{short_code}')
    assert response.status_code == 403
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_link_stats_not_found(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    response = await client.get('/stats/burmalda')
    assert response.status_code == 404
    assert 'not found' in response.json().get('detail').lower()

    app.dependency_overrides.clear()
