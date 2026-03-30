#!/usr/bin/env bash
# deploy.sh - AI Tamagotchi 一鍵部署腳本
# 使用方式：bash deploy.sh [--pull]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env.production"
ENV_EXAMPLE="${SCRIPT_DIR}/.env.production.example"

# ── 顏色輸出 ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── 前置檢查 ──────────────────────────────────────────────────────────────────
command -v docker        >/dev/null 2>&1 || error "docker 未安裝"
command -v docker compose >/dev/null 2>&1 || error "docker compose 未安裝（需 Docker Compose v2）"

# ── 確認 .env.production 存在 ─────────────────────────────────────────────────
if [[ ! -f "${ENV_FILE}" ]]; then
  warn ".env.production 不存在，從 example 複製..."
  cp "${ENV_EXAMPLE}" "${ENV_FILE}"
  error "請先編輯 ${ENV_FILE} 填入正式環境參數，再重新執行此腳本"
fi

# ── JWT_SECRET 長度驗證（T12 H1）───────────────────────────────────────────────
JWT_SECRET_VAL=$(grep -E '^JWT_SECRET=' "${ENV_FILE}" | cut -d'=' -f2- | tr -d '"' || true)
if [[ -z "${JWT_SECRET_VAL}" ]]; then
  error "JWT_SECRET 未設定，請編輯 ${ENV_FILE}"
fi
if [[ ${#JWT_SECRET_VAL} -lt 32 ]]; then
  error "JWT_SECRET 長度不足（需 ≥32 字元，目前 ${#JWT_SECRET_VAL} 字元）"
fi

# ── 選用：拉取最新程式碼 ──────────────────────────────────────────────────────
if [[ "${1:-}" == "--pull" ]]; then
  info "拉取最新程式碼..."
  git -C "${SCRIPT_DIR}" pull --ff-only
fi

info "開始建置並啟動服務..."

# ── Docker Compose 部署 ────────────────────────────────────────────────────────
cd "${SCRIPT_DIR}"

docker compose --env-file "${ENV_FILE}" pull --ignore-pull-failures 2>/dev/null || true
docker compose --env-file "${ENV_FILE}" build --no-cache
docker compose --env-file "${ENV_FILE}" up -d --remove-orphans

# ── 等待 backend 健康 ─────────────────────────────────────────────────────────
info "等待 backend 啟動..."
RETRIES=30
until docker compose exec -T backend wget -qO- http://localhost:3000/health >/dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  [[ ${RETRIES} -le 0 ]] && error "Backend 啟動逾時，請檢查：docker compose logs backend"
  sleep 2
done

info "部署完成！服務狀態："
docker compose ps

info "查看日誌：docker compose logs -f"
