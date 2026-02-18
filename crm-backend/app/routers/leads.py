"""Leads CRUD and Conversion router."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lead, Contact, Account, Deal
from app.schemas import (
    LeadCreate, LeadUpdate, LeadResponse, LeadStatus,
    ContactCreate, AccountCreate, DealCreate, DealStage, LeadConvert
)

router = APIRouter(prefix="/api/leads", tags=["Leads"])


@router.post("/", response_model=LeadResponse, status_code=201)
def create_lead(lead: LeadCreate, response: Response, db: Session = Depends(get_db)):
    """
    Create a new lead.
    Duplicate detection: checks email and phone.
    Returns 409 with duplicate: true if found.
    """
    # Duplicate detection
    query = db.query(Lead).filter(
        or_(
            Lead.email == lead.email,
            (Lead.phone == lead.phone) & (Lead.phone.isnot(None))
        )
    )
    existing = query.first()
    if existing:
        # Return 409 Conflict with details
        return Response(
            status_code=409,
            content=f'{{"detail": "Lead already exists", "duplicate": true, "id": {existing.id}}}',
            media_type="application/json"
        )

    db_lead = Lead(**lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


@router.get("/", response_model=list[LeadResponse])
def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: LeadStatus = Query(None),
    search: str = Query(None, description="Search by name, email, or company"),
    db: Session = Depends(get_db),
):
    """List all leads with optional filtering and search."""
    query = db.query(Lead)
    
    if status:
        query = query.filter(Lead.status == status)
        
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Lead.first_name.ilike(pattern),
                Lead.last_name.ilike(pattern),
                Lead.email.ilike(pattern),
                Lead.company.ilike(pattern)
            )
        )
        
    return query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    """Get a single lead by ID."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: int, updates: LeadUpdate, db: Session = Depends(get_db)):
    """Update an existing lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    update_data = updates.model_dump(exclude_unset=True)

    # If updating email/phone, check for duplicates (excluding self)
    if "email" in update_data or "phone" in update_data:
        email = update_data.get("email", lead.email)
        phone = update_data.get("phone", lead.phone)
        
        query = db.query(Lead).filter(
            or_(
                Lead.email == email,
                (Lead.phone == phone) & (Lead.phone.isnot(None))
            ),
            Lead.id != lead_id
        )
        if query.first():
             raise HTTPException(status_code=400, detail="Another lead with this email or phone already exists")

    for field, value in update_data.items():
        setattr(lead, field, value)

    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{lead_id}", status_code=204)
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    """Delete a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    db.delete(lead)
    db.commit()


@router.post("/{lead_id}/convert", status_code=200)
def convert_lead(lead_id: int, overrides: LeadConvert = LeadConvert(), db: Session = Depends(get_db)):
    """
    Convert a lead into a Contact, Account, and Deal.
    Atomic transaction: if any step fails, rollback all.
    Accepts optional overrides for contact, account, and deal details.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if lead.status == LeadStatus.Converted:
        raise HTTPException(status_code=400, detail="Lead is already converted")

    try:
        # 1. Create Account
        # Use company name or fallback to Lead's name if individual
        account_name = lead.company or f"{lead.first_name} {lead.last_name}"
        account_data = {
            "name": account_name,
            "phone": lead.phone,
            "email": lead.email,
            "industry": None,
            "website": None,
            "address": None
        }
        if overrides.account:
            account_data.update(overrides.account.model_dump(exclude_unset=True))

        account = Account(**account_data)
        db.add(account)
        db.flush() # Get ID

        # 2. Create Contact
        contact_name = f"{lead.first_name} {lead.last_name}"
        contact_data = {
            "name": contact_name,
            "email": lead.email,
            "phone": lead.phone,
            "company": lead.company,
            "notes": f"Converted from Lead #{lead.id}",
            "account_id": account.id
        }
        if overrides.contact:
            contact_data.update(overrides.contact.model_dump(exclude_unset=True))
            
        contact = Contact(**contact_data)
        db.add(contact)
        db.flush()

        # 3. Create Deal
        deal_data = {
            "title": f"{account_name} Deal",
            "value": 0.0,
            "stage": DealStage.prospecting,
            "contact_id": contact.id,
            "account_id": account.id
        }
        if overrides.deal:
            deal_data.update(overrides.deal.model_dump(exclude_unset=True))

        deal = Deal(**deal_data)
        db.add(deal)
        db.flush()

        # 4. Update Lead
        lead.status = LeadStatus.Converted
        lead.converted_at = datetime.now(timezone.utc)
        lead.converted_to_account_id = account.id
        lead.converted_to_contact_id = contact.id
        lead.converted_to_deal_id = deal.id
        
        db.commit()
        db.refresh(lead)

        return {
            "lead_id": lead.id,
            "contact_id": contact.id,
            "account_id": account.id,
            "deal_id": deal.id,
            "status": "success"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")
