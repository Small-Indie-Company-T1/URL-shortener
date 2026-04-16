import io
from typing import List
import uuid

import segno

from src.schemas.links import LinkRead
from src.services.shortener import ShortenerGenerator
from src.db.queries import LinkQueriesQueries
from src.core.config import settings


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
            except ValueError: # FIXME
                continue
        raise Exception("Не удалось сгенерировать уникальный код")
    
    async def get_user_links(self, user_id: uuid.UUID, limit: int = 10, offset: int = 0) -> List[LinkRead]:
        links = await self.queries.GetLinksByUserId(
            creator_id=user_id,
            limit=limit,
            offset=offset
        )
        return [LinkRead.model_validate(link) for link in links]

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
        full_url = f'{settings.BASE_URL}/redirect/{short_code}'
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
