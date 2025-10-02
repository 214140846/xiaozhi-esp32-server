# Repository Guidelines
代码文件要注意不能超过 300 行，超过 300 行就要尝试封装到新文件中
你是 ENTJ 架构师
## Project Structure & Module Organization
- `main/xiaozhi-server/` is the Python real-time engine; config in `config/`, plugins in `core/`, test utilities in `test/`.
- `main/manager-api/` is the Spring Boot backend; domain modules sit in `src/main/java/com/xiaozhi/modules` and Liquibase changelog files in `resources/db`.
- `main/manager-web/` (Vue CLI) and `main/manager-web-react/` (React + Vite) host the consoles; static files remain in `public/`.
- `main/manager-mobile/` contains the uni-app client; shared deployment notes and scripts live in the repository root and `docs/`.

## Build, Test, and Development Commands
- Python service: `cd main/xiaozhi-server && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && python app.py`.
- Containers: `cd main/xiaozhi-server && docker-compose up -d`.
- Manager API: `cd main/manager-api && mvn clean package`; run locally with `mvn spring-boot:run`.
- Vue admin: `cd main/manager-web && npm install && npm run serve`; React console: `cd main/manager-web-react && npm install && npm run dev`.
- Regenerate React API clients after OpenAPI updates via `npm run generate:openapi`.

## Coding Style & Naming Conventions
- Python follows PEP 8 (4 spaces, snake_case); await async handlers and log with `loguru`.
- Java uses UpperCamelCase classes, `com.xiaozhi.*` packages, and constructor injection in services; keep DTOs inside their module package.
- Vue SFCs and React components use PascalCase filenames, while hooks/utilities stay camelCase; run `npm run lint` (React) or rely on Vue CLI formatting before pushes.
- Keep secrets out of VCS: extend `config/config.yaml` or `.env.local`, and avoid committing `.env` values or access keys.

## Testing Guidelines
- Execute `cd main/manager-api && mvn test` and add new `@SpringBootTest` or mapper tests under `src/test/java`.
- Python changes should include `pytest`/`unittest` coverage in `main/xiaozhi-server/test/` (name files `test_*.py`) and exercise websocket flows with `test_page.html` when relevant.
- For frontends, run `npm run lint` (React) or `npm run build` (Vue) to catch regressions; add vitest/cypress specs for behaviour-heavy changes.
- Document manual device verification (ESP32 pairing, OTA fetch) in the PR when automation is impractical.

## Commit & Pull Request Guidelines
- Keep commit subjects descriptive, optionally prefixing component names, e.g. `manager-api: 调整设备鉴权`.
- Limit subjects to ~72 characters, describe migrations or feature flags in the body, and squash unrelated fixes.
- PRs should link issues, summarise scope, list touched services, attach UI screenshots when applicable, and record the commands run from the testing section.

## 三端分工与职责（记忆）
- 实时引擎 `main/xiaozhi-server/`
  - 面向硬件实时交互；负责运行时 TTS 合成与音频输出。
  - 根据设备绑定角色从管理 API 获取角色 TTS 配置与 voiceId，使用克隆音色完成合成；优先流式输出，按需缓存复用。
- 管理 API `main/manager-api/`
  - 提供声音克隆与模型管理、角色与音色配置、配额与计费、日志与指标；维护 OpenAPI。
  - 作为运行时配置源，向 `xiaozhi-server` 提供角色到 TTS 配置与 voiceId 查询；管理端的合成仅用于测试页，不承担运行时合成。
- 管理前端 `main/manager-web-react/`
  - 复用已有“服务端配置”页面新增 IndexTTS 密钥字段。
  - 新增“音色分配”（配额与槽位）与“平台共用音色”页面；用户侧提供“声音克隆向导”“我的音色”“合成测试”。

## 用户上下文记忆（新增）
- 单人团队偏好：以能实现需求为主，避免过度设计与大工程化。
- 文档规范：所有文件不超过三百行；方案文档尽量配合 mermaid 图；节点文本避免括号 斜杠 点号，使用简洁中文或安全文本。
- 实时引擎定义：`main/xiaozhi-server` 为 Python 服务，负责运行时 TTS 合成与音频输出；ManagerAPI 只做配置与声音克隆；管理台合成仅供测试。
- 表达风格：不要搞虚的，给清晰可落地的接口与示例，面向一个人即可维护与实现。
- IndexTTS ManagerAPI 最小范围：声音克隆 角色到音色配置 共享音色 配额与用量 合成测试 OpenAPI。

## 当前 Server 配置来源现状（调研结论）
- 条件式读取：当 `main/xiaozhi-server/data/.config.yaml` 中存在 `manager-api.url` 时，Server 走 Java API 配置模式，`config/config_loader.py` 设置 `read_config_from_api=true` 并使用远程配置；否则合并本地 `config.yaml` 和 `data/.config.yaml`。
- 启动阶段：`config/config_loader.py:34` 判断是否存在 `manager-api.url`，若存在调用 `get_config_from_api`，进而 `config/manage_api_client.py:130` 调用 `POST /config/server-base` 获取基础配置。
- 连接阶段：`core/connection.py:525` 起的 `_initialize_private_config` 在 `read_config_from_api=true` 时调用 `config_loader.get_private_config_from_api`，后者经 `manage_api_client.py:139` 调用 `POST /config/agent-models` 获取设备差异化配置并合并到 `TTS ASR LLM Memory Intent prompt voiceprint`。
- 无远端模式：若未配置 ManagerAPI，TTS 的 `voice_id` 等来自本地配置，未进行远端拉取。

## IndexTTS 平台要点（新）
- 无异步克隆任务轮询：克隆是同步接口，IndexTTS 提供 `POST /voices/clone`，Body `{ upload_urls: [] }`，直接返回 `voice_id` 与接受数、跳过数。
- 合成接口：`POST /tts`，Body `{ text, voice_id }`，同步返回 `audio/wav` 并扣减一次调用。调试路径可用 `{ text, ref_audio_url }`。
- 我方“小资平台”的“克隆任务”只是前端与平台流程概念，非 IndexTTS 的后端任务模型；ManagerAPI 不需要设计任务轮询接口。

## IndexTTS 接入共识（更新）
- 不新建调用通道 不新加路由 复用既有 TTS 抽象与 Provider 机制。
- 启用方式：Server 本地配置 `selected_module.TTS=IndexStreamTTS`，对应实现见 `core/providers/tts/index_stream.py`。
- ManagerAPI 不驱动 Provider 切换，只提供克隆 voiceId 管理 与 角色到音色映射、配额与用量、管理台合成测试。
- 运行时引擎直连 IndexTTS 合成；密钥仅保存在服务端或 ManagerAPI 配置表，设备不暴露。
- 失败回退保留原 Provider 或默认音色 不影响设备通道与固件。

## 本次版本范围（记录）
- 新增并启用 IndexTTS Provider 由 Server 本地配置决定 不使用差异化配置。
- 管理前端补两处：服务端配置页录入 IndexTTS 基础地址；角色配置或音色分配处维护 voiceId 映射。
- 用量统计沿用现有聊天记录上报接口 不新增通道。

## 文档变更记录（新增）
- 将 docs/dev/小智声音克隆IndexTTS接入/技术方案.md 改写为 4R 框架版本：Reason Result Roadmap Risks；保持单人团队最小闭环与文件不超过三百行。
- 结构化结论：实时引擎直连 IndexTTS 运行时合成与播放；ManagerAPI 负责克隆 配置源 用量 合成测试；管理前端负责密钥配置 克隆向导 音色与测试。
- 文档内新增多处 mermaid 图示 仅使用安全纯文本节点。
- 再次改写为 5W2H 结构：What Why Who Where When How How Much；强化可交付物 验收口径 预算与时序安排；保持节点文本安全与篇幅限制。
 - 最新改写为 C4 加 4R 结构：添加系统上下文 容器 组件 运行时交互图 与 4R 的 Reason Result Roadmap Risks。按用户要求 本文不限制三百行 其余文档仍遵守限制。
 - 新增 Server 端方案 4R 与 5W2H 精简版改写，路径 docs/dev/小智声音克隆IndexTTS接入/技术方案-Server端.md，保持节点文本安全与篇幅限制；仅配置切换 Provider 的最小闭环明确。
 - 新增 管理前端 React 端方案 4R 与 5W2H 精简版改写，路径 docs/dev/小智声音克隆IndexTTS接入/技术方案-管理前端React端.md；最小范围为 管理端密钥配置 配额管理 共用音色 与 用户侧 声音克隆向导 我的音色 合成测试。
 - 管理端增加 IndexTTS 基址与密钥字段 仅管理员可见；用户侧三页形成自助闭环 与后端字段完全对齐；文档均使用安全 mermaid 节点文本 并控制在三百行以内。
 - 验收标准 核心路径可用 配置可保存并生效 克隆可见可预听 合成测试可播放 错误提示统一 详见对应方案文档结尾的验收与用例。
 - 改写 ManagerAPI 端方案为 4R 与 5W2H 精简版，路径 docs/dev/小智声音克隆IndexTTS接入/技术方案-ManagerAPI端.md；节点文本使用安全中文 描述聚焦最小闭环 文件不超过三百行。
 - 修正 ManagerAPI 端方案文档的 mermaid 图节点语法为安全形式，确保渲染正确并符合节点文本安全约束。
 - 再次修正 ManagerAPI 端数据模型与接口约束：不新增角色相关表，直接复用 ai_agent 与 ai_agent_template 的 tts_model_id 与 tts_voice_id 字段；共享音色复用 ai_tts_voice；如需用户克隆音色，仅新增 ai_tts_voice_clone；配额阈值复用 sys_params，用量沿用 ai_agent_chat_history 聚合；实时引擎通过 POST config agent-models 获取映射。
