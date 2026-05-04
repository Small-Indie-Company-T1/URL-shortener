"""added extension for sort optimizing

Revision ID: b088a7e6c219
Revises: ce25199bf20b
Create Date: 2026-05-04 02:34:07.309370

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b088a7e6c219'
down_revision: Union[str, Sequence[str], None] = 'ce25199bf20b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.create_index(
        'idx_links_url_trgm',
        'links',
        ['original_url'],
        postgresql_using='gin',
        postgresql_ops={'original_url': 'gin_trgm_ops'}
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_links_url_trgm', table_name='links')
