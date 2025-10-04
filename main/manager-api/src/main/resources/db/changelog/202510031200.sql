-- IndexTTS integration: slots, clone history, quotas and usage

CREATE TABLE IF NOT EXISTS `tts_slot` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `slot_id` VARCHAR(64) NOT NULL COMMENT '业务唯一ID',
  `user_id` BIGINT NOT NULL COMMENT '所属用户ID',
  `tts_model_id` VARCHAR(32) NULL COMMENT '绑定的TTS模型ID',
  `voice_id` VARCHAR(128) NULL COMMENT '当前绑定上游voice_id',
  `preview_url` VARCHAR(500) NULL COMMENT '预听地址',
  `clone_limit` INT DEFAULT 0 COMMENT '可用克隆次数',
  `clone_used` INT DEFAULT 0 COMMENT '已用克隆次数',
  `status` VARCHAR(20) DEFAULT 'empty' COMMENT 'empty|active|disabled',
  `last_cloned_at` DATETIME NULL COMMENT '最近克隆时间',
  `created_at` DATETIME NULL COMMENT '创建时间',
  `updated_at` DATETIME NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_tts_slot_slot_id` (`slot_id`),
  KEY `idx_tts_slot_user_id` (`user_id`),
  KEY `idx_tts_slot_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='音色位表';

CREATE TABLE IF NOT EXISTS `ai_tts_voice_clone` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `slot_id` VARCHAR(64) NULL COMMENT '音色位业务ID',
  `voice_id` VARCHAR(128) NOT NULL COMMENT '上游voice_id',
  `name` VARCHAR(64) NULL COMMENT '名称',
  `status` VARCHAR(20) NULL COMMENT '状态',
  `preview_url` VARCHAR(500) NULL COMMENT '预听地址',
  `source` VARCHAR(50) NULL COMMENT '来源',
  `created_at` DATETIME NULL COMMENT '创建时间',
  `updated_at` DATETIME NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_ai_tts_voice_clone_voice_id` (`voice_id`),
  KEY `idx_ai_tts_voice_clone_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='克隆音色历史';

CREATE TABLE IF NOT EXISTS `tts_quota` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `char_limit` BIGINT DEFAULT 0 COMMENT '字符总额',
  `call_limit` BIGINT DEFAULT 0 COMMENT '调用总额',
  `char_used` BIGINT DEFAULT 0 COMMENT '已用字符',
  `call_used` BIGINT DEFAULT 0 COMMENT '已用调用',
  `slots` INT DEFAULT NULL COMMENT '可用音色位上限',
  `updated_at` DATETIME NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_tts_quota_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='TTS配额';

CREATE TABLE IF NOT EXISTS `tts_usage` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `agent_id` VARCHAR(32) NULL COMMENT 'Agent ID',
  `endpoint` VARCHAR(20) NOT NULL COMMENT 'clone|tts|test',
  `cost_chars` INT DEFAULT 0 COMMENT '本次字符',
  `cost_calls` INT DEFAULT 1 COMMENT '本次调用数',
  `duration_ms` INT DEFAULT 0 COMMENT '合成时长ms',
  `slot_id` VARCHAR(64) NULL COMMENT '音色位ID',
  `created_at` DATETIME NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_tts_usage_user_id_created_at` (`user_id`, `created_at`),
  KEY `idx_tts_usage_agent_id_created_at` (`agent_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='TTS用量流水';

