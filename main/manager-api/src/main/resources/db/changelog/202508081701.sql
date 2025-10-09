-- 添加Index-TTS-vLLM流式TTS供应器
delete from `ai_model_provider` where id = 'SYSTEM_TTS_IndexStreamTTS';
INSERT INTO `ai_model_provider` (`id`, `model_type`, `provider_code`, `name`, `fields`, `sort`, `creator`, `create_date`, `updater`, `update_date`) VALUES
('SYSTEM_TTS_IndexStreamTTS', 'TTS', 'index_stream', 'Index-TTS-vLLM流式语音合成', '[{"key":"api_url","label":"API地址","type":"string"},{"key":"api_key","label":"API密钥","type":"string"},{"key":"api_key_prefix","label":"鉴权前缀","type":"string"},{"key":"audio_format","label":"音频格式","type":"string"},{"key":"tts_timeout","label":"请求超时","type":"number"}]', 16, 1, NOW(), 1, NOW());

-- 添加Index-TTS-vLLM流式TTS模型配置
delete from `ai_model_config` where id = 'TTS_IndexStreamTTS';
INSERT INTO `ai_model_config` VALUES ('TTS_IndexStreamTTS', 'TTS', 'IndexStreamTTS', 'Index-TTS-vLLM流式语音合成', 0, 1, '{\"type\": \"index_stream\", \"api_url\": \"https://indextts.example/tts\", \"api_key\": \"sk_xxx\", \"api_key_prefix\": \"Bearer \", \"audio_format\": \"wav\", \"tts_timeout\": 60}', NULL, NULL, 19, NULL, NULL, NULL, NULL);

-- 更新Index-TTS-vLLM流式TTS配置说明
UPDATE `ai_model_config` SET 
`doc_link` = 'https://github.com/Ksuriuri/index-tts-vllm',
`remark` = 'IndexStreamTTS模型配置说明：
1. configJson需写入api_url与api_key确保运行时直连IndexTTS
2. api_key_prefix默认使用Bearer可按需设为空字符串
3. tts_timeout控制合成超时时间单位秒
4. 如需集中保存密钥可先读系统参数再写入configJson
操作指引：
1. 管理员在模型配置创建TTS_IndexStreamTTS模型
2. 保存后可在共享音色页上架IndexTTS对应voiceId
3. 运行时Python服务拉取模型配置即可合成播放
' WHERE `id` = 'TTS_IndexStreamTTS';

-- 添加Index-TTS-vLLM流式TTS音色
delete from `ai_tts_voice` where tts_model_id = 'TTS_IndexStreamTTS';
-- 默认音色
INSERT INTO `ai_tts_voice` VALUES ('TTS_IndexStreamTTS_0001', 'TTS_IndexStreamTTS', 'Jay Klee', 'jay_klee', '中文及中英文混合', NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL);
