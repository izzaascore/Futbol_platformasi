---
name: video_and_highlights
description: >
  Remotion & HyperFrames video generation guidelines. Explains how player highlights,
  goal clips, scout cards, and tournament promo videos are rendered via React code and Remotion compositions.
---

# Video & Highlights Generation Skill (Remotion & Dynamic Canvas)

Ushbu skill FootballRise platformasidagi o'yinchilarning eng yaxshi gollari, skaut kartochkalari va o'yin natijalari asosida avtomatlashtirilgan video-roliklar (Instagram/TikTok Reels formatida: 9:16) yaratish standartlarini belgilaydi.

## 1. 9:16 Vertikal Format (1080x1920)
- Barcha dinamik videokompozitsiyalar mobil formatda tuziladi.
- 60 fps silliq animatsiyalar.

## 2. Dynamic Player Scout Card
- O'yinchi rasmi, ismi, pozitsiyasi, OVR reytingi va eng yaxshi zarbalari videoga dinamik kiritiladi.
- O'yinchi harakatlari ustiga kiber-grafikalar (zarba tezligi km/h, burchak koordinatalari) qo'shiladi.

## 3. Web & Native Export
- Brauzerda HTML5 Canvas / WebCodecs yoki serverda Remotion CLI orqali `.mp4` video generatsiyasi.
