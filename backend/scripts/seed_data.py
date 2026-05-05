import asyncio
import random
import uuid

from argon2 import PasswordHasher
import asyncpg
asyncpg.Connection.exec = asyncpg.Connection.execute

from src.core.config import settings
from src.db.queries import UserQueriesQueries, LinkQueriesQueries
from src.services.analytics import log_click_task
from src.services.shortener import ShortenerGenerator


USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
]

REFERERS = [
    "https://t.me/top_it",
    "https://t.me/yyeart",
    "https://vk.com/stellaryyeart",
    "https://google.com",
    "https://github.com/yyeart",
    None
]

async def seed_data(num_users: int = 3, links_per_user: int = 5, clicks_per_link: int = 100):
    pool = await asyncpg.create_pool(
        dsn=settings.DATABASE_URL_SYNC,
        min_size=5,
        max_size=20
    )

    ph = PasswordHasher()

    async with pool.acquire() as db:
        user_queries = UserQueriesQueries(db)
        link_queries = LinkQueriesQueries(db)

        print(f'Начало симуляции для {num_users} пользователей')

        for i in range(num_users):
            email = f'demo_user_{i}@mail.ru'
            user = await user_queries.GetUserByEmail(email=email)
            if not user:
                user = await user_queries.CreateUser(
                    nickname=f'DemoExpert_{i}',
                    email=email,
                    password=ph.hash('Hash456').encode('utf-8')
                )

            print(f'Пользователь {user.email} готов. Создание ссылок...')

            for j in range(links_per_user):
                short_code = ShortenerGenerator.generate(6)
                link = await link_queries.CreateLink(
                    creator_id=user.id,
                    original_url=f'https://example.com/item/{uuid.uuid4()}',
                    short_code=short_code
                )

                click_tasks = []
                for _ in range(random.randint(10, clicks_per_link)):
                    click_tasks.append(
                        log_click_task(
                            pool=pool,
                            link_id=link.id,
                            user_agent=random.choice(USER_AGENTS),
                            referer=random.choice(REFERERS),
                            ip_address=f'{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}'
                        )
                    )
                await asyncio.gather(*click_tasks)
                print(f'Ссылка {short_code} заполнена {len(click_tasks)} кликами')
    await pool.close()
    print('Симуляция завершена. Среда подготовлена к демонстрации!')

if __name__ == '__main__':
    asyncio.run(seed_data(num_users=10, links_per_user=5, clicks_per_link=100))
