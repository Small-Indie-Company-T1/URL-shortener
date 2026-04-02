import jwt
import pytest

from src.core.config import settings


@pytest.mark.asyncio
async def test_logout(client, test_user):
    payload = {
        'email': 'test_email@example.com',
        'password': 'Hash456'
    }
    await client.post(
        '/auth/login',
        json=payload
    )
    response = await client.post('/auth/logout')
    assert response.status_code == 200
    assert response.cookies.get('refresh_token') is None

@pytest.mark.asyncio
async def test_logout_already_logged_out(client):
    client.cookies.clear()
    response = await client.post('/auth/logout')
    assert response.status_code == 401
    assert response.json().get('detail') == 'refresh token missing'
    
@pytest.mark.asyncio
async def test_logout_invalid_token_type(client):
    payload = {
        'sub': '123',
        'type': 'access',
        'jti': 'bullshit'
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    client.cookies.set('refresh_token', token)
    response = await client.post('/auth/logout')
    assert response.status_code == 401
    assert response.json().get('detail') == 'invalid token type'

@pytest.mark.asyncio
async def test_logout_corrupted_token_pass(client):
    client.cookies.set('refresh_token', 'bad.jwt.string')
    response = await client.post('/auth/logout')
    assert response.status_code == 200
    assert response.json().get('detail') == 'logged out'
    assert response.cookies.get('refresh_token') is None
