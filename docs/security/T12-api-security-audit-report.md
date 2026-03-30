# T12 API 安全審計報告

**審計者：** 冰球 🏒  
**日期：** 2026-03-31  
**模型：** opus  
**審計範圍：** auth.ts, pet.ts, auth plugin  

---

## 審計結果摘要

| 嚴重等級 | 數量 |
|----------|------|
| 🚨 Critical | 1 |
| 🔴 High | 2 |
| 🟡 Medium | 3 |
| 🟢 Low | 2 |

---

## 🚨 Critical 問題

### C1: 無 Rate Limiting
**位置：** 所有端點（register, login, feed, reroll）  
**風險：** 可被暴力破解、DoS 攻擊、API 濫用  
**建議：** 引入 `@fastify/rate-limit`，对 login/register 設定嚴格限制（如 5 次/分鐘）

---

## 🔴 High 問題

### H1: JWT_SECRET 預設值不安全
**位置：** `.env.example`  
**內容：** `JWT_SECRET="your-secret-key-change-this-in-production"`  
**風險：** 部署時易忘記修改，導致 JWT 可被破解  
**建議：** 開機時強制檢查 JWT_SECRET 長度 ≥ 32 字元

### H2: 密碼複雜度不足
**位置：** `auth.ts` registerSchema  
**內容：** 只驗證 `min(8)`，無其他複雜度要求  
**風險：** 容易被暴力破解  
**建議：** 加入大小寫、數字、特殊字符要求

---

## 🟡 Medium 問題

### M1: 無 Request Size Limit
**位置：** `index.ts` Fastify 初始化  
**風險：** 可發送超大 payload 導致記憶體耗盡  
**建議：** 設定 `bodyLimit: 1048576`（1MB）

### M2: 無 Security Headers
**位置：** `index.ts`  
**風險：** 缺少 X-Frame-Options, X-Content-Type-Options, HSTS 等  
**建議：** 安裝 `@fastify/helmet`

### M3: 無 CORS 設定
**位置：** `index.ts`  
**風險：** 跨域請求無法正確處理  
**建議：** 若前端不同域名，需設定 `@fastify/cors`

---

## 🟢 Low 問題

### L1: 無登入鎖定機制
**位置：** `auth.ts` login  
**風險：** 暴力破解無攔截  
**建議：** 連續失敗 N 次後鎖定帳號一段時間

### L2: Pet name 未消毒
**位置：** `pet.ts` init/reroll  
**風險：** 儲存未經消毒的使用者輸入  
**建議：** 前端 sanitize，後端驗證允許的字元

---

## ✅ 通過項目

| 項目 | 說明 |
|------|------|
| SQL Injection | Prisma ORM 參數化查詢，無 raw SQL |
| 敏感資料外洩 | 錯誤訊息統一，不洩漏具體原因 |
| JWT 驗證 | `@fastify/jwt` 正確實作，secret 開機檢查 |
| 密碼儲存 | bcrypt hash，sult rounds=10 |
| 輸入驗證 | Zod schema 完整驗證 |
| Race Condition | Email unique constraint |

---

## 驗收條件確認

- [x] 無 SQL injection 漏洞 — ✅ Prisma ORM 安全
- [x] 無敏感資料外洩 — ✅ 錯誤訊息統一
- [x] JWT 驗證正確 — ✅ @fastify/jwt 正確實作
- [ ] Rate limiting 設定 — ❌ 尚未實作（Critical）
- [x] 輸入驗證完整 — ✅ Zod schemas

---

## 建議後續任務

1. **新增 T12-fix:** 實作 Rate Limiting（@fastify/rate-limit）
2. **新增 T12-fix2:** 實作 Security Headers（@fastify/helmet）
3. **驗證環境變數：** 開機檢查 JWT_SECRET 長度
