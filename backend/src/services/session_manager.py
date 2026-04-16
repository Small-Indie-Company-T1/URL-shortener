import redis.asyncio as redis
import uuid
from typing import Dict, Any, Optional


class RedisSessionManager:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client

    async def create_session(
            self,
            jti: uuid.UUID,
            user_id: uuid.UUID,
            refresh_token: str,
            expires_in_seconds: int,
            user_agent: str | None
    ):
        jti_str = str(jti)
        user_id_str = str(user_id)

        session_key = f"session:{jti_str}"
        user_sessions_key = f"user_sessions:{user_id_str}"

        session_data = {
            "user_id": user_id_str,
            "refresh_token": refresh_token,
            "user_agent": user_agent or "unknown",
        }

        async with self.redis.pipeline() as pipe:
            await pipe.hset(session_key, mapping=session_data)
            await pipe.expire(session_key, expires_in_seconds)
            await pipe.sadd(user_sessions_key, jti_str)
            await pipe.execute()

    async def get_session(self, jti: uuid.UUID) -> Optional[Dict[str, str]]:
        session_data = await self.redis.hgetall(f"session:{str(jti)}")
        return session_data if session_data else None

    async def revoke_session(self, jti: uuid.UUID, user_id: uuid.UUID | str):
        jti_str = str(jti)
        user_id_str = str(user_id)

        async with self.redis.pipeline() as pipe:
            await pipe.delete(f"session:{jti_str}")
            await pipe.srem(f"user_sessions:{user_id_str}", jti_str)
            await pipe.execute()

    async def revoke_all_user_sessions(self, user_id: uuid.UUID | str):
        user_id_str = str(user_id)
        user_sessions_key = f"user_sessions:{user_id_str}"

        jtis = await self.redis.smembers(user_sessions_key)

        if jtis:
            async with self.redis.pipeline() as pipe:
                for jti in jtis:
                    await pipe.delete(f"session:{jti}")
                await pipe.delete(user_sessions_key)
                await pipe.execute()

    async def revoke_sessions_by_ua(self, user_id: uuid.UUID | str, current_ua: str | None):
        if not current_ua:
            return

        user_id_str = str(user_id)
        user_sessions_key = f"user_sessions:{user_id_str}"

        jtis = await self.redis.smembers(user_sessions_key)

        keys_to_delete = []
        for jti in jtis:
            session_key = f"session:{jti}"
            session_ua = await self.redis.hget(session_key, "user_agent")
            if session_ua == current_ua:
                keys_to_delete.append((session_key, jti))

        if keys_to_delete:
            async with self.redis.pipeline() as pipe:
                for session_key, jti in keys_to_delete:
                    await pipe.delete(session_key)
                    await pipe.srem(user_sessions_key, jti)
                await pipe.execute()