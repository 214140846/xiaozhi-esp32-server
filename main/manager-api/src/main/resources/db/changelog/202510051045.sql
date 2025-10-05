-- Add per-slot quota mode and tts limits
ALTER TABLE `tts_slot`
  ADD COLUMN `quota_mode` VARCHAR(20) DEFAULT 'off' COMMENT 'off|count|token' AFTER `clone_used`,
  ADD COLUMN `tts_call_limit` INT DEFAULT NULL COMMENT 'per-slot call limit' AFTER `quota_mode`,
  ADD COLUMN `tts_call_used` INT DEFAULT 0 COMMENT 'per-slot call used' AFTER `tts_call_limit`,
  ADD COLUMN `tts_token_limit` BIGINT DEFAULT NULL COMMENT 'per-slot token limit' AFTER `tts_call_used`,
  ADD COLUMN `tts_token_used` BIGINT DEFAULT 0 COMMENT 'per-slot token used' AFTER `tts_token_limit`;

