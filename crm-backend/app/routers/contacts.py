"""Contacts CRUD router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Contact, Note, Activity, Deal, StageChange, User
from app.schemas import (
    ContactCreate, ContactUpdate, ContactResponse,
    TimelineEvent, TimelineEventType, NoteResponse,
    ActivityResponse, StageChangeResponse, AssignOwner
)
from app.auth import get_current_active_user, check_permissions

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])


@router.post("/", response_model=ContactResponse, status_code=201)
def create_contact(
    contact: ContactCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new contact."""
    if not check_permissions(current_user, "contacts.create"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    existing = db.query(Contact).filter(Contact.email == contact.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="A contact with this email already exists")

    # Fixed: exclude owner_id from model_dump to avoid multiple values error
    contact_data = contact.model_dump(exclude={"owner_id"})
    
    db_contact = Contact(**contact_data, owner_id=current_user.id)
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
    current_user: User = Depends(get_current_active_user)
):
    """List all contacts with optional search and pagination."""
    if not check_permissions(current_user, "contacts.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

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
def get_contact(
    contact_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single contact by ID."""
    if not check_permissions(current_user, "contacts.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int, 
    updates: ContactUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing contact."""
    if not check_permissions(current_user, "contacts.update"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

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
def delete_contact(
    contact_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a contact and all associated deals and activities."""
    # Assuming delete permission is needed. Admin has '*', Sales Rep usually doesn't have delete in seed.
    # I'll check for 'contacts.delete' explicitly.
    # Note: Admin's '*' check in auth.py handles this if I require 'contacts.delete'.
    if not check_permissions(current_user, "contacts.delete"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()


@router.put("/{contact_id}/assign", response_model=ContactResponse)
def assign_contact_owner(
    contact_id: int, 
    assign: AssignOwner, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Assign a user as owner of the contact."""
    if not check_permissions(current_user, "contacts.update"):
         raise HTTPException(status_code=403, detail="Not enough privileges")
    
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    new_owner = db.query(User).filter(User.id == assign.user_id).first()
    if not new_owner:
        raise HTTPException(status_code=404, detail="User not found")
        
    old_owner_id = contact.owner_id
    contact.owner_id = new_owner.id
    
    # Log the change
    db_note = Note(
        content=f"Owner changed from {old_owner_id} to {new_owner.id} by {current_user.email}",
        related_to_type="contact",
        related_to_id=contact.id,
        created_by=current_user.id
    )
    db.add(db_note)
    
    db.commit()
    db.refresh(contact)
    return contact


@router.get("/{contact_id}/timeline", response_model=list[TimelineEvent])
def get_contact_timeline(
    contact_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a unified timeline of events for a contact."""
    if not check_permissions(current_user, "contacts.read"): # Or timeline.read?
        raise HTTPException(status_code=403, detail="Not enough privileges")

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    events = []

    # 1. Notes
    notes = db.query(Note).filter(
        Note.related_to_type == "contact",
        Note.related_to_id == contact_id
    ).all()
    for note in notes:
        events.append({
            "id": note.id,
            "type": TimelineEventType.note,
            "timestamp": note.created_at,
            "data": NoteResponse.model_validate(note).model_dump()
        })

    # 2. Activities
    activities = db.query(Activity).filter(Activity.contact_id == contact_id).all()
    for activity in activities:
        events.append({
            "id": activity.id,
            "type": TimelineEventType.activity,
            "timestamp": activity.date,
            "data": ActivityResponse.model_validate(activity).model_dump()
        })

    # 3. Stage Changes (via Deals)
    deals = db.query(Deal).filter(Deal.contact_id == contact_id).all()
    deal_ids = [d.id for d in deals]
    if deal_ids:
        stage_changes = db.query(StageChange).filter(StageChange.deal_id.in_(deal_ids)).all()
        for change in stage_changes:
            events.append({
                "id": change.id,
                "type": TimelineEventType.stage_change,
                "timestamp": change.changed_at,
                "data": StageChangeResponse.model_validate(change).model_dump()
            })

    # Sort by timestamp descending
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return events
