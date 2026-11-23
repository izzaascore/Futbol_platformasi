#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
====================================================================
Futuro Football Platform - Uzbek Alphabet Converter
====================================================================
Eski O'zbek lotin alifbosidagi matnlarni Yangi O'zbek lotin alifbosiga
(ş, ç, õ, ğ) avtomatik o'giruvchi xavfsiz skript.

Qoidalar:
  - sh / Sh / SH -> ş / Ş
  - ch / Ch / CH -> ç / Ç
  - o' / O' (barcha apostrof variantlari: ' ‘ ’ ʻ ʼ ` ´) -> õ / Õ
  - g' / G' (barcha apostrof variantlari: ' ‘ ’ ʻ ʼ ` ´) -> ğ / Ğ
  - Is'hoq, mus'haf (s'h, c'h) kabi ajratuvchi apostroflar saqlanadi.
  - Kod bloklari (```kod```, `kod`), teglari (<div ...>), URL manzillar
    va inglizcha dasturlash kalit so'zlari (push, fetch, catch, switch va h.k.)
    avtomatik himoyalanadi!

Qo'llanishi:
  1) Matnni o'girish:
     python scripts/convert_alphabet.py --text "O'zbekiston chempionati shiddatli o'tmoqda"

  2) Interaktiv rejim (jonli konsol):
     python scripts/convert_alphabet.py --interactive

  3) Faylni o'girish (masalan README.md):
     python scripts/convert_alphabet.py --file README.md --backup

  4) Papkadagi barcha matnli fayllarni o'girish:
     python scripts/convert_alphabet.py --dir "MD fayllar" --dry-run
====================================================================
"""

import os
import sys
import re
import argparse
from pathlib import Path
from typing import Tuple, List

# Barcha mumkin bo'lgan apostrof belgilari
APOSTROPHES = "['‘’ʻʼ`´]"

# Dasturlash va kod atamalari ro'yxati (kod fayllarida soxta o'zgarishlarni oldini oladi)
CODE_EXCLUSIONS = {
    # JavaScript / Python / React kalit so'zlari
    "push", "fetch", "catch", "switch", "match", "search", "refresh", "show", "shown",
    "channel", "checkout", "cache", "checkbox", "children", "child", "props", "dispatch",
    "share", "short", "action", "shadow", "dashboard", "should", "which", "each", "such",
    "much", "rich", "change", "chart", "check", "checked", "choose", "chunk", "shift",
    "sheet", "shell", "shield", "shoot", "shop", "shrink", "shutdown", "splash", "crash",
    "hash", "flash", "publish", "finish", "establish", "wish", "fish", "dish", "branch",
    "batch", "patch", "watch", "touch", "reach", "teach", "speech", "approach",
    "attachment", "schema", "scheduler", "schedule", "auth", "oauth", "token", "localhost",
    "github", "react", "fastapi", "vite", "lucide", "tailwind", "import", "export",
    "class", "function", "const", "let", "var", "return", "true", "false", "null",
    "undefined", "async", "await", "default", "from", "render", "path", "file",
    "width", "height", "length", "method", "header", "headers", "status", "response",
    "request", "params", "query", "filter", "border", "rounded", "hidden", "flex"
}


def convert_word_old_to_new(word: str) -> str:
    """Bitta so'zni eski alifbodan yangi alifboga o'giradi."""
    # Agar so'z toza inglizcha kod so'zi bo'lsa, o'zgarishsiz qoldiramiz
    lower_clean = re.sub(r"[^\w]", "", word).lower()
    if lower_clean in CODE_EXCLUSIONS:
        return word

    res = word

    # 1. s'h va c'h (ajratuvchi apostrof) ni himoyalash: Is'hoq, mus'haf
    res = re.sub(r"([sScC])" + APOSTROPHES + r"([hH])", r"\1__PROTECTED_APOS__\2", res)

    # 2. O' -> Õ
    # Butunlay katta harfli so'zlarda (masalan O'ZBEKISTON, MO'LJALLANGAN)
    res = re.sub(r"O" + APOSTROPHES + r"(?=[A-ZА-ЯЁ])", "Õ", res)
    # Bosh harf yoki alohida O' (masalan O'zbekiston, O'quvchi)
    res = re.sub(r"O" + APOSTROPHES, "Õ", res)
    # Kichik harf o' (masalan o'tmoqda, o'yin, mo'ljal, to'p)
    res = re.sub(r"o" + APOSTROPHES, "õ", res)

    # 3. G' -> Ğ
    res = re.sub(r"G" + APOSTROPHES + r"(?=[A-ZА-ЯЁ])", "Ğ", res)
    res = re.sub(r"G" + APOSTROPHES, "Ğ", res)
    res = re.sub(r"g" + APOSTROPHES, "ğ", res)

    # 4. SH -> Ş
    # Katta harfli SH (masalan SHAXSIY, CHIQISH, TASHKIL)
    res = re.sub(r"SH(?=[A-ZА-ЯЁ]|\b)", "Ş", res)
    res = re.sub(r"(?<=[A-ZА-ЯЁ])SH", "Ş", res)
    # Shaxs, Shahar, Shartnoma
    res = re.sub(r"Sh", "Ş", res)
    # shahar, boshqa, yosh, ish
    res = re.sub(r"sh", "ş", res)

    # 5. CH -> Ç
    res = re.sub(r"CH(?=[A-ZА-ЯЁ]|\b)", "Ç", res)
    res = re.sub(r"(?<=[A-ZА-ЯЁ])CH", "Ç", res)
    res = re.sub(r"Ch", "Ç", res)
    res = re.sub(r"ch", "ç", res)

    # Himoyalangan ajratuvchi apostrofni qaytarish
    res = res.replace("__PROTECTED_APOS__", "'")
    return res


def convert_word_new_to_old(word: str) -> str:
    """Yangi alifbodagi so'zni eski alifboga qaytaradi (Reverse mode)."""
    res = word
    # Ş -> Sh / sh
    res = re.sub(r"Ş(?=[A-ZА-ЯЁ])", "SH", res)
    res = res.replace("Ş", "Sh")
    res = res.replace("ş", "sh")

    # Ç -> Ch / ch
    res = re.sub(r"Ç(?=[A-ZА-ЯЁ])", "CH", res)
    res = res.replace("Ç", "Ch")
    res = res.replace("ç", "ch")

    # Õ -> O' / o'
    res = res.replace("Õ", "O'")
    res = res.replace("õ", "o'")

    # Ğ -> G' / g'
    res = res.replace("Ğ", "G'")
    res = res.replace("ğ", "g'")

    return res


def convert_text(text: str, reverse: bool = False) -> str:
    """
    Butun matnni o'giradi.
    Markdown kod bloklari (```...```), inline kod (`...`), URL manzillar
    va HTML/JSX teglari (<...>) avtomatik saqlab qolinadi.
    """
    if not text:
        return text

    # Himoyalanadigan qismlar ro'yxati
    placeholders = []

    def save_placeholder(match):
        idx = len(placeholders)
        placeholders.append(match.group(0))
        return f"__SAFE_BLOCK_{idx}__"

    # 1. Fenced kod bloklari ```...```
    text = re.sub(r"```[\s\S]*?```", save_placeholder, text)

    # 2. Inline kod `...`
    text = re.sub(r"`[^`\n]+`", save_placeholder, text)

    # 3. URL manzillar (http://..., https://...)
    text = re.sub(r"https?://[^\s<>\"']+", save_placeholder, text)

    # 4. HTML/JSX teglari <...>, masalan <div className="...">
    text = re.sub(r"<[^>\n]+>", save_placeholder, text)

    # Matnni so'zlar va tinish belgilariga ajratib konvertatsiya qilamiz
    # So'z strukturasi: harflar, raqamlar va apostroflar
    word_pattern = re.compile(r"([A-Za-zА-Яа-яЁё0-9şŞçÇõÕğĞ]+(?:['‘’ʻʼ`´][A-Za-zА-Яа-яЁё0-9şŞçÇõÕğĞ]+)*)")

    def replace_word(m):
        w = m.group(0)
        return convert_word_new_to_old(w) if reverse else convert_word_old_to_new(w)

    result = word_pattern.sub(replace_word, text)

    # Himoyalangan bloklarni asliga qaytarish
    for idx, orig in enumerate(placeholders):
        result = result.replace(f"__SAFE_BLOCK_{idx}__", orig)

    return result


def process_file(file_path: Path, reverse: bool = False, dry_run: bool = False, backup: bool = False) -> Tuple[bool, int]:
    """Bitta faylni o'qiydi, o'giradi va kerak bo'lsa saqlaydi."""
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"❌ Faylni o'qishda xatolik ({file_path}): {e}")
        return False, 0

    converted = convert_text(content, reverse=reverse)
    if content == converted:
        return False, 0  # Hech qanday o'zgarish yo'q

    # Nechta satr o'zgarganini hisoblash
    orig_lines = content.splitlines()
    new_lines = converted.splitlines()
    changed_lines = sum(1 for o, n in zip(orig_lines, new_lines) if o != n) + abs(len(orig_lines) - len(new_lines))

    if dry_run:
        print(f"🔍 [DRY-RUN] {file_path}: {changed_lines} ta satrda o'zgarish topildi.")
        # Namuna ko'rsatish
        for o, n in zip(orig_lines, new_lines):
            if o != n:
                print(f"   - {o[:80]}")
                print(f"   + {n[:80]}")
                break
        return True, changed_lines

    if backup:
        bak_path = file_path.with_suffix(file_path.suffix + ".bak")
        bak_path.write_text(content, encoding="utf-8")
        print(f"💾 Zaxira nusxa yaratildi: {bak_path}")

    try:
        file_path.write_text(converted, encoding="utf-8")
        print(f"✅ O'zgartirildi: {file_path} ({changed_lines} ta satr)")
        return True, changed_lines
    except Exception as e:
        print(f"❌ Faylga yozishda xatolik ({file_path}): {e}")
        return False, 0


def interactive_mode(reverse: bool = False):
    """Foydalanuvchi bilan konsolda jonli muloqot rejimi."""
    direction = "Yangi -> Eski" if reverse else "Eski -> Yangi (ş, ç, õ, ğ)"
    print("\n" + "=" * 65)
    print(f"🇺🇿 FUTURO ALIFBO KONVERTERI - JONLI REJIM ({direction})")
    print("Matn kiriting va [ENTER] bosing. Chiqish uchun 'exit' yoki 'q' yozing.")
    print("=" * 65 + "\n")

    while True:
        try:
            line = input("📝 Kiriting > ").strip()
            if not line:
                continue
            if line.lower() in ["exit", "quit", "q"]:
                print("👋 Dastur yakunlandi.")
                break
            result = convert_text(line, reverse=reverse)
            print(f"✨ Natija   > {result}\n")
        except (KeyboardInterrupt, EOFError):
            print("\n👋 Dastur yakunlandi.")
            break


def main():
    parser = argparse.ArgumentParser(
        description="Eski O'zbek alifbosini Yangi O'zbek alifbosiga (ş, ç, õ, ğ) o'giruvchi xavfsiz skript"
    )
    parser.add_argument("--text", "-t", type=str, help="O'girilishi kerak bo'lgan matn")
    parser.add_argument("--file", "-f", type=str, help="Bitta faylni o'girish (masalan README.md)")
    parser.add_argument("--dir", "-d", type=str, help="Papkadagi fayllarni o'girish (masalan 'MD fayllar')")
    parser.add_argument(
        "--ext",
        type=str,
        default=".md,.txt,.json",
        help="Papkadagi fayl kengaytmalari filtri (standart: .md,.txt,.json)"
    )
    parser.add_argument("--interactive", "-i", action="store_true", help="Jonli konsol rejimini yoqish")
    parser.add_argument("--reverse", "-r", action="store_true", help="Yangi alifbodan eski alifboga qaytarish")
    parser.add_argument("--dry-run", action="store_true", help="Faylni o'zgartirmasdan faqat o'zgarishlarni ko'rish")
    parser.add_argument("--backup", "-b", action="store_true", help="O'zgartirishdan oldin .bak fayl yaratish")

    args = parser.parse_args()

    # 1. Jonli rejim
    if args.interactive:
        interactive_mode(reverse=args.reverse)
        return

    # 2. To'g'ridan-to'g'ri matn berilgan bo'lsa
    if args.text:
        print(convert_text(args.text, reverse=args.reverse))
        return

    # 3. Bitta fayl berilgan bo'lsa
    if args.file:
        fp = Path(args.file)
        if not fp.exists():
            print(f"❌ Fayl topilmadi: {fp}")
            sys.exit(1)
        process_file(fp, reverse=args.reverse, dry_run=args.dry_run, backup=args.backup)
        return

    # 4. Papka berilgan bo'lsa
    if args.dir:
        dp = Path(args.dir)
        if not dp.exists() or not dp.is_dir():
            print(f"❌ Papka topilmadi: {dp}")
            sys.exit(1)

        exts = [e.strip().lower() if e.startswith(".") else f".{e.strip().lower()}" for e in args.ext.split(",")]
        total_files = 0
        changed_files = 0
        total_changed_lines = 0

        for root, _, files in os.walk(dp):
            for file in files:
                fpath = Path(root) / file
                if fpath.suffix.lower() in exts:
                    total_files += 1
                    changed, lines_count = process_file(
                        fpath,
                        reverse=args.reverse,
                        dry_run=args.dry_run,
                        backup=args.backup
                    )
                    if changed:
                        changed_files += 1
                        total_changed_lines += lines_count

        print("\n" + "=" * 50)
        print(f"📊 Hisobot: {total_files} ta fayl tekshirildi.")
        print(f"✏️  {changed_files} ta faylda {total_changed_lines} ta satr yangilandi.")
        print("=" * 50)
        return

    # Agar hech qanday argument berilmagan bo'lsa, qisqa yo'riqnoma va test
    print("ℹ️ Foydalanish:")
    print("  python scripts/convert_alphabet.py --text \"O'zbekiston chempionati shiddatli o'tmoqda\"")
    print("  python scripts/convert_alphabet.py --interactive")
    print("  python scripts/convert_alphabet.py --file README.md --dry-run")
    print("  python scripts/convert_alphabet.py --dir \"MD fayllar\" --backup")


if __name__ == "__main__":
    main()
