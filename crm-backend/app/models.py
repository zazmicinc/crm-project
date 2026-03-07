"""SQLAlchemy ORM models for the CRM system."""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum, Boolean, JSON, Table
from sqlalchemy.orm import relationship

from app.database import Base


# Association table for deal ↔ contact (many-to-many)
deal_contacts = Table(
    "deal_contacts",
    Base.metadata,
    Column("deal_id", Integer, ForeignKey("deals.id"), primary_key=True),
    Column("contact_id", Integer, ForeignKey("contacts.id"), primary_key=True),
    Column("role", String(100), nullable=True),
)


class Role(Base):
    """User role with permissions."""

    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    permissions = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    users = relationship("User", back_populates="role")


class User(Base):
    """System user."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=True)
    auth_provider = Column(String(50), nullable=False, server_default="local", default="local")
    provider_id = Column(String(255), nullable=True, unique=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    role = relationship("Role", back_populates="users")
    contacts = relationship("Contact", back_populates="owner")
    deals = relationship("Deal", back_populates="owner")
    accounts = relationship("Account", back_populates="owner")
    leads = relationship("Lead", back_populates="owner")


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
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="accounts")
    contacts = relationship("Contact", back_populates="account")
    deals = relationship("Deal", back_populates="account")
    activities = relationship("Activity", back_populates="account", cascade="all, delete-orphan")


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
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="contacts")
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
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    close_date = Column(DateTime, nullable=True)
    probability_override = Column(Integer, nullable=True)
    loss_reason = Column(String(255), nullable=True)
    loss_reason_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="deals")
    contact = relationship("Contact", back_populates="deals")
    account = relationship("Account", back_populates="deals")
    pipeline = relationship("Pipeline", back_populates="deals")
    stage_rel = relationship("Stage", back_populates="deals", foreign_keys=[stage_id])
    stage_history = relationship("StageChange", back_populates="deal", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="deal", cascade="all, delete-orphan")
    related_contacts = relationship("Contact", secondary="deal_contacts", lazy="select")
    line_items = relationship("DealLineItem", back_populates="deal", cascade="all, delete-orphan")

    @property
    def effective_probability(self):
        if self.probability_override is not None:
            return self.probability_override
        if self.stage_rel is not None:
            return self.stage_rel.probability
        return None

    @property
    def account_name(self):
        return self.account.name if self.account else None

    @property
    def contact_name(self):
        return self.contact.name if self.contact else None


class Activity(Base):
    """An activity log entry (call, email, meeting) linked to an entity."""

    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(
        Enum("call", "email", "meeting", name="activity_type"),
        nullable=False,
    )
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    contact = relationship("Contact", back_populates="activities")
    deal = relationship("Deal", back_populates="activities")
    lead = relationship("Lead", back_populates="activities")
    account = relationship("Account", back_populates="activities")


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
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
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

    owner = relationship("User", back_populates="leads")
    contact = relationship("Contact", foreign_keys=[converted_to_contact_id])
    account = relationship("Account", foreign_keys=[converted_to_account_id])
    deal = relationship("Deal", foreign_keys=[converted_to_deal_id])
    activities = relationship("Activity", back_populates="lead", cascade="all, delete-orphan")


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


class Product(Base):
    """A product or service that can be added to deals."""

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    unit_price = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="USD")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    line_items = relationship("DealLineItem", back_populates="product")


class DealLineItem(Base):
    """A line item linking a product to a deal."""

    __tablename__ = "deal_line_items"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False, default=1.0)
    unit_price_override = Column(Float, nullable=True)
    discount_pct = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    deal = relationship("Deal", back_populates="line_items")
    product = relationship("Product", back_populates="line_items")

    @property
    def subtotal(self):
        price = self.unit_price_override if self.unit_price_override is not None else self.product.unit_price
        return price * self.quantity * (1 - self.discount_pct / 100)


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
