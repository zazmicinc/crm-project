"""Pydantic schemas for request validation and response serialization."""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ── Enums ────────────────────────────────────────────────────────────────────


class DealStage(str, Enum):
    prospecting = "prospecting"
    qualification = "qualification"
    proposal = "proposal"
    negotiation = "negotiation"
    closed_won = "closed_won"
    closed_lost = "closed_lost"


class ActivityType(str, Enum):
    call = "call"
    email = "email"
    meeting = "meeting"


# ── Account Schemas ──────────────────────────────────────────────────────────


class AccountBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, examples=["Acme Corp"])
    industry: Optional[str] = Field(None, max_length=255, examples=["Technology"])
    website: Optional[str] = Field(None, max_length=255, examples=["https://acme.com"])
    phone: Optional[str] = Field(None, max_length=50, examples=["+1-555-0100"])
    email: Optional[EmailStr] = Field(None, examples=["contact@acme.com"])
    address: Optional[str] = Field(None, examples=["123 Main St"])


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    industry: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    address: Optional[str] = None


class AccountResponse(AccountBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


# ── Contact Schemas ──────────────────────────────────────────────────────────


class ContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane@example.com"])
    phone: Optional[str] = Field(None, max_length=50, examples=["+1-555-0100"])
    company: Optional[str] = Field(None, max_length=255, examples=["Acme Corp"])
    notes: Optional[str] = Field(None, examples=["Met at conference"])
    account_id: Optional[int] = Field(None, examples=[1])


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    company: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    account_id: Optional[int] = None


class ContactResponse(ContactBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    account_name: Optional[str] = None


# ── Deal Schemas ─────────────────────────────────────────────────────────────


class DealBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, examples=["Enterprise Plan"])
    value: float = Field(..., ge=0, examples=[15000.0])
    stage: DealStage = Field(DealStage.prospecting, examples=["prospecting"])
    contact_id: int = Field(..., examples=[1])
    account_id: Optional[int] = Field(None, examples=[1])


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    value: Optional[float] = Field(None, ge=0)
    stage: Optional[DealStage] = None
    contact_id: Optional[int] = None
    account_id: Optional[int] = None


class DealResponse(DealBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    account_name: Optional[str] = None


# ── Activity Schemas ─────────────────────────────────────────────────────────


class ActivityBase(BaseModel):
    type: ActivityType = Field(..., examples=["call"])
    subject: str = Field(..., min_length=1, max_length=255, examples=["Follow-up call"])
    description: Optional[str] = Field(None, examples=["Discussed pricing options"])
    date: Optional[datetime] = Field(None, examples=["2026-02-17T10:00:00"])
    contact_id: int = Field(..., examples=[1])


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    type: Optional[ActivityType] = None
    subject: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    date: Optional[datetime] = None
    contact_id: Optional[int] = None


class ActivityResponse(ActivityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date: datetime
    created_at: datetime
