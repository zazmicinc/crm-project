"""SQLAlchemy ORM models for the CRM system."""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.database import Base


class Account(Base):
    """A business account representing a company or organization."""

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
    """A CRM contact representing a person or lead."""

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
    activities = relationship(
        "Activity", back_populates="contact", cascade="all, delete-orphan"
    )

    @property
    def account_name(self):
        return self.account.name if self.account else None


class Deal(Base):
    """A sales deal/opportunity linked to a contact."""

    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    value = Column(Float, nullable=False, default=0.0)
    stage = Column(
        Enum(
            "prospecting",
            "qualification",
            "proposal",
            "negotiation",
            "closed_won",
            "closed_lost",
            name="deal_stage",
        ),
        nullable=False,
        default="prospecting",
    )
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    pipeline_id = Column(Integer, ForeignKey("pipelines.id"), nullable=True)
    stage_id = Column(Integer, ForeignKey("stages.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    contact = relationship("Contact", back_populates="deals")
    account = relationship("Account", back_populates="deals")
    pipeline = relationship("Pipeline", back_populates="deals")
    stage_rel = relationship("Stage", back_populates="deals", foreign_keys=[stage_id])
    stage_history = relationship("StageChange", back_populates="deal", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="deal", cascade="all, delete-orphan")

    @property
    def account_name(self):
        return self.account.name if self.account else None


class Activity(Base):
    """An activity log entry (call, email, meeting) linked to a contact."""

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
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    contact = relationship("Contact", back_populates="activities")
    deal = relationship("Deal", back_populates="activities")


class Lead(Base):
    """A potential customer or prospect."""

    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    status = Column(
        Enum(
            "New",
            "Contacted",
            "Qualified",
            "Converted",
            "Dead",
            name="lead_status",
        ),
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


class Pipeline(Base):
    """A sales pipeline containing multiple stages."""

    __tablename__ = "pipelines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    is_default = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    stages = relationship("Stage", back_populates="pipeline", order_by="Stage.order", cascade="all, delete-orphan")
    deals = relationship("Deal", back_populates="pipeline")


class Stage(Base):
    """A stage within a sales pipeline."""

    __tablename__ = "stages"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_id = Column(Integer, ForeignKey("pipelines.id"), nullable=False)
    name = Column(String(255), nullable=False)
    order = Column(Integer, nullable=False, default=0)
    probability = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    pipeline = relationship("Pipeline", back_populates="stages")
    deals = relationship("Deal", back_populates="stage_rel")


class StageChange(Base):
    """Record of a deal moving between stages."""

    __tablename__ = "stage_changes"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=False)
    from_stage_id = Column(Integer, ForeignKey("stages.id"), nullable=True)
    to_stage_id = Column(Integer, ForeignKey("stages.id"), nullable=False)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    changed_by = Column(Integer, nullable=True)

    deal = relationship("Deal", back_populates="stage_history")
    from_stage = relationship("Stage", foreign_keys=[from_stage_id])
    to_stage = relationship("Stage", foreign_keys=[to_stage_id])

    @property
    def from_stage_name(self):
        return self.from_stage.name if self.from_stage else None

    @property
    def to_stage_name(self):
        return self.to_stage.name if self.to_stage else None


class Note(Base):
    """A text note linked to any entity."""

    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    related_to_type = Column(
        Enum("contact", "deal", "lead", "account", name="related_to_type"),
        nullable=False,
    )
    related_to_id = Column(Integer, nullable=False, index=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
