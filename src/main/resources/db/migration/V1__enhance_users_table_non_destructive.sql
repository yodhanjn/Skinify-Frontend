-- Non-destructive Flyway Migration for Skinify users table
-- Preserves existing user_id, username, email, password, role, created_at, updated_at columns

ALTER TABLE `users`
    ADD COLUMN IF NOT EXISTS `first_name` VARCHAR(100) NULL AFTER `password`,
    ADD COLUMN IF NOT EXISTS `last_name` VARCHAR(100) NULL AFTER `first_name`,
    ADD COLUMN IF NOT EXISTS `phone_number` VARCHAR(30) NULL AFTER `last_name`,
    ADD COLUMN IF NOT EXISTS `is_enabled` TINYINT(1) NOT NULL DEFAULT 1 AFTER `role`,
    ADD COLUMN IF NOT EXISTS `is_account_non_locked` TINYINT(1) NOT NULL DEFAULT 1 AFTER `is_enabled`,
    ADD COLUMN IF NOT EXISTS `failed_login_attempts` INT NOT NULL DEFAULT 0 AFTER `is_account_non_locked`,
    ADD COLUMN IF NOT EXISTS `lock_time` TIMESTAMP NULL DEFAULT NULL AFTER `failed_login_attempts`;

-- Ensure unique constraint on phone_number if not already present
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'phone_number_UNIQUE');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD CONSTRAINT phone_number_UNIQUE UNIQUE (phone_number)', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
