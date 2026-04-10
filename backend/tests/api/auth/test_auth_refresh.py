import asyncio

import jwt
import pytest

from datetime import datetime, timedelta

from src.core.config import settings


@pytest.mark.asyncio
async def test_refresh_token_success(client, test_user):
    PAYLOAD = {
        'email': test_user.email,
        'password': 'Hash456'
    }
    login_res = await client.post('/auth/login', json=PAYLOAD)
    old_refresh = client.cookies.get('refresh_token')
    await asyncio.sleep(1.1)
    response = await client.post('/auth/refresh')
    assert response.status_code == 200
    assert 'access_token' in response.json()
    assert client.cookies.get('refresh_token') != old_refresh

@pytest.mark.asyncio
async def test_refresh_token_missing(client, test_user):
    client.cookies.clear()
    response = await client.post('/auth/refresh')
    assert response.status_code == 401
    assert response.json().get('detail') == 'refresh token missing'

@pytest.mark.asyncio
async def test_refresh_token_invalid_type(client, test_user):
    bad_type_payload = {'sub': str(test_user.id), 'type': 'access', 'jti': 'very_bad'}
    bad_type_token = jwt.encode(bad_type_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    client.cookies.set('refresh_token', bad_type_token)
    response = await client.post('/auth/refresh')
    assert response.status_code == 401
    assert response.json().get('detail') == 'invalid token type'

@pytest.mark.asyncio
async def test_refresh_token_expired(client, test_user):
    expired_payload = {
        'sub': str(test_user.id),
        'type': 'refresh',
        'exp': datetime.now() - timedelta(days=1)
    }
    expired_token = jwt.encode(expired_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    client.cookies.set('refresh_token', expired_token)
    response = await client.post('/auth/refresh')
    assert response.status_code == 401
    assert response.json().get('detail') == 'refresh token expired'

@pytest.mark.asyncio
async def test_refresh_token_session_not_found(client, test_user):
    fake_jti_payload = {
        'sub': str(test_user.id),
        'type': 'refresh',
        'jti': '00000000-0000-0000-0000-000000000000'
    }
    fake_token = jwt.encode(fake_jti_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    client.cookies.set('refresh_token', fake_token)
    response = await client.post('/auth/refresh')
    assert response.status_code == 401
    assert response.json().get('detail') == 'session is not found'

@pytest.mark.asyncio
async def test_refresh_token_reuse(client, test_user):
    PAYLOAD = {
        'email': test_user.email,
        'password': 'Hash456'
    }
    await client.post('/auth/login', json=PAYLOAD)
    token_1 = client.cookies.get('refresh_token')
    await asyncio.sleep(1.1)
    res_1 = await client.post('/auth/refresh')
    assert res_1.status_code == 200
    token_2 = client.cookies.get('refresh_token')
    assert token_1 != token_2
    client.cookies.set('refresh_token', token_1)
    res_2 = await client.post('/auth/refresh')
    assert res_2.status_code == 401
    assert 'token reuse detected' in res_2.json().get('detail')

@pytest.mark.asyncio
async def test_refresh_revoked_session(client, test_user, test_pool):
    PAYLOAD = {
        'email': test_user.email,
        'password': 'Hash456'
    }
    await client.post('/auth/login', json=PAYLOAD)
    refresh_token = client.cookies.get('refresh_token')
    new_payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    jti = new_payload.get('jti')
    async with test_pool.acquire() as conn:
        await conn.execute('UPDATE user_sessions SET is_revoked = True WHERE id = $1', jti)
    response = await client.post('/auth/refresh')
    assert response.status_code == 401
    assert response.json().get('detail') == 'session was revoked'

@pytest.mark.asyncio
async def test_refresh_token_invalid_signature(client, test_user):
    PAYLOAD = {
        'email': test_user.email,
        'password': 'Hash456'
    }
    await client.post('/auth/login', json=PAYLOAD)
    valid_token = client.cookies.get('refresh_token')
    parts = valid_token.split('.')
    sig = parts[2]
    corrupted_sig = ('z' if sig[5] != 'z' else 'y') + sig[6:]
    corrupted = f'{parts[0]}.{parts[1]}.{corrupted_sig}'
    client.cookies.set('refresh_token', corrupted)
    response = await client.post('/auth/refresh')
    assert response.status_code == 401
    assert response.json().get('detail') == 'invalid token' 
