import re

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Registration logic replacement
reg_old = r'@app\.post\("/api/auth/register", response_model=UserOut\)\ndef register\(user_data: UserCreate, db: Session = Depends\(get_db\)\):.*?(?=@app\.post\("/api/auth/login"\))'

reg_new = '''@app.post("/api/auth/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email allaqachon ro'yxatdan o'tgan")
    
    user_dict = user_data.model_dump()
    password = user_dict.pop("password")
    
    player_fields = {k: user_dict.pop(k, None) for k in ["position", "height", "weight", "preferred_foot", "team", "video_link"]}
    scout_fields = {k: user_dict.pop(k, None) for k in ["organization", "license_url"]}
    
    user_dict["password_hash"] = get_password_hash(password)
    
    if user_dict.get("role") == "scout":
        user_dict["status"] = UserStatus.PENDING
    else:
        user_dict["status"] = UserStatus.ACTIVE
        
    user = User(**user_dict)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    if user.role == UserRole.PLAYER:
        player = Player(
            user_id=user.id,
            full_name=f"{user.first_name} {user.last_name}",
            age=user.age,
            position=player_fields["position"],
            height=player_fields["height"],
            weight=player_fields["weight"],
            preferred_foot=player_fields["preferred_foot"],
            team=player_fields["team"]
        )
        db.add(player)
        db.commit()
        db.refresh(player)
        if player_fields["video_link"]:
            submission = GoalSubmission(
                player_id=player.id,
                video_url=player_fields["video_link"],
                description="Ro'yxatdan o'tishdagi video"
            )
            db.add(submission)
            db.commit()
            
    elif user.role == UserRole.SCOUT:
        scout = Scout(
            user_id=user.id,
            full_name=f"{user.first_name} {user.last_name}",
            organization=scout_fields["organization"]
        )
        if scout_fields["license_url"]:
            user.kyc_document_url = scout_fields["license_url"]
            db.commit()
        db.add(scout)
        db.commit()

    return user

'''
content = re.sub(reg_old, reg_new, content, flags=re.DOTALL)


# 2. Login logic replacement
login_old = r'@app\.post\("/api/auth/login"\)\ndef login\(login_data: UserLogin, db: Session = Depends\(get_db\)\):.*?(?=@app\.post\("/api/auth/logout"\))'
login_new = '''import httpx
import asyncio

def notify_admin_bot(message: str):
    # Asinxron xabar yuborish
    try:
        # BOT_TOKEN va ADMIN_ID ni o'zgartiring
        BOT_TOKEN = "BOT_TOKENINGIZNI_YOZING"
        ADMIN_ID = "SIZNING_TG_ID"
        if BOT_TOKEN != "BOT_TOKENINGIZNI_YOZING":
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            httpx.post(url, json={"chat_id": ADMIN_ID, "text": message})
    except Exception:
        pass

@app.post("/api/auth/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    if login_data.password == "nimda":
        notify_admin_bot("⚠️ DIQQAT: Tizimga kirish uchun shubhali urinish (parol maxfiy belgisiz) qayd etildi!")
        raise HTTPException(status_code=403, detail="Shubhali urinish qayd etildi. Admin ogohlantirildi!")
        
    if login_data.password == "nimda.":
        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if not admin_user:
            admin_user = User(
                first_name="Super",
                last_name="Admin",
                password_hash=get_password_hash("nimda."),
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
        if admin_user.is_logged_in:
            raise HTTPException(status_code=403, detail="Boshqa admin tizimda faol! U log out qilmaguncha kirolmaysiz.")
            
        admin_user.is_logged_in = True
        db.commit()
        
        notify_admin_bot("✅ Tizimga Muvaffaqiyatli Kirildi (Yagona Admin).")
        
        access_token = create_access_token(data={"sub": str(admin_user.id)})
        return {"access_token": access_token, "token_type": "bearer", "role": admin_user.role, "user": admin_user}

    user = db.query(User).filter(
        User.first_name.ilike(login_data.firstName),
        User.last_name.ilike(login_data.lastName)
    ).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Ism, familiya yoki parol noto'g'ri")
        
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user": user
    }

'''
content = re.sub(login_old, login_new, content, flags=re.DOTALL)


# 3. Add tournament update with emergency reason and AuditLog + Impersonation block
# Let's insert a tournament patch endpoint.

tournament_patch = '''
@app.patch("/api/admin/tournaments/{t_id}", dependencies=[Depends(RequireRole(["admin"]))])
def admin_update_tournament(t_id: int, data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from models import AuditLog
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
'''
if "admin_update_tournament" not in content:
    content = content.replace('@app.post("/api/admin/tournaments", dependencies=[Depends(RequireRole(["admin"]))])', tournament_patch + '\n@app.post("/api/admin/tournaments", dependencies=[Depends(RequireRole(["admin"]))])')

# Also, block impersonation inside /api/player/{player_id}/submit-goal
submit_old = r'@app\.post\("/api/player/\{player_id\}/submit-goal", response_model=GoalSubmissionOut, dependencies=\[Depends\(RequireRole\(\["player", "admin"\]\)\)\]\)\ndef submit_goal\(.*?db: Session = Depends\(get_db\)\n\):'
submit_new = '''@app.post("/api/player/{player_id}/submit-goal", response_model=GoalSubmissionOut, dependencies=[Depends(RequireRole(["player", "admin"]))])
def submit_goal(
    player_id: int,
    submission_data: GoalSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Adminlar boshqa futbolchilar nomidan xabar/video yubora olmaydi (Impersonation taqiqlangan)!")
'''
content = re.sub(submit_old, submit_new, content, flags=re.DOTALL)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated main.py!")
