import uuid
import pytest
from asyncpg import UniqueViolationError, PostgresError

from src.core.exceptions.app_exceptions import DatabaseConnectionError
from src.services.links import LinkService


@pytest.mark.asyncio
async def test_create_link_collision(mock_queries):
    mock_queries.CreateLink.side_effect = UniqueViolationError('collision')
    service = LinkService(queries=mock_queries)

    with pytest.raises(Exception) as e:
        await service.create_short_link(
            original_url='https://google.com',
            user_id=uuid.uuid4()
        )
    assert "Не удалось сгенерировать уникальный код" in str(e.value)
    assert mock_queries.CreateLink.call_count == 3

@pytest.mark.asyncio
async def test_delete_link_exception(mock_queries):
    mock_queries.DeleteLink.side_effect = PostgresError('tbh idk and idc')
    service = LinkService(queries=mock_queries)

    with pytest.raises(DatabaseConnectionError) as e:
        await service.delete_link('abc123', uuid.uuid4())
    assert 'ошибка бд' in str(e.value).lower()

@pytest.mark.asyncio
async def test_create_short_link_postgres_error(mock_queries):
    mock_queries.CreateLink.side_effect = PostgresError("Fail")
    service = LinkService(queries=mock_queries)
    with pytest.raises(DatabaseConnectionError) as e:
        await service.create_short_link(
            original_url="https://example.com",
            user_id=uuid.uuid4()
        )
    assert 'База данных временно недоступна' in str(e.value)

@pytest.mark.asyncio
async def test_get_links_total_postgres_error(mock_queries):
    mock_queries.GetLinksCountByUserId.side_effect = PostgresError("Fail")
    service = LinkService(queries=mock_queries)
    with pytest.raises(DatabaseConnectionError) as e:
        await service.get_links_total(
            user_id=uuid.uuid4(),
            original_url="https://example.com"
        )
    assert 'Не удалось' in str(e.value)
