"""Shared SQLAlchemy models for CRM database — used by Alembic and seed script."""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    industry = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    contacts = relationship("Contact", back_populates="account")
    deals = relationship("Deal", back_populates="account")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True, index=True)
    notes = Column(Text, nullable=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    account = relationship("Account", back_populates="contacts")
    deals = relationship("Deal", back_populates="contact", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="contact", cascade="all, delete-orphan")


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    value = Column(Float, nullable=False, default=0.0)
    stage = Column(
        Enum("prospecting", "qualification", "proposal", "negotiation",
             "closed_won", "closed_lost", name="deal_stage"),
        nullable=False,
        default="prospecting",
    )
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    contact = relationship("Contact", back_populates="deals")
    account = relationship("Account", back_populates="deals")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(
        Enum("call", "email", "meeting", name="activity_type"),
        nullable=False,
    )
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    contact = relationship("Contact", back_populates="activities")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    status = Column(
        Enum("New", "Contacted", "Qualified", "Converted", "Dead", name="lead_status"),
        nullable=False,
        default="New",
    )
    source = Column(String(255), nullable=True)
    owner_id = Column(Integer, nullable=True)
    converted_at = Column(DateTime, nullable=True)
    converted_to_contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    converted_to_account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    converted_to_deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    contact = relationship("Contact", foreign_keys=[converted_to_contact_id])
    account = relationship("Account", foreign_keys=[converted_to_account_id])
    deal = relationship("Deal", foreign_keys=[converted_to_deal_id])
