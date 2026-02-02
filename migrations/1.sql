
CREATE TABLE roblox_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roblox_id TEXT NOT NULL UNIQUE,
  roblox_username TEXT NOT NULL,
  is_banned BOOLEAN DEFAULT 0,
  ban_reason TEXT,
  ban_duration_hours INTEGER,
  banned_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE violations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roblox_user_id TEXT NOT NULL,
  violation_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by_moderator_id TEXT,
  reviewed_at DATETIME,
  verdict TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE moderators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roblox_id TEXT NOT NULL UNIQUE,
  roblox_username TEXT NOT NULL,
  is_system_admin BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_token TEXT NOT NULL UNIQUE,
  roblox_id TEXT NOT NULL,
  roblox_username TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_violations_roblox_user_id ON violations(roblox_user_id);
CREATE INDEX idx_violations_status ON violations(status);
CREATE INDEX idx_sessions_token ON sessions(session_token);
