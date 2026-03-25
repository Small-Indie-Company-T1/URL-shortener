
from src.db import models
import asyncpg
import dataclasses
import datetime
import typing



@dataclasses.dataclass
class UserQueriesQueries:
    connection: asyncpg.Connection

    CREATEUSER = """
        INSERT INTO users (nickname, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, nickname, email, password, created_at, is_deleted
    """
    GETUSERBYEMAIL = """
        SELECT id, nickname, email, password, created_at, is_deleted FROM users WHERE email = $1 LIMIT 1
    """
    def __init__(self, connection: asyncpg.Connection):
        self.connection = connection

    
    async def CreateUser(self, nickname: str, email: str, password: bytes) -> models.public.Users | None:
        row = await self.connection.fetchrow(
            self.CREATEUSER, nickname, email, password
        )
        if row is None:
            return None
        return models.public.Users(
            created_at=row["created_at"],
            email=row["email"],
            id=row["id"],
            is_deleted=row["is_deleted"],
            nickname=row["nickname"],
            password=row["password"],
        )
    async def GetUserByEmail(self, email: str) -> models.public.Users | None:
        row = await self.connection.fetchrow(
            self.GETUSERBYEMAIL, email
        )
        if row is None:
            return None
        return models.public.Users(
            created_at=row["created_at"],
            email=row["email"],
            id=row["id"],
            is_deleted=row["is_deleted"],
            nickname=row["nickname"],
            password=row["password"],
        )

@dataclasses.dataclass
class Queries:
    connection: asyncpg.Connection
    user_queries: UserQueriesQueries

    def __init__(self, connection: asyncpg.Connection):
        self.connection = connection
        self.user_queries = UserQueriesQueries(connection)

    