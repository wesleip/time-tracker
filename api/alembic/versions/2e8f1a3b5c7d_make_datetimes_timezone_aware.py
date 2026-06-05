"""make datetimes timezone-aware

Revision ID: 2e8f1a3b5c7d
Revises: 897734e567dd
Create Date: 2026-06-05 20:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '2e8f1a3b5c7d'
down_revision: Union[str, Sequence[str], None] = '897734e567dd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('projects', 'created_at', type_=sa.DateTime(timezone=True), existing_type=sa.DateTime())
    op.alter_column('projects', 'updated_at', type_=sa.DateTime(timezone=True), existing_type=sa.DateTime())
    op.alter_column('time_entries', 'date', type_=sa.DateTime(timezone=True), existing_type=sa.DateTime())
    op.alter_column('time_entries', 'created_at', type_=sa.DateTime(timezone=True), existing_type=sa.DateTime())
    op.alter_column('time_entries', 'updated_at', type_=sa.DateTime(timezone=True), existing_type=sa.DateTime())


def downgrade() -> None:
    op.alter_column('time_entries', 'updated_at', type_=sa.DateTime(), existing_type=sa.DateTime(timezone=True))
    op.alter_column('time_entries', 'created_at', type_=sa.DateTime(), existing_type=sa.DateTime(timezone=True))
    op.alter_column('time_entries', 'date', type_=sa.DateTime(), existing_type=sa.DateTime(timezone=True))
    op.alter_column('projects', 'updated_at', type_=sa.DateTime(), existing_type=sa.DateTime(timezone=True))
    op.alter_column('projects', 'created_at', type_=sa.DateTime(), existing_type=sa.DateTime(timezone=True))
