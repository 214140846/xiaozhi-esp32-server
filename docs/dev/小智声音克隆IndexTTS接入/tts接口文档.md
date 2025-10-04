# TTS 接口文档（IndexTTS 接入最小集）

本文档涵盖管理员配置、模型与共享音色、克隆/音色位、合成测试、用量查询等接口，支持 Postman/curl 直接联调。

- 后端 BASE（示例）：http://localhost:8002/xiaozhi
- 鉴权：除公开接口外均需登录拿到 Bearer Token（/user/login），或使用已有会话 Cookie。
- Swagger：启动后打开 {BASE}/doc.html，分组 tts、timbre、models、config、admin。

## 0. 管理台参数（管理员在“参数管理”中配置）
- indextts.base_url（string）：IndexTTS 基础地址，如 https://indextts.example
- indextts.api_key（string）：IndexTTS 密钥，仅后端读取，前端不回显
- indextts.timeout_ms（number）：请求超时(毫秒)，建议 3000–20000

查询参数（分页+关键字）
- GET {BASE}/admin/params/page?paramCode=indextts&page=1&limit=10

更新参数（示例）
- PUT {BASE}/admin/params
- Body: { "id": 620, "paramCode": "indextts.base_url", "paramValue": "https://indextts.example", "valueType": "string", "remark": "IndexTTS 基址" }

## 1. 模型配置（管理员）

查询可用供应器（确认 provider_code）
- GET {BASE}/models/TTS/provideTypes

新增 IndexStreamTTS 模型（注意 path 的 provideCode 使用 index_stream）
- POST {BASE}/models/TTS/index_stream
- Body
{
  "modelCode": "IndexStreamTTS",
  "modelName": "IndexStreamTTS",
  "isDefault": 0,
  "isEnabled": 1,
  "configJson": {
    "type": "index_stream",
    "api_url": "https://indextts.example/tts",
    "audio_format": "pcm"
  },
  "remark": "IndexTTS provider",
  "sort": 0
}
- 返回 data.id 即 ttsModelId

列出 TTS 模型（可拿到 id）
- GET {BASE}/models/names?modelType=TTS

（可选）设置默认模型
- PUT {BASE}/models/default/{id}

## 2. 共享音色（管理员）

新增共享音色（写入 ai_tts_voice）
- POST {BASE}/ttsVoice
- Body
{
  "ttsModelId": "<上一步拿到的 ttsModelId>",
  "ttsVoice": "jay_klee",        // 上游 IndexTTS 的 voice_id/character
  "name": "共享音色-示例",
  "languages": "中文",
  "voiceDemo": "https://example.com/demo.mp3",
  "remark": "管理员共享音色",
  "sort": 1
}

按模型查询共享音色（用户只读）
- GET {BASE}/models/{ttsModelId}/voices

## 3. 克隆与音色位（slot）

首次克隆（不带 slotId）：后端先调用上游，成功后自动创建音色位并返回 slotId
- POST {BASE}/ttsVoice/clone
- Body
{
  "fileUrls": [
    "https://download.samplelib.com/wav/sample-15s.wav"
  ],
  "name": "first-slot-voice"
}
- 返回 data.slotId：新建的音色位 ID

复克隆（覆盖）：带 slotId，成功后覆盖该位的 voiceId，并累加 cloneUsed
- POST {BASE}/ttsVoice/clone
- Body
{
  "slotId": "<上次返回的slotId>",
  "fileUrls": ["https://download.samplelib.com/wav/sample-15s.wav"],
  "name": "re-clone"
}

查询“我的音色位”
- GET {BASE}/tts/slots/mine
- GET {BASE}/tts/slots/{slotId}

## 4. 合成测试（仅管理台测试用）

用 slotId 测试（推荐）
- POST {BASE}/tts/test/speak → 返回 audio/wav
- Body
{
  "text": "你好，这是一次合成测试",
  "slotId": "<slotId>"
}

兼容：用共享音色 id 测试
- POST {BASE}/tts/test/speak
- Body
{
  "text": "你好，这是一次合成测试",
  "ttsVoiceId": "<ai_tts_voice.id>"
}

## 5. 用量查询（我的）

克隆/测试成功会写入 tts_usage。查询最近 N 条：
- GET {BASE}/tts/usage/mine?endpoint=clone&limit=50
- GET {BASE}/tts/usage/mine?endpoint=test&limit=50
- 不带 endpoint 查看全部：GET {BASE}/tts/usage/mine?limit=50

返回字段：id,userId,agentId,endpoint,costChars,costCalls,durationMs,slotId,createdAt

## 6. 运行时 Server 侧（仅说明）

xiaozhi-server 本地启用 IndexStreamTTS（如上游需要鉴权可加 api_key）

data/.config.yaml 片段
```
selected_module:
  TTS: IndexStreamTTS
TTS:
  IndexStreamTTS:
    type: index_stream
    api_url: "https://indextts.example/tts"
    api_key: "sk-xxxx"     # 可选
    tts_timeout: 10         # 秒
```

## 7. 常见问题
- 404：所有接口都带 /xiaozhi 前缀；不要加 /api。
- 供应器不存在：创建模型时 path 的 provideCode 应为 index_stream（非 IndexStreamTTS）。可先 GET /models/TTS/provideTypes。
- 克隆失败不写库：首次/复克隆都先调用上游，未返回 voice_id 直接报错且不落库。
- 参数页看不到 indextts.*：确认已执行变更（或手动新增三条 sys_params，param_type=1）。

## 8. 一键验证（curl 示例，替换 <token>）

1) 新增模型（index_stream）
```
curl -sS -X POST "{BASE}/models/TTS/index_stream" \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
    "modelCode":"IndexStreamTTS","modelName":"IndexStreamTTS","isDefault":0,"isEnabled":1,
    "configJson":{"type":"index_stream","api_url":"https://indextts.example/tts","audio_format":"pcm"}
  }'
```

2) 首次克隆（不传 slotId）
```
curl -sS -X POST "{BASE}/ttsVoice/clone" \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"fileUrls":["https://download.samplelib.com/wav/sample-15s.wav"],"name":"first-slot"}'
```

3) 合成测试（slotId）
```
curl -sS -X POST "{BASE}/tts/test/speak" \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" --output out.wav \
  -d '{"text":"你好，这是一次合成测试","slotId":"<slotId>"}'
```

4) 查看用量
```
curl -sS "{BASE}/tts/usage/mine?endpoint=clone&limit=20" -H "Authorization: Bearer <token>"
```

