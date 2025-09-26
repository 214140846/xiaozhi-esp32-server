-- 新增 server.public_base_url 参数，供拼接下载URL为公网绝对地址（幂等：不存在才插入）
INSERT INTO `sys_params` (id, param_code, param_value, value_type, param_type, remark)
SELECT 461,
       'server.public_base_url',
       'http://127.0.0.1:8002/xiaozhi',
       'string',
       1,
       '公网基础地址（形如 http://host:port/上下文路径），用于拼接 /userVoice/download/... 为绝对URL'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `sys_params` WHERE `param_code` = 'server.public_base_url');
