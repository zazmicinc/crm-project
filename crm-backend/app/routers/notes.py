"""Notes CRUD router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Note, User
from app.schemas import NoteCreate, NoteUpdate, NoteResponse, RelatedToType
from app.auth import get_current_active_user, check_permissions

router = APIRouter(prefix="/api/notes", tags=["Notes"])


@router.post("/", response_model=NoteResponse, status_code=201)
def create_note(
    note: NoteCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new note."""
    if not check_permissions(current_user, "notes.create"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    db_note = Note(**note.model_dump(), created_by=current_user.id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/", response_model=list[NoteResponse])
def list_notes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    related_to_type: RelatedToType = Query(None, description="Filter by related entity type"),
    related_to_id: int = Query(None, description="Filter by related entity ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all notes with optional filtering by related entity."""
    if not check_permissions(current_user, "notes.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    query = db.query(Note)

    if related_to_type:
        query = query.filter(Note.related_to_type == related_to_type)
    if related_to_id:
        query = query.filter(Note.related_to_id == related_to_id)

    return query.order_by(Note.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single note by ID."""
    if not check_permissions(current_user, "notes.read"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int, 
    updates: NoteUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing note."""
    if not check_permissions(current_user, "notes.update"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(
    note_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a note."""
    if not check_permissions(current_user, "notes.delete"):
        raise HTTPException(status_code=403, detail="Not enough privileges")

    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
