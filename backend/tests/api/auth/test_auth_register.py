import pytest


@pytest.mark.asyncio
async def test_register_success(client, clear_db):
    payload = {
        'nickname': 'tester',
        'email': 'example@gmail.com',
        'password': 'qwerty67'
    }
    response = await client.post(
        '/auth/register',
        json=payload
    )
    assert response.status_code == 201
    assert response.json().get('email') == 'example@gmail.com'
    assert 'id' in response.json()

@pytest.mark.asyncio
async def test_register_duplicate_email(client, test_user):
    payload = {
        'nickname': 'tester',
        'email': test_user.email,
        'password': 'qwerty67'
    }
    response = await client.post(
        '/auth/register',
        json=payload
    )
    assert response.status_code == 400
    assert response.json().get('detail') == 'user already exists'
