"""Global search router."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import Lead, Contact, Account, Deal, User
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/search", tags=["Search"])

@router.get("/")
def global_search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search across multiple entities."""
    search_term = f"%{q}%"
    
    results = []
    
    # 1. Search Leads
    leads = db.query(Lead).filter(
        or_(
            Lead.first_name.ilike(search_term),
            Lead.last_name.ilike(search_term),
            Lead.email.ilike(search_term),
            Lead.company.ilike(search_term)
        )
    ).limit(5).all()
    for l in leads:
        results.append({
            "type": "lead",
            "id": l.id,
            "title": f"{l.first_name} {l.last_name}",
            "subtitle": l.company or l.email,
            "status": l.status
        })

    # 2. Search Contacts
    contacts = db.query(Contact).filter(
        or_(
            Contact.name.ilike(search_term),
            Contact.email.ilike(search_term),
            Contact.company.ilike(search_term)
        )
    ).limit(5).all()
    for c in contacts:
        results.append({
            "type": "contact",
            "id": c.id,
            "title": c.name,
            "subtitle": c.company or c.email
        })

    # 3. Search Accounts
    accounts = db.query(Account).filter(
        or_(
            Account.name.ilike(search_term),
            Account.industry.ilike(search_term),
            Account.email.ilike(search_term)
        )
    ).limit(5).all()
    for a in accounts:
        results.append({
            "type": "account",
            "id": a.id,
            "title": a.name,
            "subtitle": a.industry
        })

    # 4. Search Deals
    deals = db.query(Deal).filter(
        or_(
            Deal.title.ilike(search_term),
            Deal.stage.ilike(search_term)
        )
    ).limit(5).all()
    for d in deals:
        results.append({
            "type": "deal",
            "id": d.id,
            "title": d.title,
            "subtitle": f"Value: ${d.value:,.0f}",
            "status": d.stage
        })

    return results
