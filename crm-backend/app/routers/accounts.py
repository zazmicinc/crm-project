"""Accounts CRUD router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Account, Contact, Deal
from app.schemas import (
    AccountCreate, AccountUpdate, AccountResponse,
    ContactResponse, DealResponse
)

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


@router.post("/", response_model=AccountResponse, status_code=201)
def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    """Create a new account."""
    # Optional: Check for duplicates by name or email if desired, 
    # but strictly not required by prompt.
    db_account = Account(**account.model_dump())
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
):
    """List all accounts with optional search and pagination."""
    query = db.query(Account)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            Account.name.ilike(pattern)
            | Account.industry.ilike(pattern)
        )
    return query.order_by(Account.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    """Get a single account by ID."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, updates: AccountUpdate, db: Session = Depends(get_db)):
    """Update an existing account."""
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
def delete_account(account_id: int, db: Session = Depends(get_db)):
    """Delete an account and cascade delete logic (if configured)."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    db.delete(account)
    db.commit()


@router.get("/{account_id}/contacts", response_model=list[ContactResponse])
def get_account_contacts(account_id: int, db: Session = Depends(get_db)):
    """List all contacts under this account."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return account.contacts


@router.get("/{account_id}/deals", response_model=list[DealResponse])
def get_account_deals(account_id: int, db: Session = Depends(get_db)):
    """List all deals under this account."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return account.deals
