from unittest.mock import patch

import pytest

from src.main import app
from src.api.deps import get_current_user


@pytest.mark.asyncio
async def test_list_my_links_success(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    await client.post(
        '/links/create',
        json={'original_url': 'https://prikol.com'}
    )
    await client.post(
        '/links/create',
        json={'original_url': 'https://brainrot.ru'}
    )
    response = await client.get('/links/')
    assert response.status_code == 200
    data = response.json()
    assert 'links' in data
    assert 'total' in data
    assert isinstance(data['links'], list)
    assert data.get('total') == 2
    assert data.get('links')[0].get('creator_id') == str(test_user.id)
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_my_links_empty(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    response = await client.get('/links/')
    assert response.status_code == 200
    assert response.json().get('total') == 0
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_my_links_unauthorized(client):
    response = await client.get('/links/')
    assert response.status_code == 401
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_my_links_internal_error(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    with patch("src.api.v1.links.LinkService.get_user_links", side_effect=Exception("Failure")):
        response = await client.get('/links/')
        assert response.status_code == 500
        assert 'Внутренняя ошибка' in response.json().get('detail')
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_links_pagination(client, test_pool, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    for i in range(5):
        async with test_pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO links (short_code, original_url, creator_id) " \
                "VALUES ($1, $2, $3)", f"code{i}", f"https://domain{i}.com", test_user.id
            )
    response = await client.get('/links/?limit=2&offset=0')
    data = response.json()
    assert len(data) == 2
    assert data.get('links')[0].get('short_code') == 'code4'
    
    response = await client.get('/links/?limit=2&offset=2')
    data = response.json()
    assert len(data) == 2
    assert data.get('links')[0].get('short_code') == 'code2'

    response = await client.get('/links/?limit=10&offset=10')
    assert response.json().get('total') == 0
    app.dependency_overrides.clear()
