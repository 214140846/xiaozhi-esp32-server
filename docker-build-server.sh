#!/usr/bin/env bash
set -euo pipefail

# Build xiaozhi-server image from Dockerfile-server. Optionally run.
#
# Usage:
#   ./docker-build-server.sh [--tag <name:tag>] [--env-file <path>] [--run]
#                            [--name <container_name>] [--ws-port <port>] [--http-port <port>]
#                            [--mirror <alias|registry>] [--builder-image <img>] [--runtime-image <img>]
#                            [--platform <os/arch>] [--push]
#
# Example:
#   ./docker-build-server.sh --tag xiaozhi-server:latest --run --ws-port 8000 --http-port 8003

TAG="xiaozhi-server:latest"
ENV_FILE=""
RUN_AFTER_BUILD=0
PUSH_AFTER_BUILD=0
CONTAINER_NAME="xiaozhi-esp32-server"
WS_PORT=${SERVER_WS_PORT:-8000}
HTTP_PORT=${SERVER_HTTP_PORT:-8003}
MIRROR=""
PY_BUILDER_DEFAULT="python:3.10-slim"
PY_RUNTIME_DEFAULT="python:3.10-slim"
PY_BUILDER_IMAGE="$PY_BUILDER_DEFAULT"
PY_RUNTIME_IMAGE="$PY_RUNTIME_DEFAULT"
PLATFORM=""
NO_CACHE=0

load_env() {
  local file="$1"; local target=""
  if [[ -n "$file" && -f "$file" ]]; then
    echo "==> Loading env from: $file"; target="$file"
  elif [[ -z "$file" && -f ./.env ]]; then
    echo "==> Loading env from: ./.env"; target=".env"
  fi
  if [[ -n "$target" ]]; then
    mkdir -p tmp
    local filtered="tmp/.env.loaded"
    sed -E 's/^\s*export\s+//' "$target" | \
      grep -E '^[A-Za-z_][A-Za-z0-9_]*=' | \
      sed -E 's/\s+#.*$//' > "$filtered"
    # shellcheck disable=SC1090
    set -a; source "$filtered"; set +a
  fi
}

# Ensure required local assets (models) for compose/run exist
ensure_local_assets() {
  local model_dir="main/xiaozhi-server/models/SenseVoiceSmall"
  local model_file="$model_dir/model.pt"
  local model_url=${SENSEVOICE_MODEL_URL:-"https://modelscope.cn/models/iic/SenseVoiceSmall/resolve/master/model.pt"}

  [[ -d "$model_dir" ]] || { echo "==> Creating model directory: $model_dir"; mkdir -p "$model_dir"; }

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
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag) TAG="$2"; shift 2;;
    --env-file) ENV_FILE="$2"; shift 2;;
    --run) RUN_AFTER_BUILD=1; shift;;
    --name) CONTAINER_NAME="$2"; shift 2;;
    --ws-port) WS_PORT="$2"; shift 2;;
    --http-port) HTTP_PORT="$2"; shift 2;;
    --mirror) MIRROR="$2"; shift 2;;
    --builder-image) PY_BUILDER_IMAGE="$2"; shift 2;;
    --runtime-image) PY_RUNTIME_IMAGE="$2"; shift 2;;
    --platform) PLATFORM="$2"; shift 2;;
    --no-cache) NO_CACHE=1; shift;;
    --push) PUSH_AFTER_BUILD=1; shift;;
    -h|--help)
      grep '^#' "$0" | sed -e 's/^# \{0,1\}//'; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

load_env "$ENV_FILE"

# Default mirror from env if not provided (fallback to daocloud)
if [[ -z "$MIRROR" ]]; then
  MIRROR="${DOCKER_MIRROR:-daocloud}"
fi

# Prepare required model before building
ensure_local_assets

# Re-evaluate ports from env if provided (preserve CLI values)
WS_PORT=${WS_PORT:-${SERVER_WS_PORT:-8000}}
HTTP_PORT=${HTTP_PORT:-${SERVER_HTTP_PORT:-8003}}

# Allow overriding tag via env (SERVER_IMAGE_TAG)
if [[ -n "${SERVER_IMAGE_TAG:-}" ]]; then
  TAG="$SERVER_IMAGE_TAG"
fi

resolve_with_mirror() {
  local image="$1"; local mirror="$2"; local out=""
  if [[ -z "$mirror" ]]; then echo "$image"; return; fi
  local prefix=""
  case "$mirror" in
    daocloud) prefix="docker.m.daocloud.io";;
    aliyun) prefix="registry.aliyuncs.com";;
    tencent) prefix="mirror.ccs.tencentyun.com";;
    ustc) prefix="docker.mirrors.ustc.edu.cn";;
    netease) prefix="hub-mirror.c.163.com";;
    http*|*.*) prefix="$mirror";;
    *) prefix="$mirror";;
  esac
  if [[ "$image" == */* ]]; then
    out="$prefix/$image"
  else
    out="$prefix/library/$image"
  fi
  echo "$out"
}

if [[ -n "$MIRROR" ]]; then
  if [[ "$PY_BUILDER_IMAGE" == "$PY_BUILDER_DEFAULT" ]]; then
    PY_BUILDER_IMAGE="$(resolve_with_mirror "$PY_BUILDER_DEFAULT" "$MIRROR")"
  fi
  if [[ "$PY_RUNTIME_IMAGE" == "$PY_RUNTIME_DEFAULT" ]]; then
    PY_RUNTIME_IMAGE="$(resolve_with_mirror "$PY_RUNTIME_DEFAULT" "$MIRROR")"
  fi
fi

echo "==> Building image: $TAG (Dockerfile-server)"
echo "    - PY_BUILDER_IMAGE: $PY_BUILDER_IMAGE"
echo "    - PY_RUNTIME_IMAGE: $PY_RUNTIME_IMAGE"
echo "    - PLATFORM        : ${PLATFORM:-default}"
# Avoid line-continuation pitfalls by using an array
BUILD_ARGS=(
  -f Dockerfile-server
  --build-arg "PY_BUILDER_IMAGE=${PY_BUILDER_IMAGE}"
  --build-arg "PY_RUNTIME_IMAGE=${PY_RUNTIME_IMAGE}"
  -t "$TAG"
  .
)
[[ -n "$PLATFORM" ]] && BUILD_ARGS=(--platform "$PLATFORM" "${BUILD_ARGS[@]}")
[[ "$NO_CACHE" -eq 1 ]] && BUILD_ARGS=(--no-cache "${BUILD_ARGS[@]}")
docker build "${BUILD_ARGS[@]}"


if [[ "$PUSH_AFTER_BUILD" -eq 1 ]]; then
  echo "==> Pushing image: $TAG"
  docker push "$TAG"
fi

if [[ "$RUN_AFTER_BUILD" -eq 1 ]]; then
  if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
  fi
# Default platform from env if not provided
if [[ -z "$PLATFORM" && -n "${DOCKER_PLATFORM:-}" ]]; then
  PLATFORM="$DOCKER_PLATFORM"
fi
  docker run -d --name "${CONTAINER_NAME}" -p "${WS_PORT}:8000" -p "${HTTP_PORT}:8003" "${TAG}"
  echo "==> Started. WS: ws://127.0.0.1:${WS_PORT}/xiaozhi/v1/  HTTP: http://127.0.0.1:${HTTP_PORT}/"
fi
