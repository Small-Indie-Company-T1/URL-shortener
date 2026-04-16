import uuid

import pytest


@pytest.mark.asyncio
async def test_create_and_get_session(manager, redis_client):
    jti = uuid.uuid4()
    user_id = uuid.uuid4()
    await manager.create_session(
        jti=jti,
        user_id=user_id,
        refresh_token='test_token',
        expires_in_seconds=60,
        user_agent="Mozilla/5.0"
    )
    session = await manager.get_session(jti)
    assert session is not None
    assert session.get('user_id') == str(user_id)
    assert session.get('user_agent') == 'Mozilla/5.0'
    jtis = await redis_client.smembers(f'user_sessions:{user_id}')
    assert str(jti) in jtis

@pytest.mark.asyncio
async def test_session_time_to_live(manager, redis_client):
    jti = uuid.uuid4()
    await manager.create_session(
        jti,
        uuid.uuid4(),
        'token',
        1,
        'ua'
    )
    ttl = await redis_client.ttl(f'session:{jti}')
    assert 0 < ttl <= 1

@pytest.mark.asyncio
async def test_revoke_session(manager, redis_client):
    jti = uuid.uuid4()
    user_id = uuid.uuid4()
    await manager.create_session(jti, user_id, 'token', 60, 'ua')
    await manager.revoke_session(jti, user_id)
    assert await manager.get_session(jti) is None
    jtis = await redis_client.smembers(f'user_sessions:{user_id}')
    assert str(jti) not in jtis

@pytest.mark.asyncio
async def test_revoke_all_sessions(manager, redis_client):
    user_id = uuid.uuid4()
    jtis = [uuid.uuid4() for i in range(3)]
    for jti in jtis:
        await manager.create_session(jti, user_id, 'token', 60, 'ua')
    await manager.revoke_all_user_sessions(user_id)
    for jti in jtis:
        assert await manager.get_session(jti) is None
    assert await redis_client.exists(f'user_sessions:{user_id}') == 0

@pytest.mark.asyncio
async def test_revoke_by_ua(manager, redis_client):
    user_id = uuid.uuid4()
    ua_to_kill = 'iPhone'
    ua_to_keep = 'Desktop'
    jti_kill = uuid.uuid4()
    jti_keep = uuid.uuid4()
    await manager.create_session(jti_kill, user_id, 'token', 60, ua_to_kill)
    await manager.create_session(jti_keep, user_id, 'token', 60, ua_to_keep)
    await manager.revoke_sessions_by_ua(user_id, ua_to_kill)
    await manager.revoke_sessions_by_ua(user_id, None)
    assert await manager.get_session(jti_keep) is not None
    assert await manager.get_session(jti_kill) is None
