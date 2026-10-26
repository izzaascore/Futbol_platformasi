import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, RequireRole
from app.models import Scout, ScoutReport, ScoutInvitation, Player, User
from app.schemas import (
    ScoutCreate, ScoutOut, ScoutReportBase, ScoutReportCreate, ScoutReportOut,
    ScoutInvitationCreate, ScoutInvitationOut
)

router = APIRouter(tags=["Scouts and Tryouts"])

# --- SCOUT ENDPOINTS ---
from app.schemas import ScoutCreate, ScoutOut
from app.models import Scout

@router.post("/scouts", response_model=ScoutOut, dependencies=[Depends(RequireRole(["admin"]))])
def create_scout(scout_data: ScoutCreate, db: Session = Depends(get_db)):
    scout = Scout(**scout_data.model_dump())
    db.add(scout)
    db.commit()
    db.refresh(scout)
    return scout

@router.get("/scouts", response_model=list[ScoutOut])
def get_scouts(db: Session = Depends(get_db)):
    return db.query(Scout).all()

from app.models import ScoutReport
from app.schemas import ScoutReportCreate, ScoutReportOut

@router.post("/scouts/{scout_id}/reports", response_model=ScoutReportOut, dependencies=[Depends(RequireRole(["scout", "admin"]))])
def create_scout_report(scout_id: int, report_data: ScoutReportCreate, db: Session = Depends(get_db)):
    scout = db.query(Scout).filter(Scout.id == scout_id).first()
    if not scout or not scout.is_pro:
        raise HTTPException(status_code=403, detail="Faqat PRO skautlar hisobot yozishi mumkin")
    
    report = ScoutReport(scout_id=scout_id, **report_data.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@router.get("/scouts/{scout_id}/reports", response_model=list[ScoutReportOut])
def get_scout_reports(scout_id: int, db: Session = Depends(get_db)):
    return db.query(ScoutReport).filter(ScoutReport.scout_id == scout_id).all()



# --- SCOUT INVITATION (TRYOUT) ENDPOINTS ---
from app.models import ScoutInvitation
from app.schemas import ScoutInvitationCreate, ScoutInvitationOut

@router.post("/api/scout/invitations", response_model=ScoutInvitationOut, dependencies=[Depends(RequireRole(["scout", "admin"]))])
def create_scout_invitation(
    data: ScoutInvitationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    player = db.query(Player).filter(Player.id == data.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Futbolchi topilmadi")

    invitation = ScoutInvitation(
        scout_id=current_user.id,
        player_id=data.player_id,
        club_name=data.club_name,
        title=data.title,
        tryout_date=data.tryout_date,
        location=data.location,
        message=data.message,
        contact_phone=data.contact_phone or getattr(current_user, 'phone', None) or "+998 90 000 00 00",
        status="kutilmoqda"
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return invitation

@router.get("/api/player/{player_id}/invitations", response_model=list[ScoutInvitationOut])
def get_player_invitations(player_id: int, db: Session = Depends(get_db)):
    return db.query(ScoutInvitation).filter(ScoutInvitation.player_id == player_id).order_by(ScoutInvitation.created_at.desc()).all()

@router.get("/api/scout/my-invitations", response_model=list[ScoutInvitationOut])
def get_scout_invitations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ScoutInvitation).filter(ScoutInvitation.scout_id == current_user.id).order_by(ScoutInvitation.created_at.desc()).all()

@router.patch("/api/player/invitations/{invitation_id}/respond", response_model=ScoutInvitationOut)
def respond_to_invitation(
    invitation_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(ScoutInvitation).filter(ScoutInvitation.id == invitation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Taklifnoma topilmadi")
    status = data.get("status")
    if status in ["qabul_qilindi", "rad_etildi"]:
        inv.status = status
        db.commit()
        db.refresh(inv)
    return inv

