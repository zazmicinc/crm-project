"""Dashboard analytics router."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Lead, Contact, Account, Deal, Activity, User
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Get high-level counts and totals."""
    leads_count = db.query(Lead).count()
    contacts_count = db.query(Contact).count()
    accounts_count = db.query(Account).count()
    deals_count = db.query(Deal).count()
    
    total_value = db.query(func.sum(Deal.value)).scalar() or 0
    
    # Recent deals
    recent_deals = db.query(Deal).order_by(Deal.created_at.desc()).limit(5).all()
    
    return {
        "leads": leads_count,
        "contacts": contacts_count,
        "accounts": accounts_count,
        "deals": deals_count,
        "total_value": total_value,
        "recent_deals": [
            {"id": d.id, "title": d.title, "value": d.value, "stage": d.stage} 
            for d in recent_deals
        ]
    }

@router.get("/funnel")
def get_funnel(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Get deal distribution by stage."""
    # Group deals by stage
    stats = db.query(
        Deal.stage,
        func.count(Deal.id).label("count"),
        func.sum(Deal.value).label("value")
    ).group_by(Deal.stage).all()
    
    return [
        {
            "stage": s.stage.replace('_', ' ').title(),
            "count": s.count,
            "value": s.value or 0
        } for s in stats
    ]

@router.get("/activity-stats")
def get_activity_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Get activity counts by type and recent trend."""
    # Type distribution
    type_stats = db.query(
        Activity.type,
        func.count(Activity.id).label("count")
    ).group_by(Activity.type).all()
    
    # Last 7 days trend
    today = datetime.now()
    dates = [(today - timedelta(days=i)).date() for i in range(6, -1, -1)]
    
    trend = []
    for d in dates:
        count = db.query(Activity).filter(func.date(Activity.date) == d).count()
        trend.append({
            "date": d.strftime("%b %d"),
            "count": count
        })
        
    return {
        "types": [{"type": s.type, "count": s.count} for s in type_stats],
        "trend": trend
    }
