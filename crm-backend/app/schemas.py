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


class LeadStatus(str, Enum):
    New = "New"
    Contacted = "Contacted"
    Qualified = "Qualified"
    Converted = "Converted"
    Dead = "Dead"


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
    pipeline_id: Optional[int] = Field(None, examples=[1])
    stage_id: Optional[int] = Field(None, examples=[1])


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    value: Optional[float] = Field(None, ge=0)
    stage: Optional[DealStage] = None
    contact_id: Optional[int] = None
    account_id: Optional[int] = None
    pipeline_id: Optional[int] = None
    stage_id: Optional[int] = None


class DealResponse(DealBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    account_name: Optional[str] = None

    @property
    def account_name(self) -> Optional[str]:
        if hasattr(self, "account") and self.account:
            return self.account.name
        return None


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


# ── Lead Schemas ─────────────────────────────────────────────────────────────


class LeadBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=255, examples=["John"])
    last_name: str = Field(..., min_length=1, max_length=255, examples=["Doe"])
    email: EmailStr = Field(..., examples=["john.doe@example.com"])
    phone: Optional[str] = Field(None, max_length=50, examples=["+1-555-0100"])
    company: Optional[str] = Field(None, max_length=255, examples=["Acme Corp"])
    status: LeadStatus = Field(LeadStatus.New, examples=["New"])
    source: Optional[str] = Field(None, max_length=255, examples=["Website"])
    owner_id: Optional[int] = Field(None, examples=[1])


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=255)
    last_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    company: Optional[str] = Field(None, max_length=255)
    status: Optional[LeadStatus] = None
    source: Optional[str] = Field(None, max_length=255)
    owner_id: Optional[int] = None


class LeadResponse(LeadBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    converted_at: Optional[datetime] = None
    converted_to_contact_id: Optional[int] = None
    converted_to_account_id: Optional[int] = None
    converted_to_deal_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class LeadConvertContact(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None


class LeadConvertAccount(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class LeadConvertDeal(BaseModel):
    title: str
    value: float
    stage: DealStage


class LeadConvert(BaseModel):
    """Payload for converting a lead."""
    contact: Optional[LeadConvertContact] = None
    account: Optional[LeadConvertAccount] = None
    deal: Optional[LeadConvertDeal] = None


# ── Pipeline Schemas ─────────────────────────────────────────────────────────


class PipelineBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, examples=["Sales Pipeline"])
    is_default: bool = Field(False, examples=[True])


class PipelineCreate(PipelineBase):
    pass


class PipelineUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    is_default: Optional[bool] = None


class PipelineResponse(PipelineBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


# ── Stage Schemas ────────────────────────────────────────────────────────────


class StageBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, examples=["Discovery"])
    order: int = Field(0, examples=[1])
    probability: int = Field(0, ge=0, le=100, examples=[20])


class StageCreate(StageBase):
    pass


class StageUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    order: Optional[int] = None
    probability: Optional[int] = Field(None, ge=0, le=100)


class StageResponse(StageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pipeline_id: int
    created_at: datetime
    updated_at: datetime


class StageReorder(BaseModel):
    stage_ids: list[int]


# ── Stage Change Schemas ─────────────────────────────────────────────────────


class StageChangeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    deal_id: int
    from_stage_id: Optional[int]
    to_stage_id: int
    changed_at: datetime
    changed_by: Optional[int]


class DealMove(BaseModel):
    stage_id: int
