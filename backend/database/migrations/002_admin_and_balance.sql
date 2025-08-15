-- Add admin columns and security flags to users
ALTER TABLE users ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'user';
ALTER TABLE users ADD COLUMN force_password_change TINYINT DEFAULT 0;
ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until DATETIME NULL;

-- Blackjack balance per user
CREATE TABLE IF NOT EXISTS blackjack_balance (
	user_id VARCHAR(36) PRIMARY KEY,
	balance INT NOT NULL DEFAULT 1000,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;