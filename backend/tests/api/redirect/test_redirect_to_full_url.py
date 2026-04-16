from unittest.mock import patch

import pytest

from src.main import app
from src.api.deps import get_current_user


@pytest.mark.asyncio
async def test_redirect_success(client, test_pool, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    short_code = 'abc123'
    original_url = 'https://google.com'
    async with test_pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO links (short_code, original_url, creator_id) " \
            "VALUES ($1, $2, $3)", short_code, original_url, test_user.id
        )
    response = await client.get(f'/{short_code}', follow_redirects=False)
    assert response.status_code == 302
    assert response.headers.get('location') == original_url
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_redirect_not_found(client):
    response = await client.get("/nonsense")
    assert response.status_code == 404
    assert 'not found' in response.json().get('detail')

@pytest.mark.asyncio
async def tests_redirect_logs_click(client, test_pool, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    short_code = 'abc123'
    async with test_pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO links (short_code, original_url, creator_id) " \
            "VALUES ($1, $2, $3)", short_code, 'https://tiktok.com', test_user.id
        )
    with patch("src.api.v1.redirect.log_click_task") as mock_task:
        response = await client.get(f"/{short_code}", follow_redirects=False)
        assert response.status_code == 302
        mock_task.assert_called_once()
