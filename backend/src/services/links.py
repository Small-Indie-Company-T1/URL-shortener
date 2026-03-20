from src.services.shortener import ShortenerGenerator
# from src.sql.queries import Queries

class LinkService:
    def __init__(self, queries): # FIXME
        self.queries = queries
        self._max_retries = 3

    async def create_short_link(self, original_url: str, user_id: int):
        for i in range(self._max_retries):
            code = ShortenerGenerator.generate()
            try:
                link = await self.queries.insert_link(
                    ...
                )
                return link
            except ValueError: # FIXME
                continue
        raise Exception("Не удалось сгенерировать уникальный код")