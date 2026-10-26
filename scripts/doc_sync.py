import os
import time
import json
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Kuzatiladigan papka va log fayl manzillari
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WATCH_DIR = os.path.join(BASE_DIR, "docs", "obsidian_sync")
METADATA_FILE = os.path.join(BASE_DIR, "docs", "obsidian_metadata.json")

def update_metadata(event_type, file_path):
    if not os.path.exists(os.path.dirname(METADATA_FILE)):
        os.makedirs(os.path.dirname(METADATA_FILE), exist_ok=True)
        
    if not os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f)
            
    try:
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
    except Exception:
        data = []

    file_name = os.path.basename(file_path)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    record = {
        "file": file_name,
        "event": event_type,
        "timestamp": timestamp,
        "path": file_path
    }
    data.append(record)
    
    # Faqat so'nggi 50 ta o'zgarishni saqlaymiz (fayl hajmi juda oshib ketmasligi uchun)
    if len(data) > 50:
        data = data[-50:]

    with open(METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
        
    print(f"[{timestamp}] {event_type.upper()}: {file_name} -> Metadata saqlandi.")

class ObsidianSyncHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            update_metadata("yaratildi", event.src_path)

    def on_modified(self, event):
        if not event.is_directory:
            update_metadata("o'zgartirildi", event.src_path)
            
    def on_deleted(self, event):
        if not event.is_directory:
            update_metadata("o'chirildi", event.src_path)

def start_watcher():
    if not os.path.exists(WATCH_DIR):
        print(f"Xatolik: {WATCH_DIR} papkasi topilmadi! Iltimos, uni avval yarating.")
        return

    event_handler = ObsidianSyncHandler()
    observer = Observer()
    observer.schedule(event_handler, WATCH_DIR, recursive=True)
    observer.start()
    
    print("=" * 50)
    print(f"🔍 Obsidian File Watcher ishga tushdi!")
    print(f"📂 Kuzatilmoqda: {WATCH_DIR}")
    print(f"📄 Qaydlar saqlanadi: {METADATA_FILE}")
    print("=" * 50)
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\n⏹ Kuzatuv to'xtatildi.")
    observer.join()

if __name__ == "__main__":
    start_watcher()
