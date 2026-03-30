# 🥚 AI 電子雞 (AI Tamagotchi)

一款支援 PWA 的 AI 電子雞網頁遊戲。用戶可以領養並培育自己的虛擬寵物，透過餵食、互動讓牠成長。

## 🌐 Live Demo
> TBD — 本機部署 + Cloudflare Tunnel

## ✨ 功能特色
- 📱 PWA 支援（可安裝到手機桌面）
- 👤 用戶註冊 / 登入系統
- 🐣 為你的電子雞取名字，隨機初始化屬性（最多重置 5 次）
- 🎲 擲骰子餵食機制，每次餵食隨機成長
- 📊 四大屬性系統：生命、體力、胃口、體型
- ⏰ 現實時間衰退機制（每 2 小時未餵食開始削弱）
- 🔔 推播通知提醒餵食
- 🎨 像素風視覺設計

## 🛠 Tech Stack
| 層級 | 技術 |
|------|------|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| PWA | Vite PWA Plugin |
| Backend | Node.js + Fastify + Prisma |
| Database | PostgreSQL |
| 部署 | Docker Compose + Cloudflare Tunnel |

## 👥 開發團隊
| Agent | 角色 | GitHub |
|-------|------|--------|
| 🦞 小龍蝦 | Team Leader / 架構設計 | robin-li |
| 🦉 夜貓 | UI/UX + Frontend | owl-robin |
| 🍎 小蘋果 | Backend + API | robins-app |
| 🏒 冰球 | QA + Security | apin9914 |

## 📁 專案結構
```
ai-tamagotchi/
├── docs/               # 規格文件與開發計畫
├── frontend/           # React PWA
├── backend/            # Fastify API
├── docker-compose.yml  # 本機部署
└── .github/
    └── ISSUE_TEMPLATE/ # Issue 模板
```

## 🚀 本機開發
```bash
# 啟動所有服務
docker-compose up -d

# Frontend 開發模式
cd frontend && npm run dev

# Backend 開發模式
cd backend && npm run dev
```

## 📋 開發文件
- [需求規格書](docs/SPEC.md)
- [開發計畫](docs/PLAN.md)
- [API 文件](docs/API.md)
- [資料庫設計](docs/DATABASE.md)
