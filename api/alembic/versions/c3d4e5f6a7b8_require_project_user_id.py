"""require projects.user_id

Projects created before the multi-user release have no owner. They are
backfilled to the earliest registered user (the only plausible owner of the
pre-auth data) and the column becomes NOT NULL.

If there is no user at all and orphan projects exist, the migration fails
loudly instead of silently skipping the constraint: the operator assigns the
owner (or registers the user) and runs it again.

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a1
Create Date: 2026-11-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b2c3d4e5f6a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    orphans = conn.execute(
        sa.text("SELECT count(*) FROM projects WHERE user_id IS NULL")
    ).scalar()

    if orphans:
        owner = conn.execute(
            sa.text("SELECT id FROM users ORDER BY created_at ASC, id ASC LIMIT 1")
        ).fetchone()
        if owner is None:
            raise RuntimeError(
                "projects sem user_id e nenhum usuario cadastrado: crie o usuario dono "
                "(UPDATE projects SET user_id = '<id>') e rode a migracao novamente"
            )
        conn.execute(
            sa.text("UPDATE projects SET user_id = :user_id WHERE user_id IS NULL"),
            {"user_id": owner[0]},
        )

    op.alter_column("projects", "user_id", nullable=False)


def downgrade() -> None:
    op.alter_column("projects", "user_id", nullable=True)
