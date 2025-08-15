-- Users table
CREATE TABLE IF NOT EXISTS users (
	id VARCHAR(36) PRIMARY KEY,
	email VARCHAR(255) NOT NULL UNIQUE,
	username VARCHAR(255) NOT NULL UNIQUE,
	name VARCHAR(255),
	password_hash VARCHAR(255) NOT NULL,
	created_at DATETIME NOT NULL
) ENGINE=InnoDB;

-- Leaderboard best scores per user+game
CREATE TABLE IF NOT EXISTS leaderboard (
	user_id VARCHAR(36) NOT NULL,
	game VARCHAR(64) NOT NULL,
	score INT NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	PRIMARY KEY (user_id, game),
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Index for fast sorting
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_score ON leaderboard (game, score DESC);