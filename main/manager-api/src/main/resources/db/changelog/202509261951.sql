-- 为用户音色配额表增加全局API Key
ALTER TABLE `ai_user_voice_quota`
  ADD COLUMN `api_key` VARCHAR(256) DEFAULT NULL AFTER `extra_slots`;

