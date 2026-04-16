import pytest

from src.main import app
from src.api.deps import get_current_user


@pytest.mark.asyncio
async def test_generate_qr_success(client, test_pool, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    short_code = 'monster'
    async with test_pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO links (short_code, original_url, creator_id) " \
            "VALUES ($1, $2, $3)", short_code, "https://google.com", test_user.id
        )
    response = await client.get(f'/links/{short_code}/qr')
    assert response.status_code == 200
    assert response.headers.get('content-type') == 'image/png'
    assert len(response.content) > 0
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_generate_qr_not_found(client, test_pool, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    response = await client.get('/links/{nonsense}/qr')
    assert response.status_code == 404
    assert 'не найдена' in response.json().get('detail')
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_generate_qr_format_svg(client, test_pool, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    short_code = 'fmt-test'
    async with test_pool.acquire() as conn:
        await conn.execute("INSERT INTO links (short_code, original_url, creator_id) " \
        "VALUES ($1, $2, $3)", short_code, "https://google.com", test_user.id)
    response_svg = await client.get(f'/links/{short_code}/qr?fmt=svg')
    assert response_svg.status_code == 200
    assert response_svg.headers.get('content-type') == 'image/svg+xml'
    assert b'<svg' in response_svg.content

    response_png = await client.get(f'/links/{short_code}/qr?fmt=png')
    assert response_png.status_code == 200
    assert response_png.headers.get('content-type') == 'image/png'

    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_generate_qr_download(client, test_pool, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    short_code = 'dl-test'
    async with test_pool.acquire() as conn:
        await conn.execute("INSERT INTO links (short_code, original_url, creator_id) " \
        "VALUES ($1, $2, $3)", short_code, "https://google.com", test_user.id)
    response = await client.get(f'/links/{short_code}/qr?download=true')
    assert response.status_code == 200
    assert 'attachment' in response.headers.get('Content-Disposition')
    app.dependency_overrides.clear()
