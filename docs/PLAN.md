# 🗺️ AI 電子雞 — 開發計畫

> 版本：v1.0 | 日期：2026-03-30 | 狀態：待確認

---

## 團隊分工

| Agent | 角色 | 主要負責 | GitHub |
|-------|------|---------|--------|
| 🦞 小龍蝦 | Team Leader | 架構設計、專案管理、整合、部署 | robin-li |
| 🦉 夜貓 | Frontend Dev | UI/UX、React 元件、PWA、動畫 | owl-robin |
| 🍎 小蘋果 | Backend Dev | API、資料庫、認證、衰退排程 | robins-app |
| 🏒 冰球 | QA + Security | 測試、安全審計、Bug 回報 | apin9914 |

---

## 協作方式

### GitHub Flow
1. `main` 為保護分支，不直接 push
2. 所有開發在 feature branch 進行
3. 完成後開 Pull Request → 小龍蝦審核合併
4. Issue 追蹤所有任務，每個 Issue 對應一個 feature branch

### Branch 命名規則
```
feature/[issue-number]-[簡述]
fix/[issue-number]-[簡述]
```
例：`feature/3-feeding-dice-ui`

### Commit 規範
```
feat: 新功能
fix: 修復
docs: 文件
style: 樣式
refactor: 重構
test: 測試
```

### Issue 標籤
- `frontend` `backend` `qa` `security` `bug` `enhancement`

---

## 開發週期

### Phase 0：基礎建設（1 天）
**負責：🦞 小龍蝦**
- [x] 建立 GitHub Repo
- [x] 撰寫需求規格書 (SPEC.md)
- [x] 撰寫開發計畫 (PLAN.md)
- [ ] 建立專案骨架（frontend + backend monorepo）
- [ ] 建立 docker-compose.yml
- [ ] 設定 GitHub branch protection
- [ ] 建立所有開發 Issues

---

### Phase 1：後端核心（2-3 天）
**主責：🍎 小蘋果 | 審核：🦞 小龍蝦 | 測試：🏒 冰球**

#### Issues
- `#2` 資料庫設計 & Prisma Schema
- `#3` 用戶註冊 / 登入 API（JWT）
- `#4` 電子雞 CRUD API（命名、初始化、屬性）
- `#5` 餵食 API（骰子邏輯、屬性計算）
- `#6` 衰退排程（node-cron，每 30 分鐘執行）

#### 驗收標準
- 所有 API 有 Swagger 文件
- 單元測試覆蓋率 > 70%
- 冰球完成 API 安全審計

---

### Phase 2：前端核心（3-4 天）
**主責：🦉 夜貓 | 審核：🦞 小龍蝦 | 測試：🏒 冰球**

#### Issues
- `#7` 專案設定（Vite + React + Tailwind + PWA）
- `#8` 登入 / 註冊頁面
- `#9` 電子雞初始化頁面（命名 + 屬性隨機 + 重置）
- `#10` 主遊戲頁（電子雞展示 + 屬性面板）
- `#11` 餵食流程（骰子動畫 + 結果展示）
- `#12` 死亡頁面
- `#13` 像素風視覺設計（sprite、色調、字型）

#### 驗收標準
- RWD 支援（手機 / 桌機）
- Lighthouse PWA 分數 > 90
- 骰子動畫流暢（60fps）

---

### Phase 3：整合 & PWA（1-2 天）
**主責：🦞 小龍蝦 & 🦉 夜貓**

#### Issues
- `#14` 前後端整合測試
- `#15` PWA 推播通知（餵食提醒）
- `#16` 離線支援

---

### Phase 4：部署 & QA（1 天）
**主責：🦞 小龍蝦 & 🏒 冰球**

#### Issues
- `#17` Docker Compose 配置
- `#18` Cloudflare Tunnel 設定（tamagotchi.smart-codings.com）
- `#19` LaunchAgent 開機自啟
- `#20` 全流程 E2E 測試
- `#21` 安全滲透測試

---

## 里程碑

| 里程碑 | 目標 | 預計完成 |
|--------|------|---------|
| M0 | 基礎建設完成，Issues 全部建立 | Day 1 |
| M1 | 後端 API 全部完成並通過測試 | Day 4 |
| M2 | 前端頁面全部完成 | Day 8 |
| M3 | 整合完成，PWA 功能正常 | Day 10 |
| M4 | 部署完成，線上可訪問 | Day 11 |

---

## 品質要求

- 所有 PR 需通過 CI 檢查（lint + test）
- 所有 API 需有錯誤處理
- 不得有 hardcoded 密碼或 secret
- SQL injection / XSS 防護

---

*計畫待 Robin 確認後執行*
