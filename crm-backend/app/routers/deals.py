"""Deals CRUD router."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Deal, Contact, Pipeline, Stage, StageChange, Note, Activity, User
from app.schemas import (
    DealCreate, DealUpdate, DealResponse,
    DealMove, StageChangeResponse, TimelineEvent, TimelineEventType,
    NoteResponse, ActivityResponse, AssignOwner
)
from app.auth import get_current_active_user, check_permissions

router = APIRouter(prefix="/api/deals", tags=["Deals"])


@router.post("/", response_model=DealResponse, status_code=201)
def create_deal(
    deal: DealCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new deal.
    If no pipeline/stage is specified, assigns the default pipeline's first stage.
    """
    if not check_permissions(current_user, "deals.create"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    contact = db.query(Contact).filter(Contact.id == deal.contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    deal_data = deal.model_dump(exclude={"owner_id"})

    # Assign default pipeline/stage if not provided
    if not deal_data.get("pipeline_id") or not deal_data.get("stage_id"):
        default_pipeline = db.query(Pipeline).filter(Pipeline.is_default == True).first()
        # Fallback to first pipeline if no default
        if not default_pipeline:
            default_pipeline = db.query(Pipeline).order_by(Pipeline.id).first()
        
        if default_pipeline:
            deal_data["pipeline_id"] = default_pipeline.id
            if not deal_data.get("stage_id"):
                first_stage = db.query(Stage).filter(Stage.pipeline_id == default_pipeline.id).order_by(Stage.order).first()
                if first_stage:
                    deal_data["stage_id"] = first_stage.id

    db_deal = Deal(**deal_data, owner_id=current_user.id)
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal


@router.get("/", response_model=list[DealResponse])
def list_deals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    stage: str = Query(None, description="Filter by deal stage (enum or ID logic tbd)"),
    contact_id: int = Query(None, description="Filter by contact ID"),
    search: str = Query(None, description="Search by title"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all deals with optional filtering."""
    if not check_permissions(current_user, "deals.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    query = db.query(Deal).join(Contact, isouter=True)
    if stage:
        query = query.filter(Deal.stage == stage)
    if contact_id:
        query = query.filter(Deal.contact_id == contact_id)
    if search:
        query = query.filter(Deal.title.ilike(f"%{search}%"))
    return query.order_by(Deal.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(
    deal_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single deal by ID."""
    if not check_permissions(current_user, "deals.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(
    deal_id: int, 
    updates: DealUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing deal."""
    if not check_permissions(current_user, "deals.update"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    update_data = updates.model_dump(exclude_unset=True)
    
    if "contact_id" in update_data:
        contact = db.query(Contact).filter(Contact.id == update_data["contact_id"]).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")

    for field, value in update_data.items():
        setattr(deal, field, value)

    db.commit()
    db.refresh(deal)
    return deal


@router.delete("/{deal_id}", status_code=204)
def delete_deal(
    deal_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a deal."""
    # Check for specific delete permission
    if not check_permissions(current_user, "deals.delete"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    db.delete(deal)
    db.commit()


@router.post("/{deal_id}/move", status_code=200)
def move_deal(
    deal_id: int, 
    move: DealMove, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Move deal to a new stage and record history."""
    if not check_permissions(current_user, "deals.move"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    new_stage = db.query(Stage).filter(Stage.id == move.stage_id).first()
    if not new_stage:
        raise HTTPException(status_code=404, detail="Target stage not found")

    old_stage_id = deal.stage_id
    
    # Update Deal
    deal.stage_id = new_stage.id
    deal.pipeline_id = new_stage.pipeline_id 
    
    # Create History Record
    change = StageChange(
        deal_id=deal.id,
        from_stage_id=old_stage_id,
        to_stage_id=new_stage.id,
        changed_at=datetime.now(timezone.utc),
        changed_by=current_user.id
    )
    db.add(change)
    
    db.commit()
    return {"status": "moved", "new_stage_id": new_stage.id}


@router.put("/{deal_id}/assign", response_model=DealResponse)
def assign_deal_owner(
    deal_id: int, 
    assign: AssignOwner, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    """Assign a user as owner of the deal."""
    if not check_permissions(current_user, "deals.update"):
         raise HTTPException(status_code=403, detail="Not enough privileges")
    
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
        
    new_owner = db.query(User).filter(User.id == assign.user_id).first()
    if not new_owner:
        raise HTTPException(status_code=404, detail="User not found")
        
    old_owner_id = deal.owner_id
    deal.owner_id = new_owner.id

    # Log change
    db_note = Note(
        content=f"Owner changed from {old_owner_id} to {new_owner.id} by {current_user.email}",
        related_to_type="deal",
        related_to_id=deal.id,
        created_by=current_user.id
    )
    db.add(db_note)
    
    db.commit()
    db.refresh(deal)
    return deal


@router.get("/{deal_id}/stage-history", response_model=list[StageChangeResponse])
def get_deal_stage_history(
    deal_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get stage history for a deal."""
    if not check_permissions(current_user, "deals.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
        
    return db.query(StageChange).filter(StageChange.deal_id == deal_id).order_by(StageChange.changed_at.desc()).all()


@router.get("/{deal_id}/timeline", response_model=list[TimelineEvent])
def get_deal_timeline(
    deal_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a unified timeline of events for a deal."""
    if not check_permissions(current_user, "deals.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    events = []

    # 1. Notes
    notes = db.query(Note).filter(
        Note.related_to_type == "deal",
        Note.related_to_id == deal_id
    ).all()
    for note in notes:
        events.append({
            "id": note.id,
            "type": TimelineEventType.note,
            "timestamp": note.created_at,
            "data": NoteResponse.model_validate(note).model_dump()
        })

    # 2. Activities (Directly linked to deal, added in Phase 5)
    activities = db.query(Activity).filter(Activity.deal_id == deal_id).all()
    for activity in activities:
        events.append({
            "id": activity.id,
            "type": TimelineEventType.activity,
            "timestamp": activity.date,
            "data": ActivityResponse.model_validate(activity).model_dump()
        })

    # 3. Stage Changes
    stage_changes = db.query(StageChange).filter(StageChange.deal_id == deal_id).all()
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
