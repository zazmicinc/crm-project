"""Pipelines and Stages router."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Pipeline, Stage, StageChange, Deal, User
from app.schemas import (
    PipelineCreate, PipelineUpdate, PipelineResponse,
    StageCreate, StageUpdate, StageResponse, StageReorder,
    DealMove, StageChangeResponse
)
from app.auth import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/api/pipelines", tags=["Pipelines"])


# ── Pipelines CRUD ───────────────────────────────────────────────────────────


@router.post("/", response_model=PipelineResponse, status_code=201)
def create_pipeline(
    pipeline: PipelineCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new pipeline (Admin only)."""
    # If this is the first pipeline or marked default, handle default logic
    if pipeline.is_default:
        # Unset other defaults
        db.query(Pipeline).filter(Pipeline.is_default == True).update({"is_default": False})
    
    # Check uniqueness of name
    if db.query(Pipeline).filter(Pipeline.name == pipeline.name).first():
        raise HTTPException(status_code=400, detail="Pipeline with this name already exists")

    db_pipeline = Pipeline(**pipeline.model_dump())
    db.add(db_pipeline)
    db.commit()
    db.refresh(db_pipeline)
    return db_pipeline


@router.get("/", response_model=list[PipelineResponse])
def list_pipelines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all pipelines."""
    return db.query(Pipeline).order_by(Pipeline.name).all()


@router.get("/{pipeline_id}", response_model=PipelineResponse)
def get_pipeline(
    pipeline_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a pipeline by ID."""
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline


@router.put("/{pipeline_id}", response_model=PipelineResponse)
def update_pipeline(
    pipeline_id: int, 
    updates: PipelineUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a pipeline (Admin only)."""
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    update_data = updates.model_dump(exclude_unset=True)

    if "is_default" in update_data and update_data["is_default"]:
        db.query(Pipeline).filter(Pipeline.is_default == True).update({"is_default": False})

    for field, value in update_data.items():
        setattr(pipeline, field, value)

    db.commit()
    db.refresh(pipeline)
    return pipeline


@router.delete("/{pipeline_id}", status_code=204)
def delete_pipeline(
    pipeline_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a pipeline (Admin only)."""
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    db.delete(pipeline)
    db.commit()


# ── Stages CRUD ──────────────────────────────────────────────────────────────


@router.post("/{pipeline_id}/stages/", response_model=StageResponse, status_code=201)
def create_stage(
    pipeline_id: int, 
    stage: StageCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a stage in a pipeline (Admin only)."""
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    db_stage = Stage(pipeline_id=pipeline_id, **stage.model_dump())
    db.add(db_stage)
    db.commit()
    db.refresh(db_stage)
    return db_stage


@router.get("/{pipeline_id}/stages/", response_model=list[StageResponse])
def list_stages(
    pipeline_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List stages for a pipeline."""
    return db.query(Stage).filter(Stage.pipeline_id == pipeline_id).order_by(Stage.order).all()


@router.put("/{pipeline_id}/stages/reorder", status_code=204)
def reorder_stages(
    pipeline_id: int, 
    reorder: StageReorder, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Reorder stages in a pipeline (Admin only)."""
    # Verify pipeline exists
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    # Update order
    for index, stage_id in enumerate(reorder.stage_ids):
        db.query(Stage).filter(Stage.id == stage_id, Stage.pipeline_id == pipeline_id).update({"order": index})
    
    db.commit()


@router.put("/{pipeline_id}/stages/{stage_id}", response_model=StageResponse)
def update_stage(
    pipeline_id: int, 
    stage_id: int, 
    updates: StageUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a stage (Admin only)."""
    stage = db.query(Stage).filter(Stage.id == stage_id, Stage.pipeline_id == pipeline_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(stage, field, value)

    db.commit()
    db.refresh(stage)
    return stage


@router.delete("/{pipeline_id}/stages/{stage_id}", status_code=204)
def delete_stage(
    pipeline_id: int, 
    stage_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a stage (Admin only)."""
    stage = db.query(Stage).filter(Stage.id == stage_id, Stage.pipeline_id == pipeline_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")

    db.delete(stage)
    db.commit()
