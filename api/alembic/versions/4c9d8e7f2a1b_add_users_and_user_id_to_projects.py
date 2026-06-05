"""add users table and user_id to projects

Revision ID: 4c9d8e7f2a1b
Revises: 2e8f1a3b5c7d
Create Date: 2026-06-05 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '4c9d8e7f2a1b'
down_revision: Union[str, Sequence[str], None] = '2e8f1a3b5c7d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    op.add_column('projects', sa.Column('user_id', sa.String(36), nullable=True))
    op.create_foreign_key('fk_projects_user_id', 'projects', 'users', ['user_id'], ['id'])
    op.create_index('ix_projects_user_id', 'projects', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_projects_user_id', table_name='projects')
    op.drop_constraint('fk_projects_user_id', 'projects', type_='foreignkey')
    op.drop_column('projects', 'user_id')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
