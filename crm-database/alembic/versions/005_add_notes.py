"""Add notes table.

Revision ID: 005_add_notes
Revises: 004_add_pipelines
Create Date: 2026-02-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '005_add_notes'
down_revision: Union[str, None] = '004_add_pipelines'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Notes ────────────────────────────────────────────────────────
    op.create_table(
        'notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('related_to_type', sa.Enum('contact', 'deal', 'lead', 'account', name='related_to_type'), nullable=False),
        sa.Column('related_to_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notes_id'), 'notes', ['id'], unique=False)
    op.create_index(op.f('ix_notes_related_to_id'), 'notes', ['related_to_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_notes_related_to_id'), table_name='notes')
    op.drop_index(op.f('ix_notes_id'), table_name='notes')
    op.drop_table('notes')
