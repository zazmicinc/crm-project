"""Roles CRUD router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Role, User
from app.schemas import RoleCreate, RoleUpdate, RoleResponse
from app.auth import get_current_admin_user

router = APIRouter(prefix="/api/roles", tags=["Roles"])


@router.post("/", response_model=RoleResponse, status_code=201)
def create_role(role: RoleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """Create a new role (Admin only)."""
    existing_role = db.query(Role).filter(Role.name == role.name).first()
    if existing_role:
        raise HTTPException(status_code=400, detail="Role already exists")

    db_role = Role(**role.model_dump())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


@router.get("/", response_model=list[RoleResponse])
def list_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all roles (Admin only)."""
    return db.query(Role).offset(skip).limit(limit).all()


@router.get("/{role_id}", response_model=RoleResponse)
def get_role(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """Get a role by ID (Admin only)."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.put("/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, updates: RoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """Update a role (Admin only)."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    update_data = updates.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != role.name:
        existing = db.query(Role).filter(Role.name == update_data["name"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Role already exists")

    for field, value in update_data.items():
        setattr(role, field, value)

    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=204)
def delete_role(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """Delete a role (Admin only)."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check if role is used by any user
    users = db.query(User).filter(User.role_id == role_id).first()
    if users:
        raise HTTPException(status_code=400, detail="Cannot delete role with assigned users")

    db.delete(role)
    db.commit()
