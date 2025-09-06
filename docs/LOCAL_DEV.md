# 本地开发启动命令（精简版）

适用于 macOS，本项目本地开发涉及 4 个模块，默认端口如下：
- xiaozhi-server（Python）：WebSocket 8000，HTTP 8003
- manager-api（Java Spring Boot）：8002
- manager-web（Vue 2 + Vue CLI）：8001
- manager-mobile（uni-app + Vue 3 + Vite）：按平台而定

> 说明：前端子项目统一使用 pnpm 管理依赖与启动（即便目录中存在 package-lock.json 也可忽略，用 pnpm 安装）。

## 依赖要求
- Node >= 18，pnpm >= 7.30（建议 10.x）
- JDK 21，Maven 3.8+
- Python 3.10+（建议）与 FFmpeg（xiaozhi-server 需要）
- MySQL 8.0+，Redis 5.0+

## 启动顺序（推荐）
1) 启动 manager-api（端口 8002）

```bash
cd main/manager-api
# 确保本地已启动 MySQL 与 Redis，并按需修改 src/main/resources/application-dev.yml
mvn spring-boot:run -Dspring-boot.run.profiles=dev
# 访问接口文档：http://localhost:8002/xiaozhi/doc.html
```

2) 启动 xiaozhi-server（端口 8000 / 8003）

```bash
cd main/xiaozhi-server
# 建议安装 FFmpeg（macOS）：brew install ffmpeg
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 注意：需准备 data/.config.yaml（按项目 README 部署章节说明）
python app.py
# WebSocket: ws://localhost:8000/xiaozhi/v1/
# OTA/视觉接口: http://localhost:8003/
```

3) 启动 manager-web（端口 8001，使用 pnpm）

```bash
cd main/manager-web
pnpm i
pnpm serve
# 开发代理：/xiaozhi -> http://127.0.0.1:8002
# 访问地址：http://localhost:8001/
```

4) 启动 manager-mobile（可选，使用 pnpm）

```bash
cd main/manager-mobile
pnpm i
# H5 调试
pnpm dev:h5
# 微信小程序调试（产物在 dist/dev/mp-weixin）
pnpm dev:mp
```

## 常见问题（简）
- 端口被占用：
  - manager-web 修改 main/manager-web/vue.config.js 中 devServer.port
  - manager-api 修改 application.yml 中 server.port
  - xiaozhi-server 端口由配置决定（WS 默认 8000，HTTP 默认 8003）
- 缺少 FFmpeg：macOS 执行 `brew install ffmpeg`
- xiaozhi-server 提示缺少 data/.config.yaml：按 README 部署文档创建并配置该文件，或使用从 API 读取配置的方案
- 统一使用 pnpm：如存在 package-lock.json，可忽略或删除后执行 `pnpm i`

