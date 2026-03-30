# 🗺️ AI 電子雞 — 開發計畫

> 版本：v1.1 | 日期：2026-03-30 | 狀態：待確認

---

## 一、團隊分工

| ID | Agent | 角色 | GitHub |
|----|-------|------|--------|
| A1 | 🦞 小龍蝦 | Team Leader / 架構 / 整合 / 部署 | robin-li |
| A2 | 🦉 夜貓 | Frontend / UI/UX / PWA | owl-robin |
| A3 | 🍎 小蘋果 | Backend / API / 資料庫 | robins-app |
| A4 | 🏒 冰球 | QA / Security / E2E 測試 | apin9914 |

---

## 二、工作流程規範

### 2.1 Issue 生命週期
```
Open（待領取）
  └─> In Progress（領取後，assignee 自行 assign）
        └─> Review（開 PR，tag reviewer）
              └─> Closed（PR merged）
```

### 2.2 Branch 規則
- `main`：保護分支，只接受 PR 合併
- Feature branch 命名：`feature/T{task-id}-{簡述}`（例：`feature/T03-auth-api`）
- Fix branch 命名：`fix/T{task-id}-{簡述}`

### 2.3 PR 規則
- 標題格式：`[T{id}] 簡述`
- 必須通過 lint + test CI
- 需 A1（小龍蝦）review 後合併

### 2.4 Issue 更新規範
每位 agent 在執行任務時，需在對應 Issue 留言更新狀態，包含：
- 開始作業：「開始作業，branch: feature/T{id}-xxx」
- 遇到問題：描述問題，tag 相關人員
- 完成：「已開 PR #xxx，請 review」

### 2.5 任務認領
- 各 agent 看到自己負責的 issue 後，自行 assign 並開 branch
- 若有疑問，在 issue 留言，tag A1

---

## 三、任務清單

### Phase 0：基礎建設

| Task ID | 任務名稱 | 負責人 | 前置任務 | 驗收條件 |
|---------|---------|--------|---------|---------|
| T01 | 建立 Monorepo 骨架（frontend/ + backend/ 目錄結構） | A1 | — | 目錄結構推上 main，frontend/backend 各有 package.json |
| T02 | 設定 Docker Compose（frontend + backend + postgres） | A1 | T01 | `docker-compose up` 可啟動三個服務 |
| T03 | 設定 GitHub Actions CI（lint + test） | A1 | T01 | PR 自動觸發 CI，失敗時阻擋合併 |
| T04 | 建立 GitHub Issue 模板與 Labels | A1 | — | Labels 與 Issue 模板建立完成 |

---

### Phase 1：後端核心

| Task ID | 任務名稱 | 負責人 | 前置任務 | 驗收條件 |
|---------|---------|--------|---------|---------|
| T05 | Prisma Schema 設計（User / Pet / FeedLog） | A3 | T02 | Schema 通過 `prisma validate`，migration 可執行 |
| T06 | 用戶註冊 API（POST /auth/register） | A3 | T05 | 可建立帳號，密碼 bcrypt 加密，回傳 JWT |
| T07 | 用戶登入 API（POST /auth/login） | A3 | T06 | 正確帳密回傳 JWT，錯誤帳密回傳 401 |
| T08 | 電子雞初始化 API（POST /pet/init） | A3 | T05 | 可建立電子雞、隨機屬性、檢查重置次數上限 5 次 |
| T09 | 電子雞查詢 API（GET /pet） | A3 | T08 | 回傳當前電子雞完整屬性與狀態 |
| T10 | 餵食 API（POST /pet/feed） | A3 | T09 | 骰子邏輯正確，屬性更新，記錄 FeedLog，檢查每日次數上限 |
| T11 | 衰退排程（每 30 分鐘執行） | A3 | T09 | Cron 正確執行，屬性依規格衰退，生命歸 0 時標記死亡 |
| T12 | API 安全審計 | A4 | T06-T11 | 無 SQL injection、無敏感資料外洩、JWT 驗證正確 |
| T13 | Backend 單元測試（覆蓋率 > 70%） | A4 | T06-T11 | `npm test` 通過，覆蓋率報告達標 |

---

### Phase 2：前端核心

| Task ID | 任務名稱 | 負責人 | 前置任務 | 驗收條件 |
|---------|---------|--------|---------|---------|
| T14 | Frontend 專案設定（Vite + React + TS + Tailwind + PWA） | A2 | T01 | `npm run dev` 可啟動，Lighthouse PWA 基礎項目通過 |
| T15 | 登入 / 註冊頁面 | A2 | T14, T07 | 可完成註冊、登入流程，表單驗證正確 |
| T16 | 電子雞初始化頁面（命名 + 屬性隨機 + 重置） | A2 | T15, T08 | 顯示隨機屬性、剩餘重置次數，確認後跳轉主頁 |
| T17 | 主遊戲頁面（電子雞展示 + 屬性面板） | A2 | T16, T09 | 顯示電子雞圖示（依成長階段）、四大屬性、每日餵食次數 |
| T18 | 餵食流程（骰子動畫 + 結果展示） | A2 | T17, T10 | 骰子動畫流暢，結果顯示事件名稱與屬性變化 |
| T19 | 死亡頁面（悼念 + 重新領養） | A2 | T17 | 死亡時正確顯示，可重新領養 |
| T20 | 像素風視覺統一（Sprite / 色調 / 字型） | A2 | T14 | 所有頁面視覺一致，像素風格統一 |
| T21 | RWD 手機適配 | A2 | T15-T19 | 320px ~ 1440px 均可正常操作 |
| T22 | Frontend UI 測試 | A4 | T15-T21 | 主要流程（註冊→初始化→餵食）E2E 測試通過 |

---

### Phase 3：PWA & 整合

| Task ID | 任務名稱 | 負責人 | 前置任務 | 驗收條件 |
|---------|---------|--------|---------|---------|
| T23 | PWA 推播通知（餵食提醒，1.5 小時未餵食觸發） | A2 + A3 | T11, T18 | 瀏覽器收到推播通知，點擊可開啟遊戲 |
| T24 | PWA 離線支援（顯示最後同步狀態） | A2 | T14 | 無網路時可開啟 App，顯示最後屬性狀態 |
| T25 | 前後端整合測試 | A1 + A4 | T23, T24 | 完整用戶流程無錯誤：註冊→命名→餵食→衰退→死亡 |

---

### Phase 4：部署

| Task ID | 任務名稱 | 負責人 | 前置任務 | 驗收條件 |
|---------|---------|--------|---------|---------|
| T26 | Docker Compose 正式環境配置（含環境變數） | A1 | T25 | `docker-compose up -d` 正常啟動，資料持久化 |
| T27 | Cloudflare Tunnel 設定（tamagotchi.smart-codings.com） | A1 | T26 | 從外部可訪問 `https://tamagotchi.smart-codings.com` |
| T28 | LaunchAgent 開機自啟 | A1 | T27 | 重開機後服務自動啟動 |
| T29 | 正式環境全流程驗收測試 | A4 | T28 | 在正式環境完成完整遊戲流程，無異常 |

---

## 四、里程碑

| 里程碑 | 涵蓋 Tasks | 交付物 |
|--------|-----------|--------|
| M0 — 基礎就緒 | T01–T04 | Repo 骨架、CI、Docker 可跑 |
| M1 — 後端完成 | T05–T13 | 所有 API 完成並通過安全審計 |
| M2 — 前端完成 | T14–T22 | 所有頁面完成並通過 UI 測試 |
| M3 — 整合完成 | T23–T25 | PWA 功能正常，整合測試通過 |
| M4 — 上線 | T26–T29 | 正式環境可訪問，驗收通過 |

---

*此計畫待 Robin 確認後，A1 將依 Phase/Task 建立 GitHub Issues 並通知各 agent 領取任務。*
