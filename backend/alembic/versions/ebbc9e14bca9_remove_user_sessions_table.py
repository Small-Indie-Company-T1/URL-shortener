"""remove_user_sessions_table

Revision ID: ebbc9e14bca9
Revises: 943f209dacb1
Create Date: 2026-04-16 13:47:28.581873

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ebbc9e14bca9'
down_revision: Union[str, Sequence[str], None] = '943f209dacb1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("DROP TABLE IF EXISTS user_sessions CASCADE;")


def downgrade() -> None:
    op.execute("""
        CREATE TABLE user_sessions (
            id UUID PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            refresh_token TEXT NOT NULL,
            user_agent TEXT,
            is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS user_sessions_user_idx ON user_sessions (user_id);
    """)
