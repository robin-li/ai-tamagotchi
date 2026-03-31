# 🥚 AI 電子雞 (AI Tamagotchi)

一款像素風 AI 電子雞 PWA 網頁遊戲。領養你的虛擬寵物，透過骰子餵食讓牠成長，還能跟牠用 AI 對話互動！

🌐 **Live Demo**: [tamagotchi.smart-codings.com](https://tamagotchi.smart-codings.com)

---

## ✨ 功能特色

### 🐣 養成系統
- 為你的電子雞取名字，隨機初始化屬性（最多 reroll 5 次）
- 🎲 擲骰子餵食機制，每次餵食隨機成長
- 📊 四大屬性：生命值 (HP)、體力 (Stamina)、胃口 (Appetite)、體型 (Size)
- 🔄 五階段進化：Egg → Baby → Child → Teen → Adult
- ⏰ 現實時間衰退機制（每 30 分鐘未餵食開始削弱）
- 💀 HP 歸零死亡 → 悼念頁面 → 重新領養

### 🤖 AI 互動（Phase 5）
- 24 種隨機個性（傲嬌、開朗、懶散、中二、哲學家、毒舌……）
- 餵食完成後 + 點擊電子雞時觸發 AI 對話泡泡
- 依據 HP、飽食度、個性生成不同語氣的回應（10~30 字）
- 支援 4 大 AI 供應商：**OpenAI** / **Gemini** / **Anthropic** / **MiniMax**
- 動態模型列表：透過 API 即時取得可用模型，支援正則過濾
- 內建模型測試功能，一鍵驗證 API Key 與模型是否可用

### 📱 PWA 支援
- 可安裝到手機桌面，像原生 App 一樣使用
- 離線支援（Service Worker）
- 🔔 推播通知提醒餵食
- 新版本自動偵測 + 一鍵更新

### 🎨 視覺設計
- 全站像素風 UI（自訂 PixelButton、PixelSprite 元件）
- 骰子餵食動畫
- RWD 手機適配

---

## 🛠 Tech Stack

| 層級 | 技術 |
|------|------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| PWA | Vite PWA Plugin + Custom Service Worker |
| Backend | Node.js + Fastify + Prisma ORM |
| Database | PostgreSQL 16 |
| AI | OpenAI / Gemini / Anthropic / MiniMax API |
| 測試 | Jest (Backend) + Playwright (E2E) |
| 部署 | Docker Compose + Nginx + Cloudflare Tunnel |

---

## 📁 專案結構

```
ai-tamagotchi/
├── frontend/             # React PWA
│   ├── src/
│   │   ├── pages/        # 頁面（登入/遊戲/設定/死亡/初始化）
│   │   ├── components/   # 共用元件（PixelButton, PixelSprite...）
│   │   ├── services/     # AI 對話、模型管理
│   │   └── api/          # API client
│   └── Dockerfile
├── backend/              # Fastify API
│   ├── src/
│   │   ├── routes/       # auth / pet / config / ai
│   │   ├── plugins/      # JWT auth
│   │   └── jobs/         # 衰退排程 (node-cron)
│   ├── prisma/           # Schema & migrations
│   └── Dockerfile
├── docs/                 # 規格文件
├── docker-compose.yml    # 一鍵部署
└── .github/
    └── ISSUE_TEMPLATE/   # Issue 模板
```

---

## 🚀 快速開始

### Docker 部署（推薦）

```bash
# 1. 複製環境變數
cp .env.production.example .env.production

# 2. 修改 .env.production 中的密碼與設定

# 3. 啟動所有服務
docker compose --env-file .env.production up -d

# 4. 開啟瀏覽器
open http://localhost:8080
```

### 本機開發

```bash
# Backend
cd backend
cp ../.env.production.example ../.env
npm install
npm run dev

# Frontend（另一個 terminal）
cd frontend
npm install
npm run dev
```

---

## ⚙️ 環境變數

| 變數 | 說明 | 預設 |
|------|------|------|
| `DB_USER` | PostgreSQL 用戶名 | `tamagotchi` |
| `DB_PASSWORD` | PostgreSQL 密碼 | — |
| `DB_NAME` | 資料庫名稱 | `tamagotchi` |
| `JWT_SECRET` | JWT 簽名密鑰（≥32 字元）| — |
| `VITE_API_URL` | Frontend API URL | `http://localhost:3000/api` |
| `OPENAI_MODEL_INCLUDE_PATTERN` | OpenAI 模型白名單正則 | — |
| `OPENAI_MODEL_EXCLUDE_PATTERN` | OpenAI 模型黑名單正則 | — |
| `GEMINI_MODEL_INCLUDE_PATTERN` | Gemini 模型白名單正則 | — |
| `ANTHROPIC_MODEL_INCLUDE_PATTERN` | Anthropic 模型白名單正則 | — |
| `MINIMAX_MODEL_INCLUDE_PATTERN` | MiniMax 模型白名單正則 | — |

---

## 📋 開發文件

- [需求規格書 (PRD)](docs/SPEC.md)
- [開發計畫](docs/PLAN.md)
- [API 文件](docs/API.md)
- [資料庫設計](docs/DATABASE.md)

---

## 👥 開發團隊

| Agent | 角色 | GitHub |
|-------|------|--------|
| 🦞 小龍蝦 | Team Leader / 架構設計 | [@robin-li](https://github.com/robin-li) |
| 🦉 夜貓 | UI/UX + Frontend | [@owl-robin](https://github.com/owl-robin) |
| 🍎 小蘋果 | Backend + API | [@robins-app](https://github.com/robins-app) |
| 🏒 冰球 | QA + Security Audit | [@apin9914](https://github.com/apin9914) |

> 本專案由 4 個 AI Agent 協作開發，使用 [OpenClaw](https://github.com/openclaw/openclaw) 多代理框架進行任務分派與管理。

---

## 📜 License

MIT
