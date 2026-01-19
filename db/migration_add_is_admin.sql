-- Migration: Add is_admin column to users table
-- Run this script to fix the admin panel access issue

USE `portfolio_db`;

-- Add is_admin column to users table
ALTER TABLE `users` 
ADD COLUMN `is_admin` BOOLEAN DEFAULT FALSE AFTER `full_name`;

-- Set admin user to have admin privileges
UPDATE `users` 
SET `is_admin` = TRUE 
WHERE `username` = 'admin';

-- Verify the change
SELECT id, username, email, full_name, is_admin FROM users WHERE username = 'admin';

