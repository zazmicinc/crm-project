"""Contacts CRUD router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Contact
from app.schemas import ContactCreate, ContactUpdate, ContactResponse

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])


@router.post("/", response_model=ContactResponse, status_code=201)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    """Create a new contact."""
    existing = db.query(Contact).filter(Contact.email == contact.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="A contact with this email already exists")

    db_contact = Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.get("/", response_model=list[ContactResponse])
def list_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: str = Query(None, description="Search by name, email, or company"),
    db: Session = Depends(get_db),
):
    """List all contacts with optional search and pagination."""
    query = db.query(Contact)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            Contact.name.ilike(pattern)
            | Contact.email.ilike(pattern)
            | Contact.company.ilike(pattern)
        )
    return query.order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """Get a single contact by ID."""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: int, updates: ContactUpdate, db: Session = Depends(get_db)):
    """Update an existing contact."""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    update_data = updates.model_dump(exclude_unset=True)

    # Check email uniqueness if email is being changed
    if "email" in update_data and update_data["email"] != contact.email:
        existing = db.query(Contact).filter(Contact.email == update_data["email"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="A contact with this email already exists")

    for field, value in update_data.items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/{contact_id}", status_code=204)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """Delete a contact and all associated deals and activities."""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()
