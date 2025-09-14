# 部署与构建快速指南（含 .env 用法）

本文档说明：
- 如何单独构建并部署某个服务（server / manager-api / manager-web-react）。
- 如何一键部署全部服务。
- 在服务器上部署时，若希望使用服务器已安装的 MySQL 与 Redis（非 Docker），应如何配置。

---

## 1. 先决条件
- 已安装 Docker 与 Docker Compose 插件
- 克隆本项目代码到本地

可参考 docs/docker-build.md 进行 Docker 的基础安装与本地构建说明。

---

## 2. 使用 .env 定制构建参数（可选）
三个单独构建脚本已支持加载环境文件：
- `docker-build-server.sh`
- `docker-build-manager-api.sh`
- `docker-build-web-react.sh`

优先级：命令行参数 > .env 文件中的变量 > 脚本内置默认值。

支持的环境变量示例（创建 `.env` 文件放在项目根目录）：
```
# Server 镜像标签
SERVER_IMAGE_TAG=xiaozhi-server:latest

# Manager API 镜像标签
MANAGER_API_IMAGE_TAG=xiaozhi-manager-api:latest

# Web-React 镜像标签与基础镜像
WEB_REACT_IMAGE_TAG=xiaozhi-manager-web-react:latest
WEB_REACT_MIRROR=aliyun              # 可选：daocloud/aliyun/tencent/ustc/netease 或直接写完整镜像
WEB_REACT_BASE_IMAGE=nginx:1.27-alpine # 可选：若设置则优先生效
WEB_REACT_SPA_PATH=main/manager-web-react
WEB_REACT_BUILD_DIR=dist
```

也可通过 `--env-file <path>` 指定其它 env 文件。

---

## 3. 单独构建与部署某个服务

### 3.1 xiaozhi-esp32-server（Python 后端）
- 构建镜像：
```
./docker-build-server.sh --tag xiaozhi-esp32-server:server_latest
```
- 运行容器（示例）：
```
docker run -d --name xiaozhi-esp32-server \
  -p 8000:8000 \
  -p 8003:8003 \
  -v $(pwd)/main/xiaozhi-server/data:/opt/xiaozhi-esp32-server/data \
  -v $(pwd)/main/xiaozhi-server/models/SenseVoiceSmall/model.pt:/opt/xiaozhi-esp32-server/models/SenseVoiceSmall/model.pt \
  xiaozhi-esp32-server:server_latest
```

### 3.2 manager-api（Java Spring Boot）
- 构建镜像：
```
./docker-build-manager-api.sh --tag xiaozhi-manager-api:latest
```
- 运行容器（示例，依赖外部 MySQL/Redis 或同网络下的 DB/Redis 容器）：
```
docker run -d --name xiaozhi-manager-api \
  -e TZ=Asia/Shanghai \
  -e SPRING_DATASOURCE_DRUID_URL="jdbc:mysql://<mysql_host>:3306/xiaozhi_esp32_server?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&nullCatalogMeansCurrent=true&connectTimeout=30000&socketTimeout=30000&autoReconnect=true&failOverReadOnly=false&maxReconnects=10" \
  -e SPRING_DATASOURCE_DRUID_USERNAME=root \
  -e SPRING_DATASOURCE_DRUID_PASSWORD=123456 \
  -e SPRING_DATA_REDIS_HOST=<redis_host> \
  -e SPRING_DATA_REDIS_PORT=6379 \
  -e SPRING_DATA_REDIS_PASSWORD= \
  -v $(pwd)/main/xiaozhi-server/uploadfile:/uploadfile \
  -p 8002:8002 \
  xiaozhi-manager-api:latest
```
> 说明：manager-api 默认监听 8002 端口，生产环境通常由前端 Nginx 反代到 `/api/`。

### 3.3 manager-web-react（前端 + Nginx）
该脚本会用 pnpm 构建前端，并打包到 Nginx 运行镜像中。
- 构建镜像：
```
# 基于镜像源别名（如 aliyun/daocloud 等）或通过 .env 指定 WEB_REACT_MIRROR/WEB_REACT_BASE_IMAGE
./docker-build-web-react.sh --tag xiaozhi-manager-web-react:latest --mirror aliyun
```
- 运行容器（示例）：
```
docker run -d --name xiaozhi-manager-web-react \
  -p 8002:80 \
  xiaozhi-manager-web-react:latest
```
> 如需将前端的 /api 代理到 manager-api，请在前端工程内提供合适的 `nginx.conf`，该脚本会一并打包。

---

## 4. 一键部署全部服务

推荐方式一：直接使用 Compose 清单：
```
cd main/xiaozhi-server
# 启动
docker compose -f docker-compose_all.yml up -d
# 停止
# docker compose -f docker-compose_all.yml down
```

推荐方式二：使用自动化脚本（可能需要 root 权限，详见 docs/Deployment_all.md）：
```
sudo bash -c "$(wget -qO- https://ghfast.top/https://raw.githubusercontent.com/xinnan-tech/xiaozhi-esp32-server/refs/heads/main/docker-setup.sh)"
```

---

## 5. 使用服务器自带 MySQL 与 Redis（非 Docker）
有些服务器已安装并运行 MySQL/Redis，且希望复用它们。此时建议：

1) 拷贝 `main/xiaozhi-server/docker-compose_all.yml` 为你的部署清单（例如 `docker-compose.override.yml`）。
2) 删除或注释以下服务：
- `xiaozhi-esp32-server-db`
- `xiaozhi-esp32-server-redis`
3) 修改 `xiaozhi-esp32-manager-api` 服务的环境变量，指向外部 MySQL/Redis：
```
    environment:
      - TZ=Asia/Shanghai
      - SPRING_DATASOURCE_DRUID_URL=jdbc:mysql://<mysql_host>:3306/xiaozhi_esp32_server?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&nullCatalogMeansCurrent=true&connectTimeout=30000&socketTimeout=30000&autoReconnect=true&failOverReadOnly=false&maxReconnects=10
      - SPRING_DATASOURCE_DRUID_USERNAME=<mysql_user>
      - SPRING_DATASOURCE_DRUID_PASSWORD=<mysql_password>
      - SPRING_DATA_REDIS_HOST=<redis_host>
      - SPRING_DATA_REDIS_PASSWORD=<redis_password_if_any>
      - SPRING_DATA_REDIS_PORT=6379
```
4) 移除 manager-api 对 DB/Redis 的 `depends_on`，确保启动顺序由外部服务可用性来保证。
5) 之后执行：
```
docker compose -f docker-compose.override.yml up -d
```

可选优化：也可以将上述环境变量放入一个 `.env.deploy` 文件，并在 Compose 中使用：
```
    env_file:
      - .env.deploy
```
这样方便在不同环境切换 MySQL/Redis 的主机与凭据。

---

如需进一步定制部署，或遇到问题，欢迎在仓库提 Issue 交流。
