-- Enlarge tts_voice_id to hold SLOT_{slotId} and provider voice ids
ALTER TABLE `ai_agent`
  MODIFY COLUMN `tts_voice_id` VARCHAR(128) NULL COMMENT '音色标识';

ALTER TABLE `ai_agent_template`
  MODIFY COLUMN `tts_voice_id` VARCHAR(128) NULL COMMENT '音色标识';

