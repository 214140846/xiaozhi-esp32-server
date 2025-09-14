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
[[ -n "$MIRROR" ]] && ARGS+=(--mirror "$MIRROR")
[[ "$SKIP_WEB_BUILD" -eq 1 ]] && ARGS+=(--skip-build)
./docker-build-web-react.sh "${ARGS[@]}"

echo "==> All images built:"
echo "  API   : $API_TAG"
echo "  Server: $SERVER_TAG"
echo "  Web   : $WEB_TAG"
