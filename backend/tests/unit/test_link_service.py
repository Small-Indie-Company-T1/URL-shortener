import uuid
import pytest

from src.services.links import LinkService


@pytest.mark.asyncio
async def test_create_link_collision(mock_queries):
    mock_queries.CreateLink.side_effect = ValueError('collision')
    service = LinkService(queries=mock_queries)

    with pytest.raises(Exception) as e:
        await service.create_short_link(
            original_url='https://google.com',
            user_id=uuid.uuid4()
        )
    assert "Не удалось сгенерировать уникальный код" in str(e.value)
    assert mock_queries.CreateLink.call_count == 3
