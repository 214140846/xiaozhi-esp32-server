#!/usr/bin/env bash
set -euo pipefail

# Build (and optionally run) standalone manager-api image.
# Also provides flags to configure MySQL and Redis addresses for docker run.
#
# 中文说明：
# - 支持加载环境文件（--env-file 或自动加载项目根目录的 .env）。
# - 可通过环境变量覆盖镜像标签：MANAGER_API_IMAGE_TAG。
# - 可选一键运行（--run），并通过参数设置 MySQL/Redis 地址。
#
# Usage:
#   ./docker-build-manager-api.sh \
#     [--tag <name:tag>] [--env-file <path>] \
#     [--run] [--name <container_name>] [--port <host_port>] [--timezone <TZ>] \
#     [--db-host <host>] [--db-port <port>] [--db-name <name>] [--db-user <user>] [--db-pass <pass>] \
#     [--redis-host <host>] [--redis-port <port>] [--redis-pass <pass>] \
#     [--mirror <alias|registry>] [--maven-image <img>] [--runtime-image <img>]
#
# Env support:
#   - Auto-load ./.env when present, or pass --env-file ./my.env
#   - Environment override: MANAGER_API_IMAGE_TAG
#
# Quick examples:
#   # 1) Build only
#   ./docker-build-manager-api.sh --tag xiaozhi-manager-api:latest
#
#   # 1.1) Build with .env (auto-load if exists in repo root)
#   # Place .env with MANAGER_API_IMAGE_TAG set
#   ./docker-build-manager-api.sh
#
#   # 1.2) Build with a specific env file
#   ./docker-build-manager-api.sh --env-file ./my.env
#
#   # 2) Run locally against localhost MySQL/Redis
#   ./docker-build-manager-api.sh --tag xiaozhi-manager-api:latest --run \
#     --db-host 127.0.0.1 --db-port 3306 --db-name xiaozhi_esp32_server \
#     --db-user root --db-pass 123456 \
#     --redis-host 127.0.0.1 --redis-port 6379
#
#   # 3) Run inside a Docker network (e.g., with compose service names)
#   ./docker-build-manager-api.sh --tag xiaozhi-manager-api:latest --run \
#     --name xiaozhi-esp32-manager-api --port 8002 \
#     --db-host xiaozhi-esp32-server-db --db-port 3306 --db-name xiaozhi_esp32_server \
#     --db-user root --db-pass 123456 \
#     --redis-host xiaozhi-esp32-server-redis --redis-port 6379

TAG="manager-api:latest"
ENV_FILE=""
MIRROR=""
MAVEN_IMAGE_DEFAULT="maven:3.9.4-eclipse-temurin-21"
RUNTIME_IMAGE_DEFAULT="eclipse-temurin:21-jre"
MAVEN_IMAGE="${MAVEN_IMAGE_DEFAULT}"
RUNTIME_IMAGE="${RUNTIME_IMAGE_DEFAULT}"
RUN_AFTER_BUILD=0
CONTAINER_NAME="xiaozhi-esp32-manager-api"
HOST_PORT=8002
TZ_VAL="Asia/Shanghai"

# DB defaults for local runs; override for compose with service names
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_NAME="xiaozhi_esp32_server"
DB_USER="root"
DB_PASS="123456"

# Redis defaults
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
REDIS_PASS=""

# Load environment variables from a file (exporting all)
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
    --env-file) ENV_FILE="$2"; shift 2;;
    --mirror) MIRROR="$2"; shift 2;;
    --maven-image) MAVEN_IMAGE="$2"; shift 2;;
    --runtime-image) RUNTIME_IMAGE="$2"; shift 2;;
    --run) RUN_AFTER_BUILD=1; shift;;
    --name) CONTAINER_NAME="$2"; shift 2;;
    --port) HOST_PORT="$2"; shift 2;;
    --timezone) TZ_VAL="$2"; shift 2;;
    --db-host) DB_HOST="$2"; shift 2;;
    --db-port) DB_PORT="$2"; shift 2;;
    --db-name) DB_NAME="$2"; shift 2;;
    --db-user) DB_USER="$2"; shift 2;;
    --db-pass) DB_PASS="$2"; shift 2;;
    --redis-host) REDIS_HOST="$2"; shift 2;;
    --redis-port) REDIS_PORT="$2"; shift 2;;
    --redis-pass) REDIS_PASS="$2"; shift 2;;
    -h|--help)
      grep '^#' "$0" | sed -e 's/^# \{0,1\}//'; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

load_env "$ENV_FILE"

# Allow overriding tag via env (MANAGER_API_IMAGE_TAG)
if [[ -n "${MANAGER_API_IMAGE_TAG:-}" ]]; then
  TAG="$MANAGER_API_IMAGE_TAG"
fi

# Default mirror from env if not provided (fallback to daocloud)
if [[ -z "$MIRROR" ]]; then
  MIRROR="${DOCKER_MIRROR:-daocloud}"
fi

# Resolve mirror into concrete base images if not explicitly overridden
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
  if [[ "$MAVEN_IMAGE" == "$MAVEN_IMAGE_DEFAULT" ]]; then
    MAVEN_IMAGE="$(resolve_with_mirror "$MAVEN_IMAGE_DEFAULT" "$MIRROR")"
  fi
  if [[ "$RUNTIME_IMAGE" == "$RUNTIME_IMAGE_DEFAULT" ]]; then
    RUNTIME_IMAGE="$(resolve_with_mirror "$RUNTIME_IMAGE_DEFAULT" "$MIRROR")"
  fi
fi

echo "==> Building image: $TAG (Dockerfile-manager-api)"
echo "    - MAVEN_IMAGE   : $MAVEN_IMAGE"
echo "    - RUNTIME_IMAGE : $RUNTIME_IMAGE"
docker build -f Dockerfile-manager-api \
  --build-arg MAVEN_IMAGE="$MAVEN_IMAGE" \
  --build-arg RUNTIME_IMAGE="$RUNTIME_IMAGE" \
  -t "$TAG" .

# Compose datasource URL (align with compose defaults)
JDBC_PARAMS="useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&nullCatalogMeansCurrent=true&connectTimeout=30000&socketTimeout=30000&autoReconnect=true&failOverReadOnly=false&maxReconnects=10"
DRUID_URL="jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?${JDBC_PARAMS}"

echo "==> Image built: $TAG"
echo "==> Example run command with MySQL/Redis addresses:"
cat <<EOF
docker run --rm \
  --name ${CONTAINER_NAME} \
  -e TZ=${TZ_VAL} \
  -e SPRING_DATASOURCE_DRUID_URL='${DRUID_URL}' \
  -e SPRING_DATASOURCE_DRUID_USERNAME='${DB_USER}' \
  -e SPRING_DATASOURCE_DRUID_PASSWORD='${DB_PASS}' \
  -e SPRING_DATA_REDIS_HOST='${REDIS_HOST}' \
  -e SPRING_DATA_REDIS_PORT='${REDIS_PORT}' \
  -e SPRING_DATA_REDIS_PASSWORD='${REDIS_PASS}' \
  -p ${HOST_PORT}:8002 \
  ${TAG}
EOF

if [[ "$RUN_AFTER_BUILD" -eq 1 ]]; then
  echo "==> Running container: ${CONTAINER_NAME}"
  # Stop same-named container if exists
  if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
  fi

  docker run -d \
    --name "${CONTAINER_NAME}" \
    -e TZ="${TZ_VAL}" \
    -e SPRING_DATASOURCE_DRUID_URL="${DRUID_URL}" \
    -e SPRING_DATASOURCE_DRUID_USERNAME="${DB_USER}" \
    -e SPRING_DATASOURCE_DRUID_PASSWORD="${DB_PASS}" \
    -e SPRING_DATA_REDIS_HOST="${REDIS_HOST}" \
    -e SPRING_DATA_REDIS_PORT="${REDIS_PORT}" \
    -e SPRING_DATA_REDIS_PASSWORD="${REDIS_PASS}" \
    -p "${HOST_PORT}:8002" \
    ${DOCKER_RUN_EXTRA:-} \
    "${TAG}"

  echo "==> Started. Open: http://127.0.0.1:${HOST_PORT}/xiaozhi/"
fi
