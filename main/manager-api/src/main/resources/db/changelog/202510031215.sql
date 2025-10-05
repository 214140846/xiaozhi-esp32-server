-- Add IndexTTS sys params for admin console configuration
DELETE FROM sys_params WHERE param_code IN ('indextts.base_url','indextts.api_key','indextts.timeout_ms');
INSERT INTO sys_params (id, param_code, param_value, value_type, param_type, remark, creator, create_date, updater, update_date) VALUES
(620, 'indextts.base_url', 'null',  'string', 1, 'IndexTTS 基础地址，例如 https://indextts.example', NULL, NOW(), NULL, NOW()),
(621, 'indextts.api_key',   '',      'string', 1, 'IndexTTS 访问密钥，仅后端读取，前端不回显',       NULL, NOW(), NULL, NOW()),
(622, 'indextts.timeout_ms','10000', 'number', 1, 'IndexTTS 请求超时时间毫秒(1000-60000)',       NULL, NOW(), NULL, NOW());

