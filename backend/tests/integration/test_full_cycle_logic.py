import asyncio

import pytest

from src.main import app
from src.api.deps import get_current_user


@pytest.mark.asyncio
async def test_full_cycle_logic(client, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    create_response = await client.post(
        '/links/create',
        json={'original_url': 'https://google.com'}
    )
    assert create_response.status_code == 201

    short_code = create_response.json().get('short_code')
    assert short_code is not None

    qr_response = await client.get(f'/links/{short_code}/qr')
    assert qr_response.status_code == 200
    assert qr_response.headers['content-type'] in ['image/png', 'image/svg+xml']

    redirect_response = await client.get(f'/redirect/{short_code}')
    assert redirect_response.status_code == 307
    assert redirect_response.headers['location'] == 'https://google.com/'
    await asyncio.sleep(0.1)

    stats_resp = await client.get(f'/stats/{short_code}')
    assert stats_resp.status_code == 200
    assert stats_resp.json().get('clicks_count') == 1

    app.dependency_overrides.clear()
