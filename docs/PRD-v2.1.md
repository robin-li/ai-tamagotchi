# AI 電子雞 v2.1 PRD — Bug Fix + 新功能需求

**更新日期：** 2026-03-31
**版本：** v2.1（基於 v2.0 AI 互動功能之後）

---

## Bug 修復

### Bug #1：點擊電子雞「思考中...」永遠不消失
**場景：** 點擊電子雞 → 顯示「思考中...」→ 無論 API 成功/失敗，loading 狀態不清除
**根本原因：** useAIChat hook 在無 API key 時 return 前未重置 loading state；API 失敗時 catch block 雖未 throw 但 loading 未設回 false（實際已有 finally，需確認是否覆蓋所有路徑）
**修復方式：** 
- 確保所有 return path 都會執行 setLoading(false)
- 無 API key 時不顯示「思考中...」，直接靜默
- 失敗時顯示「⚙️ 請先設定 AI 模型」（引導用戶去設定頁）

### Bug #2：餵食失敗顯示 axios 錯誤而非友善訊息
**場景：** 餵食次數達上限 → 後端回 400 + `{error: "今日餵食次數已達上限"}` → 前端顯示 "Request failed with status code 400"
**修復方式：** FeedPage 的 onError handler 要解析 `error.response?.data?.error` 並顯示中文訊息

---

## 新功能

### Feature #1：AI 設定頁「測試連線」按鈕
**位置：** SettingsPage，模型選擇下方
**行為：**
- 點擊後用目前設定的 provider + key + model 發一條測試訊息（"Hello"）
- 顯示 loading 狀態
- 成功：顯示「✅ 連線成功」+ AI 回應內容（最多 50 字）
- 失敗：顯示「❌ 連線失敗：{錯誤訊息}」
