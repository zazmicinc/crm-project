"""Activities CRUD router."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Activity, Contact
from app.schemas import ActivityCreate, ActivityUpdate, ActivityResponse

router = APIRouter(prefix="/api/activities", tags=["Activities"])


def _validate_contact(db: Session, contact_id: int) -> None:
    """Raise 404 if the referenced contact does not exist."""
    if not db.query(Contact).filter(Contact.id == contact_id).first():
        raise HTTPException(status_code=404, detail="Associated contact not found")


@router.post("/", response_model=ActivityResponse, status_code=201)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    """Log a new activity linked to an existing contact."""
    _validate_contact(db, activity.contact_id)

    data = activity.model_dump()
    if data.get("date") is None:
        data["date"] = datetime.now(timezone.utc)

    db_activity = Activity(**data)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


@router.get("/", response_model=list[ActivityResponse])
def list_activities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    contact_id: int | None = Query(None, description="Filter by contact"),
    db: Session = Depends(get_db),
):
    """List activities with optional contact filter and pagination."""
    query = db.query(Activity)
    if contact_id:
        query = query.filter(Activity.contact_id == contact_id)
    return query.order_by(Activity.date.desc()).offset(skip).limit(limit).all()


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    """Get a single activity by ID."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: int, updates: ActivityUpdate, db: Session = Depends(get_db)
):
    """Update an existing activity."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    update_data = updates.model_dump(exclude_unset=True)

    if "contact_id" in update_data:
        _validate_contact(db, update_data["contact_id"])

    for field, value in update_data.items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/{activity_id}", status_code=204)
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    """Delete an activity."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()
