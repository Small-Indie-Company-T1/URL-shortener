"""add_user_sessions

Revision ID: 943f209dacb1
Revises: c266c0f3570d
Create Date: 2026-03-26 19:01:24.546409

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '943f209dacb1'
down_revision: Union[str, Sequence[str], None] = 'c266c0f3570d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE user_sessions (
            id UUID PRIMARY KEY DEFAULT uuidv7(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            refresh_token TEXT NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            user_agent TEXT,
            is_revoked BOOLEAN NOT NULL DEFAULT FALSE
        );
    """)
    op.execute("CREATE INDEX sessions_token_idx ON user_sessions (refresh_token);")
    op.execute("CREATE INDEX sessions_user_idx ON user_sessions (user_id);")
    op.execute("""
               ALTER TABLE clicks
                   ALTER COLUMN ip_address TYPE INET USING ip_address::inet;
               """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE clicks 
        ALTER COLUMN ip_address TYPE VARCHAR(63);
    """)
    op.execute("DROP TABLE IF EXISTS user_sessions CASCADE;")
