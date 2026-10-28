import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, RequireRole
from app.models import (
    Tournament, TournamentParticipant, GoalSubmission,
    VerificationStatus, Player, User, AuditLog
)
from app.schemas import (
    TournamentCreate, TournamentOut,
    TournamentParticipantCreate, TournamentParticipantOut
)

router = APIRouter(tags=["Tournaments and Submissions"])

@router.get("/admin/submissions", dependencies=[Depends(RequireRole(["admin"]))])
@router.get("/api/admin/submissions", dependencies=[Depends(RequireRole(["admin"]))])
def admin_get_submissions(db: Session = Depends(get_db)):
    subs = db.query(GoalSubmission).all()
    return subs

@router.post("/admin/submissions/{sub_id}/approve", dependencies=[Depends(RequireRole(["admin"]))])
@router.post("/api/admin/submissions/{sub_id}/approve", dependencies=[Depends(RequireRole(["admin"]))])
def admin_approve_submission(sub_id: int, db: Session = Depends(get_db)):
    sub = db.query(GoalSubmission).filter(GoalSubmission.id == sub_id).first()
    if sub:
        sub.status = VerificationStatus.APPROVED
        # Agar bu gol bo'lsa, o'yinchi statistikasiga qo'shish kerak
        player = db.query(Player).filter(Player.id == sub.player_id).first()
        if player:
            player.goals_verified += 1
        db.commit()
        return {"status": "approved"}
    raise HTTPException(status_code=404)

@router.post("/admin/submissions/{sub_id}/reject", dependencies=[Depends(RequireRole(["admin"]))])
@router.post("/api/admin/submissions/{sub_id}/reject", dependencies=[Depends(RequireRole(["admin"]))])
def admin_reject_submission(sub_id: int, db: Session = Depends(get_db)):
    sub = db.query(GoalSubmission).filter(GoalSubmission.id == sub_id).first()
    if sub:
        sub.status = VerificationStatus.REJECTED
        db.commit()
        return {"status": "rejected"}
    raise HTTPException(status_code=404)


@router.patch("/api/admin/tournaments/{t_id}", dependencies=[Depends(RequireRole(["admin"]))])
def admin_update_tournament(t_id: int, data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models import AuditLog
    t = db.query(Tournament).filter(Tournament.id == t_id).first()
    if not t:
        raise HTTPException(status_code=404)
        
    # Check frozen
    if t.status in ["completed", "yakunlangan", "Aktiv emas"]:
        if not data.get("emergency_reason"):
            raise HTTPException(status_code=400, detail="Muzlatilgan (yakunlangan) turnirni faqat 'emergency_reason' ko'rsatib o'zgartirish mumkin!")
        log = AuditLog(
            admin_id=current_user.id,
            action=f"Muzlatilgan turnir o'zgartirildi. Sabab: {data['emergency_reason']}",
            target_entity=f"Tournament_{t_id}"
        )
        db.add(log)
        
    # Example update
    if "status" in data: t.status = data["status"]
    if "name" in data: t.name = data["name"]
    db.commit()
    return {"message": "Muvaffaqiyatli saqlandi", "tournament": t.id}

@router.post("/admin/tournaments", dependencies=[Depends(RequireRole(["admin"]))])
@router.post("/api/admin/tournaments", dependencies=[Depends(RequireRole(["admin"]))])
def admin_create_tournament(data: dict, db: Session = Depends(get_db)):
    from app.models import Tournament
    t = Tournament(
        name=data.get("name", ""),
        description=data.get("description", ""),
        prize=data.get("prize", ""),
        status=data.get("status", "Aktiv"),
        image=data.get("image", ""),
        teams_count=data.get("teams_count", 16),
        start_date=data.get("start_date", ""),
        location=data.get("location", "")
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t



# --- TOURNAMENT ENDPOINTS ---
from app.schemas import TournamentCreate, TournamentOut, TournamentParticipantCreate, TournamentParticipantOut
from app.models import Tournament, TournamentParticipant

@router.post("/tournaments", response_model=TournamentOut, dependencies=[Depends(RequireRole(["admin"]))])
def create_tournament(tournament_data: TournamentCreate, db: Session = Depends(get_db)):
    tournament = Tournament(**tournament_data.model_dump())
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament

@router.get("/tournaments", response_model=list[TournamentOut])
def get_tournaments(db: Session = Depends(get_db)):
    return db.query(Tournament).all()

@router.post("/tournaments/{tournament_id}/join", response_model=TournamentParticipantOut)
def join_tournament(tournament_id: int, participant_data: TournamentParticipantCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check tournament exists
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Turnir topilmadi")
    
    # Check player exists
    player = db.query(Player).filter(Player.id == participant_data.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Futbolchi topilmadi")
    
    participant = TournamentParticipant(
        tournament_id=tournament_id,
        player_id=participant_data.player_id
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant

@router.get("/tournaments/{tournament_id}/participants", response_model=list[TournamentParticipantOut])
def get_tournament_participants(tournament_id: int, db: Session = Depends(get_db)):
    return db.query(TournamentParticipant).filter(TournamentParticipant.tournament_id == tournament_id).all()


