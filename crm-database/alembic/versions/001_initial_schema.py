"""Initial CRM schema — contacts, deals, activities.

Revision ID: 001_initial_schema
Revises: None
Create Date: 2026-02-17
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Contacts ─────────────────────────────────────────────────────
    op.create_table(
        "contacts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(255), nullable=False, index=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("company", sa.String(255), nullable=True, index=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    # ── Deals ────────────────────────────────────────────────────────
    op.create_table(
        "deals",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("value", sa.Float(), nullable=False, server_default="0"),
        sa.Column(
            "stage",
            sa.Enum(
                "prospecting", "qualification", "proposal",
                "negotiation", "closed_won", "closed_lost",
                name="deal_stage",
            ),
            nullable=False,
            server_default="prospecting",
        ),
        sa.Column("contact_id", sa.Integer(), sa.ForeignKey("contacts.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    # ── Activities ───────────────────────────────────────────────────
    op.create_table(
        "activities",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "type",
            sa.Enum("call", "email", "meeting", name="activity_type"),
            nullable=False,
        ),
        sa.Column("subject", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("date", sa.DateTime(), nullable=False),
        sa.Column("contact_id", sa.Integer(), sa.ForeignKey("contacts.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("activities")
    op.drop_table("deals")
    op.drop_table("contacts")
