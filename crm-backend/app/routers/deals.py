"""Deals CRUD router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Deal, Contact
from app.schemas import DealCreate, DealUpdate, DealResponse, DealStage

router = APIRouter(prefix="/api/deals", tags=["Deals"])


def _validate_contact(db: Session, contact_id: int) -> None:
    """Raise 404 if the referenced contact does not exist."""
    if not db.query(Contact).filter(Contact.id == contact_id).first():
        raise HTTPException(status_code=404, detail="Associated contact not found")


@router.post("/", response_model=DealResponse, status_code=201)
def create_deal(deal: DealCreate, db: Session = Depends(get_db)):
    """Create a new deal linked to an existing contact."""
    _validate_contact(db, deal.contact_id)

    db_deal = Deal(**deal.model_dump())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal


@router.get("/", response_model=list[DealResponse])
def list_deals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    stage: DealStage | None = Query(None, description="Filter by deal stage"),
    contact_id: int | None = Query(None, description="Filter by contact"),
    db: Session = Depends(get_db),
):
    """List deals with optional stage and contact filters."""
    query = db.query(Deal)
    if stage:
        query = query.filter(Deal.stage == stage.value)
    if contact_id:
        query = query.filter(Deal.contact_id == contact_id)
    return query.order_by(Deal.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(deal_id: int, db: Session = Depends(get_db)):
    """Get a single deal by ID."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(deal_id: int, updates: DealUpdate, db: Session = Depends(get_db)):
    """Update an existing deal."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    update_data = updates.model_dump(exclude_unset=True)

    if "contact_id" in update_data:
        _validate_contact(db, update_data["contact_id"])

    for field, value in update_data.items():
        if isinstance(value, DealStage):
            value = value.value
        setattr(deal, field, value)

    db.commit()
    db.refresh(deal)
    return deal


@router.delete("/{deal_id}", status_code=204)
def delete_deal(deal_id: int, db: Session = Depends(get_db)):
    """Delete a deal."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    db.delete(deal)
    db.commit()
