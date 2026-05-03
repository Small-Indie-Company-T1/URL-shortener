import io
from typing import List
import uuid

import asyncpg
import segno

from src.core.exceptions.app_exceptions import AppException, DatabaseConnectionError
from src.schemas.links import LinkRead
from src.services.shortener import ShortenerGenerator
from src.db.queries import LinkQueriesQueries
from src.core.config import settings
from src.core.logger import logger


class LinkService:
    def __init__(self, queries: LinkQueriesQueries):
        self.queries = queries
        self._max_retries = 3

    async def create_short_link(self, original_url: str, user_id: uuid.UUID) -> LinkRead:
        for i in range(self._max_retries):
            code = ShortenerGenerator.generate()
            try:
                link = await self.queries.CreateLink(
                    creator_id=user_id,
                    original_url=original_url,
                    short_code=code
                )
                return link
            except asyncpg.PostgresError as e:
                logger.error(f'Database error for user {user_id}: {e}', exc_info=True)
                raise DatabaseConnectionError("База данных временно недоступна")
            except Exception:
                continue
        logger.exception("Unexpected error in create_short_link")
        raise Exception("Не удалось сгенерировать уникальный код")
    
    async def get_user_links(
        self,
        user_id: uuid.UUID4,
        limit: int = 10,
        offset: int = 0,
        original_url: str | None = None,
        is_active: bool | None = None,
        order_by: str = 'created_at',
        order_dir: str = 'desc'
    ) -> List[LinkRead]:
        links = await self.queries.GetLinksByUserId(
            creator_id=user_id,
            limit=limit,
            offset=offset,
            original_url=original_url,
            is_active=is_active,
            order_by=order_by,
            order_dir=order_dir
        )
        return [LinkRead.model_validate(link) for link in links]

    async def get_links_total(
        self,
        user_id: uuid.UUID4,
        original_url: str | None = None,
        is_active: bool | None = None
    ) -> int:
        try:
            result = await self.queries.GetLinksCountByUserId(
                creator_id=user_id,
                original_url=original_url,
                is_active=is_active
            )
            return result.count if hasattr(result, 'count') else result[0]
        except asyncpg.PostgresError as e:
            logger.error(f'Database error for user {user_id}: {e}', exc_info=True)
            raise DatabaseConnectionError("База данных временно недоступна")
        except Exception as e:
            logger.exception(f'Unexpected error in get_links_total: {e}')
            raise AppException("Произошла ошибка при подсчете ссылок")


    async def delete_link(self, short_code: str, user_id: uuid.UUID) -> bool:
        try:
            deleted_id = await self.queries.DeleteLink(short_code=short_code, creator_id=user_id)
            return deleted_id is not None
        except Exception as e:
            return False

    async def exists(self, short_code: str) -> bool:
        result = await self.queries.CheckLinkExists(short_code)
        return result.exists

    def generate_qr_code(self, short_code: str,
                         scale: int,
                         format: str = 'png') -> tuple[io.BytesIO, str]:
        full_url = f'{settings.BASE_URL}/r/{short_code}'
        qr = segno.make(full_url)
        out = io.BytesIO()

        if format.lower() == 'svg':
            qr.save(out, kind='svg', scale=scale, light='white')
            mime_type = "image/svg+xml"
        else:
            qr.save(out, kind='png', scale=scale, light='white')
            mime_type = "image/png"

        out.seek(0)
        return out, mime_type
