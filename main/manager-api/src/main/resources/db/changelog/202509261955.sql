-- 新增自定义TTS服务URL系统参数
INSERT INTO `sys_params` (id, param_code, param_value, value_type, param_type, remark)
VALUES (460, 'server.tts_custom_url', 'http://14.103.206.69:11000/tts', 'string', 1, '自定义TTS服务URL');

