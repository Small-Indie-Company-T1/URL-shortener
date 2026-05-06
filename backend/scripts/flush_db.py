import asyncio

import asyncpg
import redis.asyncio as redis

from src.core.config import settings


async def flush_all() -> None:
    """
    Скрипт для полной очистки БД и Redis
    """
    print('Начало очистки')
    try:
        conn = await asyncpg.connect(settings.DATABASE_URL_SYNC)
        await conn.execute(
            "TRUNCATE links, users, clicks RESTART IDENTITY CASCADE;"
        )
        await conn.close()
        print('[DB] Таблицы очищены, индексы сброшены')
    except Exception as e:
        print(f'[DB] Ошибка очистки БД: {e}')

    try:
        r = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, decode_responses=True)
        await r.flushall()
        await r.aclose()
        print('[Redis] Ключи удалены')
    except Exception as e:
        print(f'[Redis] Ошибка удаления ключей: {e}')
    print('Очистка завершена. Пространство чисто и невинно')

if __name__ == '__main__':
    asyncio.run(flush_all())
