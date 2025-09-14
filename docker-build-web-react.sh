#!/usr/bin/env bash
set -euo pipefail

# Build manager-web-react runtime image without sending source code to Docker.
# It builds with pnpm, stages only built assets + nginx.conf into a temp context,
# and then runs `docker build` using a minimal context.
#
# Usage:
#   ./docker-build-web-react.sh [--tag <name:tag>] [--mirror <registry>]
#                               [--spa-path <path>] [--build-dir <dist>]
#                               [--skip-build] [--env-file <path>]
#
# Mirrors examples:
#   daocloud -> docker.m.daocloud.io/library/nginx:1.27-alpine
#   aliyun   -> registry.aliyuncs.com/library/nginx:1.27-alpine
#   tencent  -> mirror.ccs.tencentyun.com/library/nginx:1.27-alpine
#   ustc     -> docker.mirrors.ustc.edu.cn/library/nginx:1.27-alpine
#   netease  -> hub-mirror.c.163.com/library/nginx:1.27-alpine

TAG="manager-web-react:latest"
SPA_PATH="main/manager-web-react"
BUILD_DIR="dist"
MIRROR=""
SKIP_BUILD=0
ENV_FILE=""

load_env() {
  local file="$1"
  if [[ -n "$file" && -f "$file" ]]; then
    echo "==> Loading env from: $file"
    set -a
    # shellcheck disable=SC1090
    source "$file"
    set +a
  elif [[ -z "$file" && -f ./.env ]]; then
    echo "==> Loading env from: ./.env"
    set -a
    # shellcheck disable=SC1091
    source ./.env
    set +a
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag) TAG="$2"; shift 2;;
    --mirror) MIRROR="$2"; shift 2;;
    --spa-path) SPA_PATH="$2"; shift 2;;
    --build-dir) BUILD_DIR="$2"; shift 2;;
    --skip-build) SKIP_BUILD=1; shift;;
    --env-file) ENV_FILE="$2"; shift 2;;
    -h|--help)
      grep '^#' "$0" | sed -e 's/^# \{0,1\}//'; exit 0;
      ;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

load_env "$ENV_FILE"

# Allow overrides via env file
if [[ -n "${WEB_REACT_IMAGE_TAG:-}" ]]; then TAG="$WEB_REACT_IMAGE_TAG"; fi
if [[ -z "$MIRROR" && -n "${WEB_REACT_MIRROR:-}" ]]; then MIRROR="$WEB_REACT_MIRROR"; fi
if [[ -z "$MIRROR" ]]; then MIRROR="${DOCKER_MIRROR:-daocloud}"; fi
if [[ -n "${WEB_REACT_SPA_PATH:-}" ]]; then SPA_PATH="$WEB_REACT_SPA_PATH"; fi
if [[ -n "${WEB_REACT_BUILD_DIR:-}" ]]; then BUILD_DIR="$WEB_REACT_BUILD_DIR"; fi

resolve_base_image() {
  local reg="$1"
  case "$reg" in
    "" ) echo "nginx:1.27-alpine" ;;
    daocloud ) echo "docker.m.daocloud.io/library/nginx:1.27-alpine" ;;
    aliyun ) echo "registry.aliyuncs.com/library/nginx:1.27-alpine" ;;
    tencent ) echo "mirror.ccs.tencentyun.com/library/nginx:1.27-alpine" ;;
    ustc ) echo "docker.mirrors.ustc.edu.cn/library/nginx:1.27-alpine" ;;
    netease ) echo "hub-mirror.c.163.com/library/nginx:1.27-alpine" ;;
    http* ) echo "$reg" ;;
    * ) echo "$reg" ;;
  esac
}

if [[ -n "${WEB_REACT_BASE_IMAGE:-}" ]]; then
  BASE_IMAGE="$WEB_REACT_BASE_IMAGE"
else
  BASE_IMAGE=$(resolve_base_image "$MIRROR")
fi

echo "==> Using base image: $BASE_IMAGE"
echo "==> Building SPA at: $SPA_PATH (output: $BUILD_DIR)"

if [[ $SKIP_BUILD -eq 0 ]]; then
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "pnpm is required. Install: https://pnpm.io/installation" >&2
    exit 1
  fi
  pushd "$SPA_PATH" >/dev/null
  echo "==> pnpm install"
  pnpm install
  echo "==> pnpm build"
  pnpm build
  popd >/dev/null
fi

if [[ ! -d "$SPA_PATH/$BUILD_DIR" ]]; then
  echo "Build output not found: $SPA_PATH/$BUILD_DIR" >&2
  exit 1
fi

TMP_CTX="$(pwd)/tmp/docker-web-react-context"
echo "==> Preparing minimal build context at: $TMP_CTX"
rm -rf "$TMP_CTX" && mkdir -p "$TMP_CTX/www"

# Copy Dockerfile and nginx config
cp -f "Dockerfile-web-react" "$TMP_CTX/Dockerfile"
if [[ -f "$SPA_PATH/nginx.conf" ]]; then
  cp -f "$SPA_PATH/nginx.conf" "$TMP_CTX/nginx.conf"
else
  echo "nginx.conf not found in $SPA_PATH" >&2
  exit 1
fi

# Copy built assets
cp -R "$SPA_PATH/$BUILD_DIR/"* "$TMP_CTX/www/"

echo "==> Building image: $TAG"
docker build \
  --build-arg BASE_IMAGE="$BASE_IMAGE" \
  -t "$TAG" \
  "$TMP_CTX"

echo "==> Done. Run with: docker run --rm -p 8080:80 $TAG"
