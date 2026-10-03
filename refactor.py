import re

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Unified login logic
login_replacement = '''@app.post("/api/auth/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # Yagona login
    if login_data.password == "nimda":
        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if not admin_user:
            admin_user = User(
                first_name="Super",
                last_name="Admin",
                password_hash=get_password_hash("nimda"),
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
    }'''

content = re.sub(r'@app\.post\("/auth/login"\).*?(?=@app\.post\("/auth/logout"\))', login_replacement + '\n\n', content, flags=re.DOTALL)

# Change /auth/logout to /api/auth/logout
content = content.replace('@app.post("/auth/logout")', '@app.post("/api/auth/logout")')
content = content.replace('@app.post("/auth/register"', '@app.post("/api/auth/register"')

# Remove @app.post("/admin/login") entirely
content = re.sub(r'@app\.post\("/admin/login"\).*?(?=@app\.get\("/admin/users"\))', '', content, flags=re.DOTALL)

# Add /api prefixes and role dependencies
# Admin
content = content.replace('@app.get("/admin/users", dependencies=[Depends(RequireRole(["admin"]))])', '@app.get("/api/admin/users", dependencies=[Depends(RequireRole(["admin"]))])')
content = content.replace('@app.get("/admin/submissions", dependencies=[Depends(RequireRole(["admin", "moderator"]))])', '@app.get("/api/admin/submissions", dependencies=[Depends(RequireRole(["admin"]))])')
content = content.replace('@app.post("/admin/submissions/{sub_id}/approve")', '@app.post("/api/admin/submissions/{sub_id}/approve", dependencies=[Depends(RequireRole(["admin"]))])')
content = content.replace('@app.post("/admin/submissions/{sub_id}/reject")', '@app.post("/api/admin/submissions/{sub_id}/reject", dependencies=[Depends(RequireRole(["admin"]))])')
content = content.replace('@app.post("/admin/tournaments")', '@app.post("/api/admin/tournaments", dependencies=[Depends(RequireRole(["admin"]))])')

# Scout
content = content.replace('@app.get("/players", response_model=list[PlayerOut])', '@app.get("/api/scout/players", response_model=list[PlayerOut], dependencies=[Depends(RequireRole(["scout", "admin"]))])')

# Player
content = content.replace('@app.post("/players/{player_id}/submit-goal", response_model=GoalSubmissionOut)', '@app.post("/api/player/{player_id}/submit-goal", response_model=GoalSubmissionOut, dependencies=[Depends(RequireRole(["player", "admin"]))])')

# Replace the middleware oauth2_scheme tokenUrl to point to /api/auth/login
with open('security.py', 'r', encoding='utf-8') as f:
    sec = f.read()
sec = sec.replace('tokenUrl="auth/login"', 'tokenUrl="api/auth/login"')
with open('security.py', 'w', encoding='utf-8') as f:
    f.write(sec)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactoring complete.")
