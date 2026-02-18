"""Add Pipeline and Stage models.

Revision ID: 004_add_pipelines
Revises: 003_add_leads
Create Date: 2026-02-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004_add_pipelines'
down_revision: Union[str, None] = '003_add_leads'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Pipelines ────────────────────────────────────────────────────
    op.create_table(
        'pipelines',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('is_default', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_pipelines_id'), 'pipelines', ['id'], unique=False)

    # ── Stages ───────────────────────────────────────────────────────
    op.create_table(
        'stages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('pipeline_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('order', sa.Integer(), nullable=False),
        sa.Column('probability', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['pipeline_id'], ['pipelines.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stages_id'), 'stages', ['id'], unique=False)

    # ── Update Deals ─────────────────────────────────────────────────
    with op.batch_alter_table('deals', schema=None) as batch_op:
        batch_op.add_column(sa.Column('pipeline_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('stage_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_deals_pipelines', 'pipelines', ['pipeline_id'], ['id'])
        batch_op.create_foreign_key('fk_deals_stages', 'stages', ['stage_id'], ['id'])

    # ── Stage Changes ────────────────────────────────────────────────
    op.create_table(
        'stage_changes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('deal_id', sa.Integer(), nullable=False),
        sa.Column('from_stage_id', sa.Integer(), nullable=True),
        sa.Column('to_stage_id', sa.Integer(), nullable=False),
        sa.Column('changed_at', sa.DateTime(), nullable=True),
        sa.Column('changed_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['deal_id'], ['deals.id'], ),
        sa.ForeignKeyConstraint(['from_stage_id'], ['stages.id'], ),
        sa.ForeignKeyConstraint(['to_stage_id'], ['stages.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stage_changes_id'), 'stage_changes', ['id'], unique=False)


def downgrade() -> None:
    # ── Drop Stage Changes ───────────────────────────────────────────
    op.drop_index(op.f('ix_stage_changes_id'), table_name='stage_changes')
    op.drop_table('stage_changes')

    # ── Revert Deals ─────────────────────────────────────────────────
    with op.batch_alter_table('deals', schema=None) as batch_op:
        batch_op.drop_constraint('fk_deals_stages', type_='foreignkey')
        batch_op.drop_constraint('fk_deals_pipelines', type_='foreignkey')
        batch_op.drop_column('stage_id')
        batch_op.drop_column('pipeline_id')

    # ── Drop Stages ──────────────────────────────────────────────────
    op.drop_index(op.f('ix_stages_id'), table_name='stages')
    op.drop_table('stages')

    # ── Drop Pipelines ───────────────────────────────────────────────
    op.drop_index(op.f('ix_pipelines_id'), table_name='pipelines')
    op.drop_table('pipelines')
