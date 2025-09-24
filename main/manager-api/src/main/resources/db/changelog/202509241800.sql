-- ai_agent_emotion_asset: 存储智能体自定义表情资源
CREATE TABLE IF NOT EXISTS `ai_agent_emotion_asset` (
  `id` varchar(64) NOT NULL,
  `agent_id` varchar(64) NOT NULL COMMENT '智能体ID',
  `code` varchar(64) NOT NULL COMMENT '表情编码, 如 happy/angry',
  `emoji` varchar(16) DEFAULT NULL COMMENT 'emoji 符号',
  `file_path` varchar(512) NOT NULL COMMENT '文件存储路径',
  `file_size` bigint DEFAULT NULL COMMENT '文件大小',
  `content_type` varchar(64) DEFAULT NULL COMMENT '内容类型',
  `create_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agent_code` (`agent_id`,`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='智能体表情资源';

