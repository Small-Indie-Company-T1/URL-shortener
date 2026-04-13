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
