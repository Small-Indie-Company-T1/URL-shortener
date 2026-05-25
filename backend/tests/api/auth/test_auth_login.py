import pytest


@pytest.mark.asyncio
async def test_login_success(client, test_user):
    payload = {
        'email': test_user.email,
        'password': 'Hash456'
    }
    response = await client.post(
        '/auth/login',
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    assert 'access_token' in data
    assert 'refresh_token' in client.cookies
    assert response.cookies.get('refresh_token') is not None

@pytest.mark.asyncio
async def test_login_wrong_password(client, test_user):
    payload = {
        'email': test_user.email,
        'password': 'Bullshit'
    }
    response = await client.post(
        '/auth/login',
        json=payload
    )
    assert response.status_code == 401
    assert 'invalid login credentials' in response.json().get('detail').lower()

@pytest.mark.asyncio
async def test_login_swagger_success(client, test_user):
    payload = {
        'username': test_user.email,
        'password': 'Hash456'
    }
    response = await client.post(
        '/auth/login-swagger',
        data=payload
    )
    assert response.status_code == 200
