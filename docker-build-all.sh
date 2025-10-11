#!/usr/bin/env bash
set -euo pipefail

# Build all images: manager-api, server, and manager-web-react.
# Reads defaults from ./.env if present, or a provided --env-file.
#
# Usage:
#   ./docker-build-all.sh [--env-file <path>] \
#     [--api-tag <tag>] [--server-tag <tag>] [--web-tag <tag>] \
#     [--mirror <registry>] [--platform <os/arch>] [--skip-web-build] \
#     [--web-api-base <url>]
#
# Example:
#   ./docker-build-all.sh --env-file .env.local --mirror aliyun

ENV_FILE=""
API_TAG=""
SERVER_TAG=""
WEB_TAG=""
MIRROR=""
SKIP_WEB_BUILD=0
NO_CACHE=0
PLATFORM=""
WEB_API_BASE=""

# Ensure required local assets (models, config placeholders) exist for compose/run
ensure_local_assets() {
  # SenseVoiceSmall ASR model (used by default compose volume mount)
  local model_dir="main/xiaozhi-server/models/SenseVoiceSmall"
  local model_file="$model_dir/model.pt"

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
    echo "    Auto-download disabled; place the model artifact manually before running."
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

push_image() {
  local image_tag="$1"
  if [[ -z "$image_tag" ]]; then
    echo "==> Skip push: empty image tag" >&2
    return 1
  fi
  echo "==> Pushing image: $image_tag"
  docker push "$image_tag"
}

load_env() {
  local file="$1"
  local target=""
  if [[ -n "$file" && -f "$file" ]]; then
    echo "==> Loading env from: $file"
    target="$file"
  elif [[ -z "$file" && -f ./.env ]]; then
    echo "==> Loading env from: ./.env"
    target=".env"
  fi
  if [[ -n "$target" ]]; then
    mkdir -p tmp
    local filtered="tmp/.env.loaded"
    # Produce a filtered file containing only KEY=VAL lines
    sed -E 's/^\s*export\s+//' "$target" | \
      grep -E '^[A-Za-z_][A-Za-z0-9_]*=' | \
      sed -E 's/\s+#.*$//' > "$filtered"
    # shellcheck disable=SC1090
    set -a; source "$filtered"; set +a
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env-file) ENV_FILE="$2"; shift 2;;
    --api-tag) API_TAG="$2"; shift 2;;
    --server-tag) SERVER_TAG="$2"; shift 2;;
    --web-tag) WEB_TAG="$2"; shift 2;;
    --mirror) MIRROR="$2"; shift 2;;
    --platform) PLATFORM="$2"; shift 2;;
    --web-api-base) WEB_API_BASE="$2"; shift 2;;
    --skip-web-build) SKIP_WEB_BUILD=1; shift;;
    --no-cache) NO_CACHE=1; shift;;
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

# Default platform from env if not provided
if [[ -z "${PLATFORM}" && -n "${DOCKER_PLATFORM:-}" ]]; then
  PLATFORM="${DOCKER_PLATFORM}"
fi

# Prepare required model/config files before building
ensure_local_assets

# Resolve tags from args or env
API_TAG="${API_TAG:-${MANAGER_API_IMAGE_TAG:-xiaozhi-manager-api:latest}}"
SERVER_TAG="${SERVER_TAG:-${SERVER_IMAGE_TAG:-xiaozhi-server:latest}}"
WEB_TAG="${WEB_TAG:-${WEB_REACT_IMAGE_TAG:-manager-web-react:latest}}"

echo "==> Build 1/3: manager-api -> $API_TAG"
./docker-build-manager-api.sh --tag "$API_TAG" ${ENV_FILE:+--env-file "$ENV_FILE"} ${MIRROR:+--mirror "$MIRROR"} ${PLATFORM:+--platform "$PLATFORM"} $([[ $NO_CACHE -eq 1 ]] && echo --no-cache)

echo "==> Build 2/3: xiaozhi-server -> $SERVER_TAG"
./docker-build-server.sh --tag "$SERVER_TAG" ${ENV_FILE:+--env-file "$ENV_FILE"} ${MIRROR:+--mirror "$MIRROR"} ${PLATFORM:+--platform "$PLATFORM"} $([[ $NO_CACHE -eq 1 ]] && echo --no-cache)

echo "==> Build 3/3: manager-web-react -> $WEB_TAG"
ARGS=(--tag "$WEB_TAG")
[[ -n "$ENV_FILE" ]] && ARGS+=(--env-file "$ENV_FILE")
[[ -n "$MIRROR" ]] && ARGS+=(--mirror "$MIRROR")
[[ -n "$PLATFORM" ]] && ARGS+=(--platform "$PLATFORM")
[[ -n "$WEB_API_BASE" ]] && ARGS+=(--api-base "$WEB_API_BASE")
[[ "$SKIP_WEB_BUILD" -eq 1 ]] && ARGS+=(--skip-build)
[[ "$NO_CACHE" -eq 1 ]] && ARGS+=(--no-cache)
./docker-build-web-react.sh "${ARGS[@]}"

echo "==> All images built:"
echo "  API   : $API_TAG"
echo "  Server: $SERVER_TAG"
echo "  Web   : $WEB_TAG"

echo "==> Push 1/3: $API_TAG"
push_image "$API_TAG"

echo "==> Push 2/3: $SERVER_TAG"
push_image "$SERVER_TAG"

echo "==> Push 3/3: $WEB_TAG"
push_image "$WEB_TAG"

echo "==> All images pushed successfully"
