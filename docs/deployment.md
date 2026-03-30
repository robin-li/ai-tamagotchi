# 部署指南

## 架構

```
Internet → Cloudflare Tunnel → Mac Mini
                                ├── tamagotchi.smart-codings.com/api → localhost:3000 (backend)
                                └── tamagotchi.smart-codings.com     → localhost:8080 (frontend)
```

## 前置需求

- Docker + Docker Compose
- cloudflared CLI
- `.env.production`（參考 `.env.production.example`）

## 部署步驟

### 1. 設定環境變數

```bash
cp .env.production.example .env.production
# 編輯 .env.production，填入真實密碼和 JWT secret
```

### 2. 啟動服務

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### 3. 執行資料庫 migration

```bash
docker exec tamagotchi-backend npx prisma migrate deploy
```

### 4. 啟動 Cloudflare Tunnel（LaunchAgent 自動管理）

```bash
launchctl load ~/Library/LaunchAgents/com.openclaw.cloudflared-tamagotchi.plist
```

## Cloudflare Tunnel 設定

- Tunnel ID: `87129a1a-9b61-4568-9468-3b4e17e942fe`
- Config: `~/.cloudflared/config-tamagotchi.yml`
- DNS: `tamagotchi.smart-codings.com` → CNAME → tunnel

## 診斷指令

```bash
# 確認服務狀態
docker-compose -f docker-compose.prod.yml ps

# 查看 backend logs
docker logs tamagotchi-backend -f

# 查看 frontend logs
docker logs tamagotchi-frontend -f

# 確認 tunnel 狀態
launchctl list | grep cloudflared-tamagotchi

# 查看 tunnel log
tail -f ~/.cloudflared/tamagotchi-tunnel.log
```
