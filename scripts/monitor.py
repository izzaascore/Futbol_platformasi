"""
╔══════════════════════════════════════════════════════════════════════════╗
║         ABDULBOSIT - Full-Server Self-Healing Core Monitor               ║
║         FootballRise Platform v2.0                                       ║
║         Vazifa: Butun backend loglarini skanerlash, xatoliklarni         ║
║         aniqlash va Antigravity IDE orqali avtomatik patch qilish.       ║
╚══════════════════════════════════════════════════════════════════════════╝
"""

import os
import re
import sys
import ast
import time
import json
import signal
import logging
import textwrap
import importlib
import subprocess
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional
from collections import defaultdict

# ─── Loyiha ildiz papkasi ─────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR  = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

OBSIDIAN_DIR = BASE_DIR / "docs" / "obsidian_sync"
OBSIDIAN_DIR.mkdir(parents=True, exist_ok=True)

PATCH_LOG_FILE   = LOG_DIR / "abdulbosit_patches.log"
SERVER_LOG_FILE  = LOG_DIR / "server_runtime.log"
HEALTH_LOG_FILE  = LOG_DIR / "health_report.json"

# ─── Logging Konfiguratsiyasi ─────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [ABDULBOSIT] %(levelname)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(PATCH_LOG_FILE, encoding="utf-8"),
    ],
)
log = logging.getLogger("abdulbosit")

# ─── Taniqli Xatoliklar Kutubxonasi (Knowledge Base) ─────────────────────────
# Har bir xatolik: pattern, tavsif, avtomatik patch funksiyasi nomi
KNOWN_ERROR_PATTERNS = [
    {
        "id":          "E001",
        "pattern":     r"ModuleNotFoundError: No module named '(\w+)'",
        "description": "Kutubxona o'rnatilmagan",
        "action":      "auto_install_module",
        "severity":    "CRITICAL",
    },
    {
        "id":          "E002",
        "pattern":     r"NameError: name '(\w+)' is not defined",
        "description": "Import qilinmagan nom ishlatilgan",
        "action":      "auto_fix_import",
        "severity":    "HIGH",
    },
    {
        "id":          "E003",
        "pattern":     r"Table '(\w+)' is already defined for this MetaData",
        "description": "Jadval takrorlanib qolgan (duplicate model)",
        "action":      "auto_fix_duplicate_table",
        "severity":    "CRITICAL",
    },
    {
        "id":          "E004",
        "pattern":     r"sqlalchemy\.exc\.\w+Error.*Column.*not.*NULL",
        "description": "Bazada majburiy ustun bo'sh qoldirilgan",
        "action":      "log_and_alert",
        "severity":    "HIGH",
    },
    {
        "id":          "E005",
        "pattern":     r"JWTError|ExpiredSignatureError|InvalidTokenError",
        "description": "JWT token xato yoki muddati tugagan",
        "action":      "log_and_alert",
        "severity":    "MEDIUM",
    },
    {
        "id":          "E006",
        "pattern":     r"403.*Forbidden|401.*Unauthorized",
        "description": "Ruxsatsiz kirish urinishi",
        "action":      "log_and_alert",
        "severity":    "MEDIUM",
    },
    {
        "id":          "E007",
        "pattern":     r"Address already in use|Only one usage of each socket",
        "description": "Port allaqachon band (zombie server)",
        "action":      "auto_kill_port",
        "severity":    "CRITICAL",
    },
    {
        "id":          "E008",
        "pattern":     r"password_hash.*None|NoneType.*password_hash",
        "description": "Foydalanuvchi paroli null holda saqlangan",
        "action":      "log_and_alert",
        "severity":    "HIGH",
    },
    {
        "id":          "E009",
        "pattern":     r"SyntaxError: (.*) \(<string>, line (\d+)\)",
        "description": "Python sintaksis xatosi",
        "action":      "log_and_alert",
        "severity":    "CRITICAL",
    },
    {
        "id":          "E010",
        "pattern":     r"disk I/O error|database disk image is malformed",
        "description": "SQLite baza fayli buzilgan",
        "action":      "auto_backup_db",
        "severity":    "CRITICAL",
    },
]

# ─── Health Report holati ─────────────────────────────────────────────────────
health_report = {
    "started_at":    datetime.now().isoformat(),
    "last_check":    None,
    "total_errors":  0,
    "auto_patched":  0,
    "alerts_sent":   0,
    "error_counts":  defaultdict(int),
    "patch_history": [],
}

# ─── YORDAMCHI FUNKSIYALAR ────────────────────────────────────────────────────

def save_health_report():
    """Health holatini JSON faylga yozadi."""
    report_copy = dict(health_report)
    report_copy["error_counts"] = dict(health_report["error_counts"])
    report_copy["last_check"]   = datetime.now().isoformat()
    with open(HEALTH_LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(report_copy, f, ensure_ascii=False, indent=2)


def update_obsidian(title: str, content: str):
    """Obsidian Second Brain faylini yangilaydi."""
    obsidian_file = OBSIDIAN_DIR / "Abdulbosit_SelfHealing_Log.md"
    timestamp     = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"\n## [{timestamp}] {title}\n{content}\n---\n"
    with open(obsidian_file, "a", encoding="utf-8") as f:
        f.write(entry)


def record_patch(error_id: str, description: str, action_taken: str, success: bool):
    """Har bir patch harakatini qayd etadi."""
    entry = {
        "timestamp":    datetime.now().isoformat(),
        "error_id":     error_id,
        "description":  description,
        "action_taken": action_taken,
        "success":      success,
    }
    health_report["patch_history"].append(entry)
    if success:
        health_report["auto_patched"] += 1
    save_health_report()
    update_obsidian(
        f"{'✅ PATCH MUVAFFAQIYATLI' if success else '❌ PATCH MUVAFFAQIYATSIZ'}: {error_id}",
        f"- **Xatolik**: {description}\n- **Bajarilgan amal**: {action_taken}\n- **Natija**: {'Muvaffaqiyatli' if success else 'Muvaffaqiyatsiz'}"
    )


# ─── AUTO-PATCH FUNKSIYALARI ──────────────────────────────────────────────────

def auto_install_module(match: re.Match, context: dict) -> bool:
    """E001: Etishmayotgan kutubxonani avtomatik o'rnatadi."""
    module_name = match.group(1)
    pip_name_map = {
        "jose":     "python-jose[cryptography]",
        "passlib":  "passlib[bcrypt]",
        "bcrypt":   "bcrypt",
        "dotenv":   "python-dotenv",
        "httpx":    "httpx",
        "PIL":      "Pillow",
        "cv2":      "opencv-python",
        "sklearn":  "scikit-learn",
        "celery":   "celery",
        "redis":    "redis",
        "aiofiles": "aiofiles",
    }
    pip_package = pip_name_map.get(module_name, module_name)
    venv_pip = BASE_DIR / ".venv" / ("Scripts" if os.name == "nt" else "bin") / ("pip.exe" if os.name == "nt" else "pip")
    pip_exe = venv_pip if venv_pip.exists() else "pip"

    log.warning(f"[E001] '{module_name}' topilmadi. O'rnatilmoqda: {pip_package}")

    try:
        result = subprocess.run(
            [str(pip_exe), "install", pip_package],
            capture_output=True, text=True, timeout=120
        )
        success = result.returncode == 0
        if success:
            log.info(f"[E001] ✅ '{pip_package}' muvaffaqiyatli o'rnatildi!")
        else:
            log.error(f"[E001] ❌ O'rnatishda xato: {result.stderr[:300]}")
        record_patch("E001", f"'{module_name}' yo'q edi", f"pip install {pip_package}", success)
        return success
    except Exception as e:
        log.error(f"[E001] O'rnatishda istisno: {e}")
        return False


def auto_fix_import(match: re.Match, context: dict) -> bool:
    """E002: models.py va boshqa fayllarda etishmayotgan importni qo'shadi."""
    missing_name = match.group(1)
    target_file  = context.get("file", BASE_DIR / "models.py")
    
    # SQLAlchemy turlar
    sqlalchemy_types = {
        "Column", "Boolean", "Integer", "String", "Text", "Float",
        "DateTime", "ForeignKey", "Enum", "BigInteger", "JSON",
        "UniqueConstraint", "Index",
    }

    if missing_name in sqlalchemy_types:
        file_path = Path(target_file) if target_file else BASE_DIR / "models.py"
        if not file_path.exists():
            return False
        
        content = file_path.read_text(encoding="utf-8")
        # Mavjud sqlalchemy import qatorini topib, missing_name ni qo'shamiz
        pattern = r"(from sqlalchemy import [^\n]+)"
        m       = re.search(pattern, content)
        if m:
            old_import = m.group(1)
            if missing_name not in old_import:
                new_import = old_import.rstrip() + f", {missing_name}"
                new_content = content.replace(old_import, new_import, 1)
                file_path.write_text(new_content, encoding="utf-8")
                log.info(f"[E002] ✅ '{missing_name}' importi {file_path.name} ga qo'shildi.")
                record_patch("E002", f"'{missing_name}' import qilinmagan", f"{file_path.name} ga import qo'shildi", True)
                return True

    log.warning(f"[E002] '{missing_name}' uchun avtomatik import topilmadi. Qo'lda tekshiring.")
    record_patch("E002", f"'{missing_name}' import qilinmagan", "Avtomatik tuzatilmadi, qo'lda tekshiring", False)
    return False


def auto_fix_duplicate_table(match: re.Match, context: dict) -> bool:
    """E003: models.py dagi takrorlangan jadval (class) ni topib, eski variantini o'chiradi."""
    table_name = match.group(1)
    models_file = BASE_DIR / "models.py"
    if not models_file.exists():
        return False

    content = models_file.read_text(encoding="utf-8")
    lines   = content.split("\n")

    # Barcha class bloklarini top
    class_starts = []
    for i, line in enumerate(lines):
        m = re.match(r'^class\s+(\w+)\(Base\)', line.strip())
        if m:
            class_starts.append((i, m.group(1)))

    # Bir xil jadval nomiga ega klasslarni top
    table_classes = []
    for file_path in [models_file]:
        src = file_path.read_text(encoding="utf-8")
        pattern = rf'class\s+(\w+)\(Base\):[\s\S]*?__tablename__\s*=\s*["\']({re.escape(table_name)})["\']'
        for m in re.finditer(pattern, src):
            table_classes.append((m.start(), m.group(1)))

    if len(table_classes) >= 2:
        # Birinchi (eskirgan) variantini olib tashlaymiz
        first_start = table_classes[0][0]
        second_start = table_classes[1][0]

        old_block = content[first_start:second_start]
        new_content = content.replace(old_block, "\n", 1)
        models_file.write_text(new_content, encoding="utf-8")
        log.info(f"[E003] ✅ Takrorlangan '{table_name}' jadvali models.py dan olib tashlandi!")
        record_patch("E003", f"Jadval '{table_name}' takrorlangan edi", "Birinchi (eski) variant o'chirildi", True)
        return True

    return False


def auto_kill_port(match: re.Match, context: dict) -> bool:
    """E007: Band portni avtomatik bo'shatadi (8000 portni o'ldiradi)."""
    log.warning("[E007] Port band! Zombie server jarayonlari o'chirilmoqda...")
    try:
        result = subprocess.run(
            ["powershell", "-Command",
             "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | "
             "Select-Object -ExpandProperty OwningProcess | "
             "ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"],
            capture_output=True, text=True, timeout=15
        )
        log.info("[E007] ✅ Port 8000 bo'shatildi.")
        record_patch("E007", "Port 8000 band edi", "Zombie jarayon o'chirildi", True)
        return True
    except Exception as e:
        log.error(f"[E007] Port o'chirishda xato: {e}")
        return False


def auto_backup_db(match: re.Match, context: dict) -> bool:
    """E010: Baza buzilganda avtomatik zaxira nusxa oladi."""
    db_file    = BASE_DIR / "data" / "football.db"
    backup_dir = BASE_DIR / "logs" / "db_backups"
    backup_dir.mkdir(exist_ok=True)
    timestamp  = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"football_backup_{timestamp}.db"

    if db_file.exists():
        import shutil
        shutil.copy2(db_file, backup_file)
        log.info(f"[E010] ✅ Baza zaxiralandi: {backup_file}")
        record_patch("E010", "Baza buzilganga o'xshaydi", f"Zaxira: {backup_file}", True)
        return True
    return False


def log_and_alert(match: re.Match, context: dict) -> bool:
    """Umumiy ogohlantirish — faqat qayd qiladi va Obsidian ga yozadi."""
    error_id  = context.get("error_id", "E???")
    desc      = context.get("description", "Noma'lum xatolik")
    raw_line  = context.get("raw_line", "")
    health_report["alerts_sent"] += 1
    _file     = context.get("file", "Noma'lum")
    _line_no  = context.get("line_no", "?")
    update_obsidian(
        f"⚠️ OGOHLANTIRISH [{error_id}]: {desc}",
        f"- **Manba**: `{_file}`\n"
        f"- **Qator**: {_line_no}\n"
        f"- **Log**: `{raw_line[:200]}`"
    )
    return True  # Qayd qilindi


# ─── ACTION ROUTER ────────────────────────────────────────────────────────────
ACTION_MAP = {
    "auto_install_module":      auto_install_module,
    "auto_fix_import":          auto_fix_import,
    "auto_fix_duplicate_table": auto_fix_duplicate_table,
    "auto_kill_port":           auto_kill_port,
    "auto_backup_db":           auto_backup_db,
    "log_and_alert":            log_and_alert,
}


# ─── ASOSIY SKANER ────────────────────────────────────────────────────────────

def analyze_log_line(line: str, source_file: Optional[str] = None):
    """
    Bitta log qatorini barcha ma'lum xatolik patternsiga qarab skanerlaydi.
    Mos kelsa tegishli auto-patch funksiyasini chaqiradi.
    """
    for error_def in KNOWN_ERROR_PATTERNS:
        m = re.search(error_def["pattern"], line, re.IGNORECASE)
        if m:
            eid  = error_def["id"]
            desc = error_def["description"]
            sev  = error_def["severity"]
            log.warning(f"🚨 [{eid}] [{sev}] Xatolik aniqlandi: {desc}")
            log.warning(f"   Log: {line.strip()[:200]}")

            health_report["total_errors"] += 1
            health_report["error_counts"][eid] += 1
            save_health_report()

            context = {
                "error_id":    eid,
                "description": desc,
                "file":        source_file,
                "line_no":     "?",
                "raw_line":    line,
            }

            action_fn = ACTION_MAP.get(error_def["action"])
            if action_fn:
                try:
                    action_fn(m, context)
                except Exception as ex:
                    log.error(f"[{eid}] Patch funksiyasida xato: {ex}")
            break  # Birinchi mos kelgan patternga qarab ishlaydi


def scan_existing_source_files():
    """
    Loyihadagi barcha .py fayllarni syntaksis xatolar uchun tekshiradi.
    Xato topilsa qayd etadi.
    """
    log.info("📂 Barcha Python fayllari skanerlanyapti (AST tekshiruvi)...")
    py_files = list(BASE_DIR.glob("backend/**/*.py")) + list(BASE_DIR.glob("bot/**/*.py")) + list(BASE_DIR.glob("scripts/**/*.py"))
    errors_found = 0

    for py_file in py_files:
        if py_file.name.startswith("__"):
            continue
        try:
            source = py_file.read_text(encoding="utf-8", errors="replace")
            ast.parse(source, filename=str(py_file))
        except SyntaxError as e:
            log.error(f"🔴 SINTAKSIS XATO: {py_file.name} qator {e.lineno}: {e.msg}")
            analyze_log_line(f"SyntaxError: {e.msg} (<string>, line {e.lineno})", str(py_file))
            errors_found += 1
        except Exception as e:
            log.error(f"🔴 {py_file.name} tekshirishda xato: {e}")

    if errors_found == 0:
        log.info("✅ Barcha Python fayllar sintaksis jihatdan to'g'ri!")
    else:
        log.warning(f"⚠️ Jami {errors_found} ta sintaksis xatolik topildi.")

    update_obsidian(
        "📂 Manbaa Fayllar Skaneri Tugadi",
        f"- **Tekshirilgan fayllar**: {len(py_files)}\n"
        f"- **Xatoliklar**: {errors_found}"
    )


def monitor_server_log_file():
    """
    `logs/server_runtime.log` faylini real vaqtda kuzatadi (tail -f rejimi).
    FastAPI uvicorn loglari shu faylga yozilishi kerak.
    """
    log.info(f"👁️  Server log fayli kuzatilmoqda: {SERVER_LOG_FILE}")
    SERVER_LOG_FILE.touch(exist_ok=True)

    with open(SERVER_LOG_FILE, "r", encoding="utf-8", errors="replace") as f:
        f.seek(0, 2)  # Oxiriga o'tish (faqat yangi qatorlarni o'qish)
        while True:
            line = f.readline()
            if line:
                analyze_log_line(line)
            else:
                time.sleep(0.5)


def run_server_with_logging():
    """
    Backend FastAPI serverni ishga tushiradi va loglarni ham faylga,
    ham real vaqtda skanerga yo'naltiradi.
    """
    venv_py = BASE_DIR / ".venv" / ("Scripts" if os.name == "nt" else "bin") / ("python.exe" if os.name == "nt" else "python")
    python_exe = venv_py if venv_py.exists() else sys.executable
    cmd = [
        str(python_exe), "-m", "uvicorn", "main:app",
        "--reload", "--port", "8000",
        "--log-level", "info",
    ]
    log.info(f"🚀 Backend server ishga tushirilmoqda: {' '.join(cmd)}")

    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        cwd=str(BASE_DIR / "backend"),
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,
    )

    # Log faylga yozish + real vaqtda skanerlash
    with open(SERVER_LOG_FILE, "a", encoding="utf-8") as log_file:
        for line in proc.stdout:
            sys.stdout.write(f"  [SERVER] {line}")
            log_file.write(line)
            log_file.flush()
            analyze_log_line(line)

    proc.wait()
    return proc.returncode


def periodic_health_check(interval: int = 60):
    """
    Har N sekundda tizim sog'ligini tekshiradi va Obsidian ga yozadi.
    """
    while True:
        time.sleep(interval)
        db_file = BASE_DIR / "data" / "football.db"
        db_ok   = db_file.exists() and db_file.stat().st_size > 0

        status_lines = [
            f"- **Vaqt**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"- **Baza holati**: {'✅ Yaxshi' if db_ok else '❌ Muammo!'}",
            f"- **Jami xatoliklar**: {health_report['total_errors']}",
            f"- **Avtomatik tuzatishlar**: {health_report['auto_patched']}",
            f"- **Ogohlantirishlar**: {health_report['alerts_sent']}",
        ]
        update_obsidian("🩺 Davriy Sog'liq Tekshiruvi", "\n".join(status_lines))
        save_health_report()
        log.info(
            f"🩺 Sog'liq: Xatolar={health_report['total_errors']} | "
            f"Patchlar={health_report['auto_patched']} | "
            f"Baza={'OK' if db_ok else 'MUAMMO'}"
        )


# ─── KIRISH NUQTASI ───────────────────────────────────────────────────────────

def main():
    log.info("=" * 70)
    log.info("  ABDULBOSIT - Full-Server Self-Healing Core ishga tushdi!")
    log.info("=" * 70)

    update_obsidian(
        "🚦 ABDULBOSIT Monitor Ishga Tushdi",
        f"- **Vaqt**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"- **Loyiha**: FootballRise Platform\n"
        f"- **Rejim**: Self-Healing + Auto-Patch + Obsidian Sync"
    )

    # 1) Mavjud fayllarni skanerlash
    scan_existing_source_files()

    # 2) Davriy sog'liq tekshiruvini fon oqimida ishga tushirish
    health_thread = threading.Thread(
        target=periodic_health_check, args=(60,), daemon=True
    )
    health_thread.start()

    # 3) Backend serverni ishga tushirish va loglarni real vaqtda kuzatish
    #    (Server to'xtasa avtomatik qayta ishga tushiradi)
    MAX_RESTARTS = 5
    restart_count = 0

    while restart_count < MAX_RESTARTS:
        exit_code = run_server_with_logging()
        if exit_code == 0:
            log.info("ℹ️  Server normal to'xtadi.")
            break
        restart_count += 1
        log.error(f"❌ Server kutilmagan tarzda yopildi! (kod: {exit_code})")
        log.warning(f"🔄 Qayta ishga tushirilmoqda... ({restart_count}/{MAX_RESTARTS})")
        update_obsidian(
            f"🔄 Server Qayta Ishga Tushirildi ({restart_count}/{MAX_RESTARTS})",
            f"- **Chiqish kodi**: {exit_code}\n- **Qayta urinish**: {restart_count}"
        )
        time.sleep(3)

    if restart_count >= MAX_RESTARTS:
        log.critical("💀 Maksimal qayta urinish soni oshib ketdi. Admin aralashuvi kerak!")
        update_obsidian(
            "💀 KRITIK: Server Tamoman Yopildi",
            f"- Maksimal {MAX_RESTARTS} qayta urinish bilan ham tiklash muvaffaqiyatsiz bo'ldi.\n"
            f"- Qo'lda aralashish talab qilinadi."
        )


if __name__ == "__main__":
    main()
