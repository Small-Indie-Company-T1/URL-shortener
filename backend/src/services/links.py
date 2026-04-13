from typing import List

from src.schemas.links import LinkRead
from src.services.shortener import ShortenerGenerator
from src.db.queries import LinkQueriesQueries
import uuid

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
    
    async def get_user_links(self, user_id: uuid.UUID) -> List[LinkRead]:
        links = await self.queries.GetLinksByUserId(creator_id=user_id)
        return [LinkRead.model_validate(link) for link in links]

    async def delete_link(self, short_code: str, user_id: uuid.UUID) -> bool:
        try:
            deleted_id = await self.queries.DeleteLink(short_code=short_code, creator_id=user_id)
            return deleted_id is not None
        except Exception as e:
            return False
