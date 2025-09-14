#!/usr/bin/env bash
set -euo pipefail

# Build all images: manager-api, server, and manager-web-react.
# Reads defaults from ./.env if present, or a provided --env-file.
#
# Usage:
#   ./docker-build-all.sh [--env-file <path>] \
#     [--api-tag <tag>] [--server-tag <tag>] [--web-tag <tag>] \
#     [--mirror <registry>] [--skip-web-build]
#
# Example:
#   ./docker-build-all.sh --env-file .env.local --mirror aliyun

ENV_FILE=""
API_TAG=""
SERVER_TAG=""
WEB_TAG=""
MIRROR=""
SKIP_WEB_BUILD=0

# Ensure required local assets (models, config placeholders) exist for compose/run
ensure_local_assets() {
  # SenseVoiceSmall ASR model (used by default compose volume mount)
  local model_dir="main/xiaozhi-server/models/SenseVoiceSmall"
  local model_file="$model_dir/model.pt"
  local model_url=${SENSEVOICE_MODEL_URL:-"https://modelscope.cn/models/iic/SenseVoiceSmall/resolve/master/model.pt"}

  if [[ ! -d "$model_dir" ]]; then
    echo "==> Creating model directory: $model_dir"
    mkdir -p "$model_dir"
  fi

  # Handle incorrect case where model.pt is a directory
  if [[ -d "$model_file" ]]; then
    local backup_dir="${model_file}.backup-$(date +%s)"
    echo "==> Detected a directory at $model_file; renaming to: $backup_dir"
    mv "$model_file" "$backup_dir"
  fi

  if [[ ! -f "$model_file" ]]; then
    echo "==> Missing ASR model: $model_file"
    echo "    Downloading from: $model_url"
    if command -v curl >/dev/null 2>&1; then
      curl -fL --progress-bar "$model_url" -o "$model_file"
    elif command -v wget >/dev/null 2>&1; then
      wget -O "$model_file" "$model_url"
    else
      echo "ERROR: Neither curl nor wget is available to download model." >&2
      exit 1
    fi
  else
    echo "==> ASR model already present: $model_file"
  fi

  # Ensure data directory exists for overrides (optional, non-fatal)
  local data_dir="main/xiaozhi-server/data"
  if [[ ! -d "$data_dir" ]]; then
    mkdir -p "$data_dir"
    echo "==> Created config data dir: $data_dir"
  fi
}

load_env() {
  local file="$1"
  if [[ -n "$file" && -f "$file" ]]; then
    echo "==> Loading env from: $file"
    set -a; source "$file"; set +a
  elif [[ -z "$file" && -f ./.env ]]; then
    echo "==> Loading env from: ./.env"
    set -a; source ./.env; set +a
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env-file) ENV_FILE="$2"; shift 2;;
    --api-tag) API_TAG="$2"; shift 2;;
    --server-tag) SERVER_TAG="$2"; shift 2;;
    --web-tag) WEB_TAG="$2"; shift 2;;
    --mirror) MIRROR="$2"; shift 2;;
    --skip-web-build) SKIP_WEB_BUILD=1; shift;;
    -h|--help)
      grep '^#' "$0" | sed -e 's/^# \{0,1\}//'; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

load_env "$ENV_FILE"

# Default mirror: prefer CLI > env DOCKER_MIRROR > daocloud
if [[ -z "${MIRROR}" ]]; then
  MIRROR="${DOCKER_MIRROR:-daocloud}"
fi

# Prepare required model/config files before building
ensure_local_assets

# Resolve tags from args or env
API_TAG="${API_TAG:-${MANAGER_API_IMAGE_TAG:-xiaozhi-manager-api:latest}}"
SERVER_TAG="${SERVER_TAG:-${SERVER_IMAGE_TAG:-xiaozhi-server:latest}}"
WEB_TAG="${WEB_TAG:-${WEB_REACT_IMAGE_TAG:-manager-web-react:latest}}"

echo "==> Build 1/3: manager-api -> $API_TAG"
./docker-build-manager-api.sh --tag "$API_TAG" ${ENV_FILE:+--env-file "$ENV_FILE"} ${MIRROR:+--mirror "$MIRROR"}

echo "==> Build 2/3: xiaozhi-server -> $SERVER_TAG"
./docker-build-server.sh --tag "$SERVER_TAG" ${ENV_FILE:+--env-file "$ENV_FILE"} ${MIRROR:+--mirror "$MIRROR"}

echo "==> Build 3/3: manager-web-react -> $WEB_TAG"
ARGS=(--tag "$WEB_TAG")
[[ -n "$ENV_FILE" ]] && ARGS+=(--env-file "$ENV_FILE")
[[ -n "$MIRROR" ]] && ARGS+=(--mirror "$MIRROR")
[[ "$SKIP_WEB_BUILD" -eq 1 ]] && ARGS+=(--skip-build)
./docker-build-web-react.sh "${ARGS[@]}"

echo "==> All images built:"
echo "  API   : $API_TAG"
echo "  Server: $SERVER_TAG"
echo "  Web   : $WEB_TAG"
