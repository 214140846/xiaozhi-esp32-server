-- 自定义用户音色：音色槽位与配额
DROP TABLE IF EXISTS `ai_user_voice_slot`;
CREATE TABLE `ai_user_voice_slot` (
  `id` VARCHAR(32) NOT NULL COMMENT '主键',
  `user_id` BIGINT NOT NULL COMMENT '所属用户ID',
  `name` VARCHAR(64) COMMENT '音色名称',
  `tos_url` VARCHAR(500) COMMENT 'TOS文件链接或可下载URL',
  `api_key` VARCHAR(256) COMMENT '调用TTS的API Key（可选，Bearer）',
  `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `remark` VARCHAR(255) COMMENT '备注',
  `sort` INT UNSIGNED DEFAULT 0 COMMENT '排序',
  `creator` BIGINT COMMENT '创建者',
  `create_date` DATETIME COMMENT '创建时间',
  `updater` BIGINT COMMENT '更新者',
  `update_date` DATETIME COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_voice_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户自定义音色槽位';

DROP TABLE IF EXISTS `ai_user_voice_quota`;
CREATE TABLE `ai_user_voice_quota` (
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `extra_slots` INT DEFAULT 0 COMMENT '额外购买/分配的槽位',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户自定义音色配额';

