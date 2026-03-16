-- Migration: add auth fields to users table
-- Split into separate statements for TiDB compatibility

ALTER TABLE `users` ADD COLUMN `name` VARCHAR(100) NULL;
ALTER TABLE `users` ADD COLUMN `email` VARCHAR(255) NULL;
ALTER TABLE `users` ADD COLUMN `password_hash` VARCHAR(255) NULL;
ALTER TABLE `users` ADD COLUMN `role` VARCHAR(10) NOT NULL DEFAULT 'USER';
ALTER TABLE `users` ADD COLUMN `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

CREATE UNIQUE INDEX `users_email_key` ON `users`(`email`);
