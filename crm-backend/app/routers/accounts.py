"""Accounts CRUD router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Account, Contact, Deal, User, Note, Activity
from app.schemas import (
    AccountCreate, AccountUpdate, AccountResponse,
    ContactResponse, DealResponse, AssignOwner,
    TimelineEvent, TimelineEventType, NoteResponse, ActivityResponse
)
from app.auth import get_current_active_user, check_permissions

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


@router.post("/", response_model=AccountResponse, status_code=201)
def create_account(
    account: AccountCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new account."""
    if not check_permissions(current_user, "accounts.create"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    db_account = Account(**account.model_dump(exclude={"owner_id"}), owner_id=current_user.id)
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


@router.get("/", response_model=list[AccountResponse])
def list_accounts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: str = Query(None, description="Search by name or industry"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all accounts with optional search and pagination."""
    if not check_permissions(current_user, "accounts.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    query = db.query(Account)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            Account.name.ilike(pattern)
            | Account.industry.ilike(pattern)
        )
    return query.order_by(Account.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single account by ID."""
    if not check_permissions(current_user, "accounts.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int, 
    updates: AccountUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing account."""
    if not check_permissions(current_user, "accounts.update"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    update_data = updates.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(account, field, value)

    db.commit()
    db.refresh(account)
    return account


@router.delete("/{account_id}", status_code=204)
def delete_account(
    account_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an account and cascade delete logic (if configured)."""
    if not check_permissions(current_user, "accounts.delete"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    db.delete(account)
    db.commit()


@router.put("/{account_id}/assign", response_model=AccountResponse)
def assign_account_owner(
    account_id: int, 
    assign: AssignOwner, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Assign a user as owner of the account."""
    if not check_permissions(current_user, "accounts.update"):
         raise HTTPException(status_code=403, detail="Not enough privileges")
    
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    new_owner = db.query(User).filter(User.id == assign.user_id).first()
    if not new_owner:
        raise HTTPException(status_code=404, detail="User not found")
        
    old_owner_id = account.owner_id
    account.owner_id = new_owner.id
    
    # Log the change
    db_note = Note(
        content=f"Owner changed from {old_owner_id} to {new_owner.id} by {current_user.email}",
        related_to_type="account",
        related_to_id=account.id,
        created_by=current_user.id
    )
    db.add(db_note)
    
    db.commit()
    db.refresh(account)
    return account


@router.get("/{account_id}/contacts", response_model=list[ContactResponse])
def get_account_contacts(
    account_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all contacts under this account."""
    if not check_permissions(current_user, "accounts.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return account.contacts


@router.get("/{account_id}/deals", response_model=list[DealResponse])
def get_account_deals(
    account_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all deals under this account."""
    if not check_permissions(current_user, "accounts.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return account.deals


@router.get("/{account_id}/timeline", response_model=list[TimelineEvent])
def get_account_timeline(
    account_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a unified timeline of events for an account."""
    if not check_permissions(current_user, "accounts.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    events = []

    # 1. Notes
    notes = db.query(Note).filter(
        Note.related_to_type == "account",
        Note.related_to_id == account_id
    ).all()
    for note in notes:
        events.append({
            "id": note.id,
            "type": TimelineEventType.note,
            "timestamp": note.created_at,
            "data": NoteResponse.model_validate(note).model_dump()
        })

    # 2. Activities
    activities = db.query(Activity).filter(Activity.account_id == account_id).all()
    for activity in activities:
        events.append({
            "id": activity.id,
            "type": TimelineEventType.activity,
            "timestamp": activity.date,
            "data": ActivityResponse.model_validate(activity).model_dump()
        })

    # Sort by timestamp descending
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return events
