-- 扩容自定义音色ID存储长度，避免 USER_VOICE_ 前缀导致溢出
ALTER TABLE `ai_agent`
  MODIFY COLUMN `tts_voice_id` VARCHAR(64) COMMENT '音色标识';

ALTER TABLE `ai_agent_template`
  MODIFY COLUMN `tts_voice_id` VARCHAR(64) COMMENT '音色标识';

