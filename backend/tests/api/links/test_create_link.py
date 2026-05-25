from unittest.mock import patch

import pytest

from src.main import app
from src.api.deps import get_current_user
from src.core.exceptions.app_exceptions import AppException
from src.core.exceptions.service_exceptions import ServiceException


@pytest.mark.asyncio
async def test_create_link_success(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    try:
        response = await client.post(
            "/links/create",
            json={'original_url': 'https://google.com'}
        )
    finally:
        app.dependency_overrides.clear()
    
    assert response.status_code == 201
    data = response.json()
    assert 'short_code' in data
    assert data.get('original_url') == 'https://google.com/'

@pytest.mark.asyncio
async def test_create_link_unauthorized(client):
    response = await client.post(
        '/links/create',
        json={'original_url': 'https://google.com'}
    )
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_create_link_invalid_url(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    response = await client.post(
        '/links/create',
        json={'original_url': 'some bullshit'}
    )
    assert response.status_code == 422
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_link_internal_error(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    with patch("src.api.v1.links.LinkService.create_short_link", side_effect=AppException("Failure")):
        response = await client.post(
            '/links/create',
            json={'original_url': 'https://google.com'}
        )

        assert response.status_code == 500
        assert 'Failure' in response.json().get('detail')
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_link_long_url(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    long_url = f'https://example.com/{"0"*2050}'
    response = await client.post(
        '/links/create',
        json={'original_url': long_url}
    )
    assert response.status_code == 400
    assert "too long" in response.json().get('detail').lower()

    app.dependency_overrides.clear()
