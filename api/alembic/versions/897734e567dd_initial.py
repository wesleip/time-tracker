"""initial

Revision ID: 897734e567dd
Revises: 
Create Date: 2026-06-05 19:19:00.100351

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '897734e567dd'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('projects',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('color', sa.String(7), nullable=False, server_default='#6366f1'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_table('time_entries',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('hours', sa.Float(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_time_entries_date', 'time_entries', ['date'])
    op.create_index('ix_time_entries_project_id', 'time_entries', ['project_id'])


def downgrade() -> None:
    op.drop_table('time_entries')
    op.drop_table('projects')
