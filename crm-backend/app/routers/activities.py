"""Activities CRUD router."""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Activity, Contact, Lead, Deal, Account, User
from app.schemas import ActivityCreate, ActivityUpdate, ActivityResponse
from app.auth import get_current_active_user, check_permissions

router = APIRouter(prefix="/api/activities", tags=["Activities"])


def _validate_relations(db: Session, activity: ActivityCreate | dict) -> None:
    """Validate that at least one relation exists and entities exist."""
    if isinstance(activity, ActivityCreate):
        data = activity.model_dump()
    else:
        data = activity

    cid = data.get("contact_id")
    lid = data.get("lead_id")
    did = data.get("deal_id")
    aid = data.get("account_id")

    if cid and not db.query(Contact).filter(Contact.id == cid).first():
        raise HTTPException(status_code=404, detail="Associated contact not found")
    if lid and not db.query(Lead).filter(Lead.id == lid).first():
        raise HTTPException(status_code=404, detail="Associated lead not found")
    if did and not db.query(Deal).filter(Deal.id == did).first():
        raise HTTPException(status_code=404, detail="Associated deal not found")
    if aid and not db.query(Account).filter(Account.id == aid).first():
        raise HTTPException(status_code=404, detail="Associated account not found")


@router.post("/", response_model=ActivityResponse, status_code=201)
def create_activity(
    activity: ActivityCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Log a new activity linked to a contact, lead, deal, or account."""
    if not check_permissions(current_user, "activities.create"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    _validate_relations(db, activity)

    data = activity.model_dump()
    if data.get("date") is None:
        data["date"] = datetime.now(timezone.utc)

    db_activity = Activity(**data)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


@router.get("/tasks", response_model=list[ActivityResponse])
def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    assigned_to_id: Optional[int] = Query(None, description="Filter by assignee"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List tasks (activities with is_task=True)."""
    if not check_permissions(current_user, "activities.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    query = db.query(Activity).filter(Activity.is_task == True)
    if assigned_to_id:
        query = query.filter(Activity.assigned_to_id == assigned_to_id)
    if completed is True:
        query = query.filter(Activity.completed_at != None)
    elif completed is False:
        query = query.filter(Activity.completed_at == None)

    return query.order_by(Activity.due_date.asc().nulls_last()).offset(skip).limit(limit).all()


@router.get("/", response_model=list[ActivityResponse])
def list_activities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    contact_id: int | None = Query(None, description="Filter by contact"),
    lead_id: int | None = Query(None, description="Filter by lead"),
    deal_id: int | None = Query(None, description="Filter by deal"),
    account_id: int | None = Query(None, description="Filter by account"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List activities with optional filters and pagination."""
    if not check_permissions(current_user, "activities.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    query = db.query(Activity)
    if contact_id:
        query = query.filter(Activity.contact_id == contact_id)
    if lead_id:
        query = query.filter(Activity.lead_id == lead_id)
    if deal_id:
        query = query.filter(Activity.deal_id == deal_id)
    if account_id:
        query = query.filter(Activity.account_id == account_id)
        
    return query.order_by(Activity.date.desc()).offset(skip).limit(limit).all()


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(
    activity_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single activity by ID."""
    if not check_permissions(current_user, "activities.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: int, 
    updates: ActivityUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing activity."""
    if not check_permissions(current_user, "activities.update"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    update_data = updates.model_dump(exclude_unset=True)
    _validate_relations(db, update_data)

    for field, value in update_data.items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/{activity_id}", status_code=204)
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an activity."""
    if not check_permissions(current_user, "activities.delete"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()


@router.put("/{activity_id}/complete", response_model=ActivityResponse)
def complete_task(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a task as complete."""
    if not check_permissions(current_user, "activities.update"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    if not activity.is_task:
        raise HTTPException(status_code=400, detail="Activity is not a task")

    activity.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(activity)
    return activity


@router.put("/{activity_id}/reopen", response_model=ActivityResponse)
def reopen_task(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Reopen a completed task."""
    if not check_permissions(current_user, "activities.update"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    if not activity.is_task:
        raise HTTPException(status_code=400, detail="Activity is not a task")

    activity.completed_at = None
    db.commit()
    db.refresh(activity)
    return activity
