from unittest.mock import patch
import uuid

from argon2 import PasswordHasher
import pytest

from tests.conftest import MockUser
from src.main import app
from src.api.deps import get_current_user


@pytest.mark.asyncio
async def test_delete_link_success(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    link = await client.post('/links/create', json={'original_url': 'https://lol.com'})
    response = await client.delete(f'/links/{link.json().get('short_code')}')
    assert response.status_code == 204
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_delete_link_unauthorized(client):
    response = await client.delete('/links/Abc123')
    assert response.status_code == 401
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_delete_link_not_found(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    response = await client.delete('/links/Abc123')
    assert response.status_code == 404
    assert 'Ссылка не найдена' in response.json().get('detail')
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_delete_link_no_rights(client, test_pool):
    user_1_id = uuid.uuid4()
    user_2_id = uuid.uuid4()
    short_code = 'abc123'
    async with test_pool.acquire() as conn:
        ph = PasswordHasher()
        await conn.execute(
            "INSERT INTO users (id, nickname, email, password) " \
            "VALUES ($1, 'user_1', 'test@lol.com', $2)", user_1_id, ph.hash('Hash456').encode('utf-8') 
        )
        await conn.execute(
            'INSERT INTO links (creator_id, original_url, short_code) ' \
            'VALUES ($1, $2, $3)', user_1_id, "https://example.com", short_code
        )

    app.dependency_overrides[get_current_user] = lambda: MockUser(id=user_2_id, email='lol@max.ru')
    response = await client.delete(f'/links/{short_code}')
    assert response.status_code == 404
    async with test_pool.acquire() as conn:
        is_deleted_row = await conn.fetchrow(
            'SELECT is_deleted FROM links WHERE short_code = $1', short_code
        )
        assert is_deleted_row.get('is_deleted') == False
    app.dependency_overrides.clear()
    async with test_pool.acquire() as conn:
        await conn.execute('TRUNCATE TABLE links, users RESTART IDENTITY CASCADE;')

@pytest.mark.asyncio
async def test_delete_link_internal_error(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    with patch("src.api.v1.links.LinkService.delete_link", side_effect=Exception("Failure")):
        response = await client.delete('/links/Abc123')
        assert response.status_code == 500
        assert "Внутренняя ошибка" in response.json().get('detail')
    app.dependency_overrides.clear()
