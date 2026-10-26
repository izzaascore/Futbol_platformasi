import os
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, RequireRole
from app.models import (
    Match, MatchEvent, PlayerMatchStat, Player,
    MatchPrediction, MatchCallout, CalloutResponse, User
)
from app.schemas import (
    MatchCreate, MatchOut, MatchEventCreate, MatchEventOut,
    PlayerMatchStatOut, PreMatchAnalysisOut,
    MatchPredictionCreate, MatchPredictionOut,
    MatchCalloutCreate, MatchCalloutOut,
    CalloutResponseCreate, CalloutResponseOut
)

router = APIRouter(tags=["Matches and Matchmaker"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, match_id: int):
        await websocket.accept()
        if match_id not in self.active_connections:
            self.active_connections[match_id] = []
        self.active_connections[match_id].append(websocket)

    def disconnect(self, websocket: WebSocket, match_id: int):
        if match_id in self.active_connections:
            self.active_connections[match_id].remove(websocket)

    async def broadcast(self, message: str, match_id: int):
        if match_id in self.active_connections:
            for connection in self.active_connections[match_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    pass

manager = ConnectionManager()

@router.post("/matches", response_model=MatchOut, dependencies=[Depends(RequireRole(["admin"]))])
def create_match(match_data: MatchCreate, db: Session = Depends(get_db)):
    match = Match(**match_data.model_dump())
    db.add(match)
    db.commit()
    db.refresh(match)
    return match

@router.get("/matches", response_model=list[MatchOut])
def get_matches(status: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Match)
    if status:
        query = query.filter(Match.status == status)
    return query.all()

@router.get("/matches/{match_id}", response_model=MatchOut)
def get_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="O'yin topilmadi")
    return match

@router.websocket("/ws/matches/{match_id}")
async def websocket_endpoint(websocket: WebSocket, match_id: int):
    await manager.connect(websocket, match_id)
    try:
        while True:
            # We don't necessarily expect data from client, just keep alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, match_id)


@router.post("/matches/{match_id}/events", response_model=MatchEventOut, dependencies=[Depends(RequireRole(["admin"]))])
async def add_match_event(match_id: int, event_data: MatchEventCreate, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="O'yin topilmadi")
    
    event = MatchEvent(match_id=match_id, **event_data.model_dump())
    db.add(event)
    
    # Update match scores if goal
    if event.event_type == "goal":
        if event.team == "home":
            match.home_score += 1
        else:
            match.away_score += 1

    db.commit()
    db.refresh(event)

    # Fetch updated match to broadcast full state
    db.refresh(match)
    
    # Notify via WebSocket
    update_data = {
        "type": "NEW_EVENT",
        "event": {
            "id": event.id,
            "minute": event.minute,
            "event_type": event.event_type,
            "description": event.description,
            "team": event.team,
            "player_id": event.player_id,
            "related_player_id": event.related_player_id
        },
        "match": {
            "home_score": match.home_score,
            "away_score": match.away_score
        }
    }
    await manager.broadcast(json.dumps(update_data), match_id)
    
    return event

@router.post("/matches/{match_id}/stats/{player_id}", dependencies=[Depends(RequireRole(["admin"]))])
async def update_player_stat(
    match_id: int, 
    player_id: int, 
    action: str, # pass, save, tackle, goal, assist
    db: Session = Depends(get_db)
):
    stat = db.query(PlayerMatchStat).filter(
        PlayerMatchStat.match_id == match_id,
        PlayerMatchStat.player_id == player_id
    ).first()

    if not stat:
        stat = PlayerMatchStat(match_id=match_id, player_id=player_id)
        db.add(stat)
        db.commit()
        db.refresh(stat)

    # Update stat based on action
    if action == "pass":
        stat.passes += 1
        stat.rating += 0.1
    elif action == "save":
        stat.saves += 1
        stat.rating += 0.3
    elif action == "tackle":
        stat.tackles += 1
        stat.rating += 0.2
    elif action == "goal":
        stat.goals += 1
        stat.rating += 1.0
    elif action == "assist":
        stat.assists += 1
        stat.rating += 0.5

    # Cap rating at 10.0
    if stat.rating > 10.0:
        stat.rating = 10.0

    db.commit()
    db.refresh(stat)

    # Notify via WebSocket
    update_data = {
        "type": "STAT_UPDATE",
        "stat": {
            "player_id": stat.player_id,
            "rating": round(stat.rating, 1),
            "passes": stat.passes,
            "saves": stat.saves,
            "tackles": stat.tackles,
            "goals": stat.goals,
            "assists": stat.assists
        }
    }
    await manager.broadcast(json.dumps(update_data), match_id)

    return {"message": "Stat updated", "rating": stat.rating}




from app.models import MatchPrediction, MatchCallout, CalloutResponse
from app.schemas import (
    MatchPredictionCreate,
    MatchPredictionOut,
    PreMatchAnalysisOut,
    MatchCalloutCreate,
    MatchCalloutOut,
    CalloutResponseCreate,
    CalloutResponseOut
)

@router.get("/matches/{match_id}/prematch-ai", response_model=PreMatchAnalysisOut)
def get_prematch_ai_analysis(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="O'yin topilmadi")

    # Jamoalar nomidan deterministik va realistik kuch parametrlarini hisoblash
    import hashlib
    h_seed = int(hashlib.md5(match.home_team.lower().encode()).hexdigest()[:4], 16) % 25 + 70
    a_seed = int(hashlib.md5(match.away_team.lower().encode()).hexdigest()[:4], 16) % 25 + 68

    home_attack = min(98, h_seed + 3)
    away_attack = min(96, a_seed)
    home_defense = min(95, (h_seed * 2 + 15) % 22 + 73)
    away_defense = min(95, (a_seed * 2 + 10) % 22 + 72)

    power_diff = (home_attack - away_attack) + (home_defense - away_defense)
    
    # Ehtimolliklar
    win_h = max(20, min(70, 44 + power_diff))
    draw = max(18, min(30, 26 - abs(power_diff) // 2))
    win_a = 100 - win_h - draw

    # AI Taktik xulosasi
    if win_h > win_a + 10:
        tactical = (
            f"⚡️ AI Murabbiy Tahlili: {match.home_team} mezbonlik ustunligi va kuchli hujum kuchi ({home_attack}/100) hisobiga "
            f"yaqqol favorit. {match.away_team} himoyaga tayanib, faqat tezkor qarshi hujumlarda imkoniyat izlashi kerak."
        )
    elif win_a > win_h + 10:
        tactical = (
            f"⚡️ AI Murabbiy Tahlili: {match.away_team} tarkibiy kuch va maydonni nazorat qilish ({away_attack}/100) bo'yicha "
            f"oldinda. Biroq {match.home_team} o'z muxlislari ko'z o'ngida agressiv pressing bilan syurpriz qilishi mumkin."
        )
    else:
        tactical = (
            f"⚡️ AI Murabbiy Tahlili: O'ta murosasiz to'qnashuv! Har ikki jamoaning g'alaba qozonish ehtimoli deyarli teng. "
            f"O'yin taqdirini individual mahorat va standart vaziyatlar hal qilishi kutilmoqda."
        )

    # Muxlislar bashoratlari statistikasi
    predictions = db.query(MatchPrediction).filter(MatchPrediction.match_id == match.id).all()
    total_preds = len(predictions)
    h_votes = sum(1 for p in predictions if p.predicted_home_score > p.predicted_away_score)
    d_votes = sum(1 for p in predictions if p.predicted_home_score == p.predicted_away_score)
    a_votes = sum(1 for p in predictions if p.predicted_home_score < p.predicted_away_score)

    comm = {
        "total_votes": total_preds,
        "home_pct": round((h_votes / total_preds * 100) if total_preds else win_h),
        "draw_pct": round((d_votes / total_preds * 100) if total_preds else draw),
        "away_pct": round((a_votes / total_preds * 100) if total_preds else win_a),
    }

    return {
        "match_id": match.id,
        "home_team": match.home_team,
        "away_team": match.away_team,
        "win_probability_home": win_h,
        "draw_probability": draw,
        "win_probability_away": win_a,
        "home_attack_rating": home_attack,
        "away_attack_rating": away_attack,
        "home_defense_rating": home_defense,
        "away_defense_rating": away_defense,
        "ai_tactical_breakdown": tactical,
        "community_votes": comm
    }


@router.post("/matches/{match_id}/predict", response_model=MatchPredictionOut)
def predict_match_score(
    match_id: int,
    pred_data: MatchPredictionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="O'yin topilmadi")

    # Foydalanuvchi allaqachon bashorat qilganmi tekshiramiz
    existing = db.query(MatchPrediction).filter(
        MatchPrediction.match_id == match_id,
        MatchPrediction.user_id == current_user.id
    ).first()

    if existing:
        existing.predicted_home_score = pred_data.predicted_home_score
        existing.predicted_away_score = pred_data.predicted_away_score
        db.commit()
        db.refresh(existing)
        return existing

    prediction = MatchPrediction(
        match_id=match_id,
        user_id=current_user.id,
        predicted_home_score=pred_data.predicted_home_score,
        predicted_away_score=pred_data.predicted_away_score
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction


@router.get("/matches/{match_id}/predictions", response_model=list[MatchPredictionOut])
def get_match_predictions(match_id: int, db: Session = Depends(get_db)):
    return db.query(MatchPrediction).filter(MatchPrediction.match_id == match_id).all()


# ==============================================================
# SOS MATCHMAKER: "FUTBOLGA ODAM YETMAYAPTI!"
# ==============================================================

@router.post("/api/match-callouts", response_model=MatchCalloutOut)
def create_match_callout(
    data: MatchCalloutCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    callout = MatchCallout(
        creator_id=current_user.id,
        title=data.title,
        city=data.city,
        district=data.district,
        stadium_name=data.stadium_name,
        match_time=data.match_time,
        players_needed=data.players_needed,
        position_needed=data.position_needed,
        price_per_person=data.price_per_person
    )
    db.add(callout)
    db.commit()
    db.refresh(callout)
    return callout


@router.get("/api/match-callouts", response_model=list[MatchCalloutOut])
def list_match_callouts(
    city: str | None = None,
    status: str = "open",
    db: Session = Depends(get_db)
):
    query = db.query(MatchCallout)
    if status:
        query = query.filter(MatchCallout.status == status)
    if city:
        query = query.filter(MatchCallout.city.ilike(f"%{city}%"))

    callouts = query.order_by(MatchCallout.created_at.desc()).all()
    res = []
    for c in callouts:
        out = MatchCalloutOut.model_validate(c)
        out.joined_count = len(c.responses)
        res.append(out)
    return res


@router.post("/api/match-callouts/{callout_id}/join", response_model=CalloutResponseOut)
def join_match_callout(
    callout_id: int,
    data: CalloutResponseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    callout = db.query(MatchCallout).filter(MatchCallout.id == callout_id).first()
    if not callout:
        raise HTTPException(status_code=404, detail="E'lon topilmadi")

    if callout.status != "open":
        raise HTTPException(status_code=400, detail="Bu o'yin uchun qabul to'xtatilgan yoki to'lgan!")

    # Oldin qo'shilganmi tekshiramiz
    existing = db.query(CalloutResponse).filter(
        CalloutResponse.callout_id == callout_id,
        CalloutResponse.user_id == current_user.id
    ).first()
    if existing:
        return existing

    resp = CalloutResponse(
        callout_id=callout_id,
        user_id=current_user.id,
        note=data.note,
        status="joined"
    )
    db.add(resp)
    db.commit()
    db.refresh(resp)

    # Agar yetarlicha odam to'plangan bo'lsa, statusni 'filled' qilamiz
    joined_count = db.query(CalloutResponse).filter(CalloutResponse.callout_id == callout_id).count()
    if joined_count >= callout.players_needed:
        callout.status = "filled"
        db.commit()

    return resp


@router.delete("/api/match-callouts/{callout_id}")
def delete_match_callout(
    callout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    callout = db.query(MatchCallout).filter(MatchCallout.id == callout_id).first()
    if not callout:
        raise HTTPException(status_code=404, detail="E'lon topilmadi")

    check_ownership(callout.creator_id, current_user, "e'lon")
    db.delete(callout)
    db.commit()
    return {"message": "E'lon muvaffaqiyatli o'chirildi"}


