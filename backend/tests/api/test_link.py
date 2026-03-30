import pytest

from src.main import app
from src.api.deps import get_current_user


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
