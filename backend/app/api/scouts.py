import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, RequireRole, check_ownership
from app.models import Scout, ScoutReport, ScoutInvitation, Player, User, UserRole, UserStatus
from app.api.auth import notify_telegram_user
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
    # Faqat taklif yuborilgan futbolchining O'ZI (yoki admin) javob bera oladi
    invited_player = db.query(Player).filter(Player.id == inv.player_id).first()
    check_ownership(invited_player.user_id if invited_player else None, current_user, "taklifnoma")
    status = data.get("status")
    if status not in ["qabul_qilindi", "rad_etildi"]:
        raise HTTPException(status_code=400, detail="Noto'g'ri holat")
    inv.status = status
    db.commit()
    db.refresh(inv)
    return inv


# --- ADMIN SCOUT ACCREDITATION MANAGEMENT ---

@router.get("/api/admin/scouts", dependencies=[Depends(RequireRole(["admin"]))])
def get_admin_scouts(db: Session = Depends(get_db)):
    scouts = db.query(Scout).all()
    res = []
    scout_user_ids = set()
    for s in scouts:
        u = db.query(User).filter(User.id == s.user_id).first() if s.user_id else None
        if s.user_id:
            scout_user_ids.add(s.user_id)
        
        status_val = u.status.value if (u and hasattr(u.status, "value")) else (str(u.status) if u else "pending")
        res.append({
            "id": s.id,
            "user_id": s.user_id,
            "full_name": s.full_name or (f"{u.first_name} {u.last_name}" if u else "Noma'lum"),
            "organization": s.organization or "Ko'rsatilmagan",
            "contact_info": s.contact_info or (u.email if u else None),
            "is_pro": s.is_pro,
            "status": status_val,
            "email": u.email if u else None,
            "kyc_document_url": u.kyc_document_url if u else None,
            "telegram_id": u.telegram_id if u else None,
            "created_at": (u.created_at or s.created_at).isoformat() if (u and u.created_at) or s.created_at else None
        })

    # Also include any User with role == 'scout' that doesn't have a Scout entry yet
    orphan_scout_users = db.query(User).filter(User.role == UserRole.SCOUT).all()
    for u in orphan_scout_users:
        if u.id not in scout_user_ids:
            status_val = u.status.value if hasattr(u.status, "value") else str(u.status)
            res.append({
                "id": None,
                "user_id": u.id,
                "full_name": f"{u.first_name} {u.last_name}",
                "organization": "Ko'rsatilmagan",
                "contact_info": u.email,
                "is_pro": False,
                "status": status_val,
                "email": u.email,
                "kyc_document_url": u.kyc_document_url,
                "telegram_id": u.telegram_id,
                "created_at": u.created_at.isoformat() if u.created_at else None
            })
    return res

@router.post("/api/admin/scouts/{user_id}/approve", dependencies=[Depends(RequireRole(["admin"]))])
def approve_scout(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    user.status = UserStatus.ACTIVE
    scout = db.query(Scout).filter(Scout.user_id == user.id).first()
    if scout:
        scout.is_pro = True
    else:
        scout = Scout(
            user_id=user.id,
            full_name=f"{user.first_name} {user.last_name}",
            organization="Professional Skaut",
            is_pro=True
        )
        db.add(scout)
    db.commit()

    if user.telegram_id:
        notify_telegram_user(
            user.telegram_id,
            f"🎉 <b>Tabriklaymiz, {user.first_name}!</b>\n\n"
            f"Sizning Futuro <b>Scout PRO</b> akkreditatsiyangiz ma'muriyat tomonidan tasdiqlandi! ✅\n\n"
            f"Endi siz platformadagi barcha yosh iqtidorlar statistikasi, tahlillari va ularni ko'rikka taklif qilish imkoniyatiga to'liq egasiz.\n\n"
            f"🌐 Havola: https://futbol-platform.onrender.com/scouts"
        )
    return {"message": "Skaut muvaffaqiyatli tasdiqlandi", "user_id": user.id, "status": "active"}

@router.post("/api/admin/scouts/{user_id}/reject", dependencies=[Depends(RequireRole(["admin"]))])
def reject_scout(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    user.status = UserStatus.BANNED
    scout = db.query(Scout).filter(Scout.user_id == user.id).first()
    if scout:
        scout.is_pro = False
    db.commit()

    if user.telegram_id:
        notify_telegram_user(
            user.telegram_id,
            f"⚠️ <b>Hurmatli {user.first_name}!</b>\n\n"
            f"Afsuski, sizning skautlik arizangiz ma'lumotlar yetarli bo'lmagani yoki tasdiqlanmagani sababli rad etildi.\n"
            f"Qo'shimcha savollar bo'lsa, @FuturoAdminBot ga murojaat qilishingiz mumkin."
        )
    return {"message": "Skaut arizasi rad etildi", "user_id": user.id, "status": "banned"}


