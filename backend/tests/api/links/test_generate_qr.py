import pytest


@pytest.mark.asyncio
async def test_generate_qr_success(client, test_pool, test_user):
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

@pytest.mark.asyncio
async def test_generate_qr_not_found(client, test_pool):
    response = await client.get('/links/{nonsense}/qr')
    assert response.status_code == 404
    assert 'не найдена' in response.json().get('detail')

@pytest.mark.asyncio
async def test_generate_qr_format_svg(client, test_pool, test_user):
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

@pytest.mark.asyncio
async def test_generate_qr_cache(client, test_pool, test_user):
    short_code = 'Abc123'
    async with test_pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO links (short_code, original_url, creator_id) " \
            "VALUES ($1, $2, $3)", short_code, "https://google.com", test_user.id
        )
    await client.get(f'/links/{short_code}/qr')
    response = await client.get(f'/links/{short_code}/qr')
    assert response.status_code == 200
    assert len(response.content) > 0