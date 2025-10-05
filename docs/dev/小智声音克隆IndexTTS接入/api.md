# IndexTTS API 文档（Server 端）

本文档描述 xiaozhi_tts_api（server.py）提供的 HTTP API。示例默认后端监听 `http://localhost:10000`。

- 认证方式
  - 管理员接口：二选一
    - `Authorization: Bearer <admin_jwt>`（通过 `/auth/login` 获得）
    - `X-Admin-Token: <ADMIN_TOKEN>`（在 `.env` 配置）
  - 用户/Key 鉴权接口：`Authorization: Bearer <api_key>`（创建 Key 后返回的明文）
- 高危操作（仅密钥相关）：在对应接口额外携带一次性 `X-Action-Token`
  - 先 `POST /admin/ops/prepare` 获取（5 分钟有效）
  - 将返回的 `token` 放到真正操作的请求头 `X-Action-Token`

---

## 健康检查
GET /health
- Resp: `{ "status": "healthy", "timestamp": number }`

示例
```
curl -sS http://localhost:10000/health
```

---

## 认证（用户与管理员）

### 注册（任意用户）
POST /auth/register
- Body: `{ "username": string, "password": string, "email?": string }`
- Resp: `{ id, username, email?, roles }`

```
curl -sS -X POST http://localhost:10000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"pass"}'
```

### 登录（获取 JWT）
POST /auth/login
- Form: `username`, `password`（x-www-form-urlencoded）
- Resp: `{ access_token, token_type }`

```
curl -sS -X POST http://localhost:10000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=pass"
```

### 当前用户
GET /auth/me
- Header: `Authorization: Bearer <jwt>`

```
curl -sS http://localhost:10000/auth/me \
  -H "Authorization: Bearer <admin_jwt>"
```

---

## 管理员接口（Admin）
路由前缀：`/admin`。管理员认证二选一：`Authorization: Bearer <admin_jwt>` 或 `X-Admin-Token: <ADMIN_TOKEN>`。

### 高危操作令牌：准备/确认
- 准备：POST /admin/ops/prepare
  - Body: `{ "action": "key_create" | "key_update_quota" | "key_delete" }`
  - Resp: `{ token, expires_at }`
```
curl -sS -X POST http://localhost:10000/admin/ops/prepare \
  -H "Content-Type: application/json" -H "X-Admin-Token: <ADMIN_TOKEN>" \
  -d '{"action":"key_create"}'
```

- 确认（可选）：POST /admin/ops/confirm
  - Body: `{ token, action }`

### API Key 管理

- 创建 Key（高危）
  - POST /admin/keys/create
  - Header: `X-Action-Token: <token>`
  - Body：
    - `max_tts_calls: number`（必填）
    - `remaining_clone_calls?: number`（可填；不填默认 0；`max_clone_calls` 可选，若不填将与 `remaining_clone_calls` 同步）
    - `rate_limit_daily?: number | null`
    - `expires_at?: string | null`（ISO8601，如 `2026-12-31T23:59:59Z`）
    - `voice_limit?: number | null`
    - `remark?: string | null`
  - Resp: `{ api_key, key_info }`
```
curl -sS -X POST http://localhost:10000/admin/keys/create \
  -H "Content-Type: application/json" -H "X-Admin-Token: <ADMIN_TOKEN>" \
  -H "X-Action-Token: <token>" \
  -d '{"max_tts_calls":1000,"remaining_clone_calls":10}'
```

- 更新 Key（高危：当更新配额字段时）
  - PUT /admin/keys/update
  - Body: `{ api_key: string, key_update_data?: object }`
  - 当更新字段包含 `max_tts_calls`/`remaining_tts_calls`/`remaining_clone_calls` 时需要 `X-Action-Token`
```
curl -sS -X PUT http://localhost:10000/admin/keys/update \
  -H "Content-Type: application/json" -H "X-Admin-Token: <ADMIN_TOKEN>" \
  -H "X-Action-Token: <token>" \
  -d '{"api_key":"sk-xxx","key_update_data":{"remaining_clone_calls":5}}'
```

- 按 ID 更新 Key（高危：同上规则）
  - PUT /admin/keys/{id}
```
curl -sS -X PUT http://localhost:10000/admin/keys/1 \
  -H "Content-Type: application/json" -H "X-Admin-Token: <ADMIN_TOKEN>" \
  -H "X-Action-Token: <token>" \
  -d '{"remaining_tts_calls":500,"remaining_clone_calls":8}'
```

- 删除 Key（高危）
  - POST /admin/keys/delete（按值） 或 DELETE /admin/keys/{id}
```
curl -sS -X POST http://localhost:10000/admin/keys/delete \
  -H "Content-Type: application/json" -H "X-Admin-Token: <ADMIN_TOKEN>" \
  -H "X-Action-Token: <token>" \
  -d '{"api_key":"sk-xxx"}'
```

- 列表
  - GET /admin/keys/list
```
curl -sS http://localhost:10000/admin/keys/list \
  -H "X-Admin-Token: <ADMIN_TOKEN>"
```

- 用量查询（管理员）
  - POST /admin/keys/usage
  - Body: `{ api_key }`
  - Resp: `{ total_calls, today_calls, remaining_tts_calls, remaining_clone_calls, clone_total, used_tokens, bytes_out_total }`
```
curl -sS -X POST http://localhost:10000/admin/keys/usage \
  -H "Content-Type: application/json" -H "X-Admin-Token: <ADMIN_TOKEN>" \
  -d '{"api_key":"sk-xxx"}'
```

- 按日用量（管理员）
  - GET /admin/keys/{key_id}/usage/daily?start=YYYY-MM-DD&end=YYYY-MM-DD

### 声音资源（可选管理）
- GET /admin/voices
- POST /admin/voices
- PUT /admin/voices/{voice_id}
- DELETE /admin/voices/{voice_id}
- GET /admin/keys/{key_id}/voices
- POST /admin/keys/{key_id}/voices

---

## 用户接口（User）
前缀：`/user`，需用户登录（`Authorization: Bearer <jwt>`）。

### 查询本人 Key 用量
POST /user/keys/usage
- Body: `{ api_key }`
- Resp: 同管理员用量结构（包含 `remaining_clone_calls`、`clone_total`）
```
curl -sS -X POST http://localhost:10000/user/keys/usage \
  -H "Content-Type: application/json" -H "Authorization: Bearer <user_jwt>" \
  -d '{"api_key":"sk-xxx"}'
```

### 当前用户信息
GET /user/me

---

## TTS 与克隆（面向 API Key 使用者）
这些接口使用 API Key 作为 Bearer Token：`Authorization: Bearer sk-xxxx`。

### 克隆音色
POST /voices/clone
- Header: `Authorization: Bearer <api_key>`
- Body：
  - JSON：`{ upload_urls: string[] }`（推荐；所有 URL 总时长需 ≥ 12 秒）
  - 返回：`{ voice_id, files_accepted, files_skipped, remaining_clone_calls, preview_url? }`
  - 扣减规则：按 `files_accepted` 递减 `remaining_clone_calls`
  - 去重/复用：如果相同 `speaker_key` 已属于相同 API Key，会直接复用并返回 `files_accepted=0`（不扣次数）；若属于其他 Key，返回 403。

```
curl -sS -X POST http://localhost:10000/voices/clone \
  -H "Authorization: Bearer sk-xxx" -H "Content-Type: application/json" \
  -d '{"upload_urls":["https://download.samplelib.com/wav/sample-15s.wav"]}'
```

### 文本合成（使用 voice_id）
POST /tts
- Header: `Authorization: Bearer <api_key>`
- Body: `{ text: string, voice_id: string }`
- Resp: `audio/wav`
- 返回头：`Content-Type: audio/wav`
- 失败返回：`application/json`，示例 `{ "status": "error", "error": "<message>" }`
- 计费：成功调用扣减 `remaining_tts_calls` 1 次

```
curl -sS -X POST http://localhost:10000/tts \
  -H "Authorization: Bearer sk-xxx" -H "Content-Type: application/json" \
  --output out.wav \
  -d '{"text":"你好，这是一次合成测试。","voice_id":"<克隆返回的voice_id>"}'
```

- 调试兼容（不推荐）：`{ text, ref_audio_url }` 仍可用，用作临时调试。

---

## 错误码约定
- 200：成功
- 400：请求参数错误（如克隆时音频不达标）
- 401：未认证/令牌无效（含缺少 `X-Action-Token`）
- 402：配额不足（`remaining_tts_calls` 或 `remaining_clone_calls`）
- 403：无权限/被禁用/过期/跨 Key 访问
- 404：资源不存在
- 409：重复/唯一约束冲突（如重复克隆且无法复用）
- 503：Worker 不可用（无可用客户端）
- 504：任务超时
- 500：服务端内部错误（请查看 `logs/api.log` 或控制台 DEBUG 日志）

---

## 备注
- 数据库配置：`.env` 中设置 `DATABASE_URL`（MySQL + PyMySQL）。执行一次 `python init_db.py` 创建/迁移表。
- 高危操作实践：创建/修改配额/删除都需要 `X-Action-Token`；前端已封装 prepare→执行 流程。
- 用量统计：
  - `remaining_clone_calls` 为当前剩余额度；
  - `clone_total` 来源于 `api_usage_logs.clone_used` 累加，更贴近真实成功克隆的文件数。
