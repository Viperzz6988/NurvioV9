import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { run, get, all } from './db.js';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'ff6045c6882289068e6fb473683294ac64bcc63d2f920ef3cb2ce333b4e6f2492d761ba253bb4053dbba28facab5c3219cfbc4b4b7af323081153e392aa70e9';
const DATABASE_URL = process.env.DATABASE_URL || 'mysql://orange:1Moritz0.@192.168.178.49:3306/nurvio_hub';
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set. Please set it to a MySQL URL (e.g., mysql://user:pass@localhost:3306/nurvio_hub)');
}
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// Simple in-memory login rate limiter per IP
const loginAttemptsByIp = new Map();
const MAX_ATTEMPTS_PER_MINUTE = 5;
function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60_000;
  const bucket = loginAttemptsByIp.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  loginAttemptsByIp.set(ip, bucket);
  if (bucket.count > MAX_ATTEMPTS_PER_MINUTE) {
    return res.status(429).json({ error: 'too_many_attempts' });
  }
  next();
}

// Ensure base schema and evolve columns safely
async function ensureSchema() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'user',
    force_password_change TINYINT DEFAULT 0,
    failed_login_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    banned TINYINT DEFAULT 0,
    last_login DATETIME NULL
  ) ENGINE=InnoDB`);

  await run(`CREATE TABLE IF NOT EXISTS leaderboard (
    user_id VARCHAR(36) NOT NULL,
    game VARCHAR(64) NOT NULL,
    score INT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (user_id, game),
    CONSTRAINT fk_leaderboard_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);
  try { await run('CREATE INDEX idx_leaderboard_game_score ON leaderboard (game, score DESC)'); } catch (_) {}

  await run(`CREATE TABLE IF NOT EXISTS blackjack_balance (
    user_id VARCHAR(36) PRIMARY KEY,
    balance INT NOT NULL DEFAULT 1000,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_blackjack_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);

  await run(`CREATE TABLE IF NOT EXISTS admin_audit (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_user_id VARCHAR(36) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_user_id VARCHAR(36),
    game VARCHAR(64),
    details TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`);

  // New audit logs table (generalized)
  await run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(36),
    actor_user_id VARCHAR(36),
    action VARCHAR(128) NOT NULL,
    target_type VARCHAR(64),
    target_id VARCHAR(64),
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_created (created_at)
  ) ENGINE=InnoDB`);

  // Game logs for per-action tracking and leaderboard derivation
  await run(`CREATE TABLE IF NOT EXISTS game_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(36) NOT NULL,
    game VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    amount_before INT,
    amount_after INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_game_logs_game_created (game, created_at),
    INDEX idx_game_logs_user (user_id),
    CONSTRAINT fk_gl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`);

  // Pages locking table
  await run(`CREATE TABLE IF NOT EXISTS pages (
    page_key VARCHAR(100) PRIMARY KEY,
    locked_for_members TINYINT NOT NULL DEFAULT 0,
    locked_message_en TEXT,
    locked_message_de TEXT,
    updated_at DATETIME NOT NULL
  ) ENGINE=InnoDB`);

  // Site/application settings (key-value)
  await run(`CREATE TABLE IF NOT EXISTS settings (
    key_name VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME NOT NULL
  ) ENGINE=InnoDB`);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

function setAuthCookie(res, token) {
  const cookieOpts = {
    httpOnly: true,
    sameSite: 'strict',
    secure: NODE_ENV !== 'development',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000, // ms
  };
  res.cookie('token', token, cookieOpts);
}

function authMiddleware(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  next();
}

async function logAdminAction({ adminId, action, targetUserId = null, game = null, details = null, req }) {
  const ip = (req?.ip || '').toString();
  const json = details ? JSON.stringify(details) : null;
  try {
    await run(
      'INSERT INTO admin_audit (admin_user_id, action, target_user_id, game, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [adminId, action, targetUserId, game, json, ip]
    );
  } catch (_) {
    // ignore logging failures
  }
}

// Lightweight admin SSE event hub
const adminEventClients = new Set();
function adminBroadcast(eventName, dataObj) {
  const payload = `event: ${eventName}\n` + `data: ${JSON.stringify(dataObj)}\n\n`;
  for (const res of adminEventClients) {
    try { res.write(payload); } catch (_) {}
  }
}

app.get('/api/admin/events', authMiddleware, adminOnly, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(': connected\n\n');
  adminEventClients.add(res);
  req.on('close', () => {
    adminEventClients.delete(res);
  });
});

// Health check with DB ping
app.get('/api/health', async (_req, res) => {
  try {
    await get('SELECT 1 as ok');
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(503).json({ error: 'db_unavailable' });
  }
});

// Auth routes
app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { email, username, name, password } = req.body || {};
    if (!email || !password || !username) return res.status(400).json({ error: 'missing_fields' });
    const normEmail = String(email).trim().toLowerCase();
    const normUsername = String(username).trim().toLowerCase();
    const existsEmail = await get('SELECT id FROM users WHERE email = ?', [normEmail]);
    const existsUsername = await get('SELECT id FROM users WHERE username = ?', [normUsername]);
    if (existsEmail || existsUsername) return res.status(409).json({ error: 'conflict' });
    const passwordHash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID?.() || String(Date.now());
    await run('INSERT INTO users (id, email, username, name, password_hash, created_at, role, force_password_change) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      id,
      normEmail,
      normUsername,
      name || username,
      passwordHash,
      new Date().toISOString(),
      'user',
      0,
    ]);
    const token = signToken({ id, name: name || username, username: normUsername, email: normEmail, role: 'user' });
    setAuthCookie(res, token);

    // Notify admin listeners
    adminBroadcast('user.registered', { id, email: normEmail, username: normUsername, name: name || username });

    return res.json({ id, name: name || username, username: normUsername, email: normEmail, role: 'user' });
  } catch (e) { next(e); }
});

app.post('/api/auth/login', rateLimitLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
    const normEmail = String(email).trim().toLowerCase();
    const user = await get('SELECT id, email, username, name, password_hash, role, failed_login_attempts, locked_until, force_password_change, banned FROM users WHERE email = ?', [normEmail]);
    // Always generic error to avoid user existence disclosure
    const genericError = () => res.status(401).json({ error: 'invalid_credentials' });
    if (!user) return genericError();

    if (user.banned) {
      return res.status(403).json({ error: 'banned' });
    }

    // Check lockout
    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return res.status(429).json({ error: 'too_many_attempts' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;
      if (attempts >= 10) {
        lockedUntil = new Date(Date.now() + 15 * 60_000).toISOString();
      }
      await run('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?', [attempts, lockedUntil, user.id]);
      return genericError();
    }

    await run('UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = ? WHERE id = ?', [new Date().toISOString(), user.id]);
    const token = signToken({ id: user.id, name: user.name, username: user.username, email: user.email, role: user.role || 'user', fpc: user.force_password_change ? 1 : 0 });
    setAuthCookie(res, token);
    return res.json({ id: user.id, name: user.name, username: user.username, email: user.email, role: user.role || 'user', forcePasswordChange: !!user.force_password_change });
  } catch (e) { next(e); }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/auth/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await get('SELECT id, email, username, name, role FROM users WHERE id = ?', [req.user.id]);
    return res.json(user);
  } catch (e) { next(e); }
});

// User blackjack balance endpoints
app.get('/api/blackjack/balance', authMiddleware, async (req, res, next) => {
  try {
    const row = await get('SELECT balance FROM blackjack_balance WHERE user_id = ?', [req.user.id]);
    if (!row) {
      await run('INSERT INTO blackjack_balance (user_id, balance, updated_at) VALUES (?, ?, ?)', [req.user.id, 1000, new Date().toISOString()]);
      return res.json({ balance: 1000 });
    }
    return res.json({ balance: row.balance });
  } catch (e) { next(e); }
});

app.post('/api/blackjack/balance', authMiddleware, async (req, res, next) => {
  try {
    const amount = parseInt(String(req.body?.balance ?? '0'), 10);
    if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000) {
      return res.status(400).json({ error: 'invalid_amount' });
    }
    await run('INSERT INTO blackjack_balance (user_id, balance, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = VALUES(balance), updated_at = VALUES(updated_at)', [req.user.id, amount, new Date().toISOString()]);
    return res.json({ success: true });
  } catch (e) { next(e); }
});

// User blackjack balance helpers
async function getOrCreateBalance(userId) {
  const row = await get('SELECT balance FROM blackjack_balance WHERE user_id = ?', [userId]);
  if (row) return row.balance;
  await run('INSERT INTO blackjack_balance (user_id, balance, updated_at) VALUES (?, ?, ?)', [userId, 1000, new Date().toISOString()]);
  return 1000;
}

// Leaderboard routes
app.get('/api/leaderboard', async (req, res, next) => {
  try {
    const { game } = req.query;
    const allowed = ['RiskPlay', 'HighRiskClicker', 'Blackjack', 'Tetris', 'Snake'];
    if (game && !allowed.includes(String(game))) return res.status(400).json({ error: 'invalid_game' });
    const params = [];
    let sql = `SELECT l.user_id as userId, u.name as name, u.username as username, u.role as role, l.game as game, l.score as score, l.updated_at as date
             FROM leaderboard l JOIN users u ON u.id = l.user_id`;
    if (game) { sql += ' WHERE l.game = ?'; params.push(String(game)); }
    sql += ' ORDER BY l.score DESC LIMIT 100';
    const rows = await all(sql, params);
    const entries = rows.map((r, idx) => ({ id: `${r.userId}-${r.game}`, userId: r.userId, name: r.name || r.username, game: r.game, score: r.score, date: r.date, isAdmin: (r.role === 'admin') }));
    return res.json(entries);
  } catch (e) { next(e); }
});

// Retry queue for score submissions if DB is down
const scoreRetryQueue = [];
const SCORE_QUEUE_TTL_MS = 5 * 60_000;
async function tryFlushScoreQueue() {
  try {
    await get('SELECT 1');
  } catch {
    return; // still down
  }
  const now = Date.now();
  while (scoreRetryQueue.length > 0) {
    const item = scoreRetryQueue[0];
    if (now - item.ts > SCORE_QUEUE_TTL_MS) {
      scoreRetryQueue.shift();
      continue;
    }
    try {
      await run('INSERT INTO leaderboard (user_id, game, score, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = GREATEST(score, VALUES(score)), updated_at = VALUES(updated_at)', [item.userId, item.game, item.score, item.date, item.date]);
    } catch {
      break;
    }
    scoreRetryQueue.shift();
  }
}
setInterval(tryFlushScoreQueue, 10_000);

app.post('/api/leaderboard', authMiddleware, async (req, res, next) => {
  try {
    const { game, score } = req.body || {};
    const allowed = ['RiskPlay', 'HighRiskClicker', 'Blackjack', 'Tetris', 'Snake'];
    if (!allowed.includes(game)) return res.status(400).json({ error: 'invalid_game' });
    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore <= 0) return res.status(400).json({ error: 'invalid_score' });

    try {
      const existing = await get('SELECT score FROM leaderboard WHERE user_id = ? AND game = ?', [req.user.id, game]);
      if (!existing) {
        await run('INSERT INTO leaderboard (user_id, game, score, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [
          req.user.id, game, numericScore, new Date().toISOString(), new Date().toISOString()
        ]);
      } else if (numericScore > existing.score) {
        await run('UPDATE leaderboard SET score = ?, updated_at = ? WHERE user_id = ? AND game = ?', [
          numericScore, new Date().toISOString(), req.user.id, game
        ]);
      }
      return res.json({ success: true });
    } catch (e) {
      // DB unavailable: queue and report
      scoreRetryQueue.push({ userId: req.user.id, game, score: numericScore, ts: Date.now() });
      return res.status(503).json({ error: 'db_unavailable' });
    }
  } catch (e) { next(e); }
});

// Alias: register
app.post('/api/register', async (req, res, next) => {
  try {
    const { email, username, name, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
    const derivedUsername = (username || String(email).split('@')[0] || '').trim().toLowerCase();
    const normEmail = String(email).trim().toLowerCase();
    const existsEmail = await get('SELECT id FROM users WHERE email = ?', [normEmail]);
    const existsUsername = await get('SELECT id FROM users WHERE username = ?', [derivedUsername]);
    if (existsEmail || existsUsername) return res.status(409).json({ error: 'conflict' });
    const passwordHash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID?.() || String(Date.now());
    await run('INSERT INTO users (id, email, username, name, password_hash, created_at, role, force_password_change) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      id,
      normEmail,
      derivedUsername,
      name || derivedUsername,
      passwordHash,
      new Date().toISOString(),
      'user',
      0,
    ]);
    const token = signToken({ id, name: name || derivedUsername, username: derivedUsername, email: normEmail, role: 'user' });
    setAuthCookie(res, token);
    return res.json({ id, name: name || derivedUsername, username: derivedUsername, email: normEmail, role: 'user' });
  } catch (e) { next(e); }
});

// Alias: login
app.post('/api/login', rateLimitLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
    const normEmail = String(email).trim().toLowerCase();
    const user = await get('SELECT id, email, username, name, password_hash, role, failed_login_attempts, locked_until, force_password_change, banned FROM users WHERE email = ?', [normEmail]);
    const genericError = () => res.status(401).json({ error: 'invalid_credentials' });
    if (!user) return genericError();
    if (user.banned) {
      return res.status(403).json({ error: 'banned' });
    }
    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return res.status(429).json({ error: 'too_many_attempts' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;
      if (attempts >= 10) {
        lockedUntil = new Date(Date.now() + 15 * 60_000).toISOString();
      }
      await run('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?', [attempts, lockedUntil, user.id]);
      return genericError();
    }
    await run('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);
    const token = signToken({ id: user.id, name: user.name, username: user.username, email: user.email, role: user.role || 'user', fpc: user.force_password_change ? 1 : 0 });
    setAuthCookie(res, token);
    return res.json({ id: user.id, name: user.name, username: user.username, email: user.email, role: user.role || 'user', forcePasswordChange: !!user.force_password_change });
  } catch (e) { next(e); }
});

// Alias: submit score
app.post('/api/score', authMiddleware, async (req, res, next) => {
  try {
    const { game, score } = req.body || {};
    const allowed = ['RiskPlay', 'HighRiskClicker', 'Blackjack', 'Tetris', 'Snake'];
    if (!allowed.includes(game)) return res.status(400).json({ error: 'invalid_game' });
    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore <= 0) return res.status(400).json({ error: 'invalid_score' });

    try {
      const existing = await get('SELECT score FROM leaderboard WHERE user_id = ? AND game = ?', [req.user.id, game]);
      if (!existing) {
        await run('INSERT INTO leaderboard (user_id, game, score, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [
          req.user.id, game, numericScore, new Date().toISOString(), new Date().toISOString()
        ]);
      } else if (numericScore > existing.score) {
        await run('UPDATE leaderboard SET score = ?, updated_at = ? WHERE user_id = ? AND game = ?', [
          numericScore, new Date().toISOString(), req.user.id, game
        ]);
      }
      return res.json({ success: true });
    } catch (e) {
      scoreRetryQueue.push({ userId: req.user.id, game, score: numericScore, ts: Date.now() });
      return res.status(503).json({ error: 'db_unavailable' });
    }
  } catch (e) { next(e); }
});

// GET /api/leaderboard/:game
app.get('/api/leaderboard/:game', async (req, res, next) => {
  try {
    const game = String(req.params.game);
    const allowed = ['RiskPlay', 'HighRiskClicker', 'Blackjack', 'Tetris', 'Snake'];
    if (!allowed.includes(game)) return res.status(400).json({ error: 'invalid_game' });
    const rows = await all(
      `SELECT l.user_id as userId, u.name as name, u.username as username, l.game as game, l.score as score, l.updated_at as date
      FROM leaderboard l JOIN users u ON u.id = l.user_id
      WHERE l.game = ?
      ORDER BY l.score DESC LIMIT 100`,
      [game]
    );
    const entries = rows.map((r) => ({ id: `${r.userId}-${r.game}`, userId: r.userId, name: r.name || r.username, game: r.game, score: r.score, date: r.date }));
    return res.json(entries);
  } catch (e) { next(e); }
});

// Admin routes (JWT + role: admin)
app.post('/api/admin/leaderboard/set', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { userId, game, score } = req.body || {};
    if (!userId || !game || typeof score === 'undefined') return res.status(400).json({ error: 'missing_fields' });
    const numericScore = Number(score);
    const allowed = ['RiskPlay', 'HighRiskClicker', 'Blackjack', 'Tetris', 'Snake'];
    if (!allowed.includes(game)) return res.status(400).json({ error: 'invalid_game' });
    const existing = await get('SELECT score FROM leaderboard WHERE user_id = ? AND game = ?', [userId, game]);
    if (!existing) {
      await run('INSERT INTO leaderboard (user_id, game, score, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [
        userId, game, numericScore, new Date().toISOString(), new Date().toISOString()
      ]);
    } else {
      await run('UPDATE leaderboard SET score = ?, updated_at = ? WHERE user_id = ? AND game = ?', [
        numericScore, new Date().toISOString(), userId, game
      ]);
    }
    await logAdminAction({ adminId: req.user.id, action: 'leaderboard.set', targetUserId: userId, game, details: { score: numericScore }, req });
    return res.json({ success: true });
  } catch (e) { next(e); }
});

app.post('/api/admin/leaderboard/remove', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { userId, game } = req.body || {};
    if (!userId || !game) return res.status(400).json({ error: 'missing_fields' });
    await run('DELETE FROM leaderboard WHERE user_id = ? AND game = ?', [userId, game]);
    await logAdminAction({ adminId: req.user.id, action: 'leaderboard.remove', targetUserId: userId, game, details: null, req });
    return res.json({ success: true });
  } catch (e) { next(e); }
});

app.post('/api/admin/blackjack/set_balance', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { userId, amount } = req.body || {};
    if (!userId || typeof amount === 'undefined') return res.status(400).json({ error: 'missing_fields' });
    const numeric = Math.max(0, Math.floor(Number(amount)));
    await getOrCreateBalance(userId);
    await run('UPDATE blackjack_balance SET balance = ?, updated_at = ? WHERE user_id = ?', [numeric, new Date().toISOString(), userId]);
    await logAdminAction({ adminId: req.user.id, action: 'blackjack.set_balance', targetUserId: userId, game: 'Blackjack', details: { amount: numeric }, req });
    return res.json({ success: true });
  } catch (e) { next(e); }
});



// New: Admin users listing with pagination and filtering, consistent JSON
app.get('/api/admin/users', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize || '25'), 10)));
    const offset = (page - 1) * pageSize;

    const params = [];
    let where = '';
    if (q) {
      where = 'WHERE username LIKE ? OR email LIKE ? OR id LIKE ?';
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    const countRow = await get(`SELECT COUNT(*) as cnt FROM users ${where}`, params);
    const rows = await all(
      `SELECT u.id, u.username, u.name, u.email, u.role, u.created_at, u.last_login, u.banned,
              COALESCE(gl.cnt, 0) as total_games
       FROM users u
       LEFT JOIN (
         SELECT user_id, COUNT(*) as cnt FROM game_logs GROUP BY user_id
       ) gl ON gl.user_id = u.id
       ${where ? where.replaceAll('username', 'u.username').replaceAll('email', 'u.email').replaceAll('id', 'u.id') : ''}
       ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({ success: true, data: { users: rows, pagination: { page, pageSize, total: countRow?.cnt || 0 } } });
  } catch (e) { next(e); }
});

// User select-list for dropdowns
app.get('/api/admin/users/select-list', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().toLowerCase();
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const like = `%${q}%`;
    const isNumericPrefix = /^[a-z0-9\-]+$/.test(q);
    const rows = await all(
      `SELECT id, username, role, banned FROM users
       WHERE ${q ? '(LOWER(username) LIKE ? OR ' + (isNumericPrefix ? 'id LIKE ?' : '0') + ')' : '1=1'}
       ORDER BY created_at DESC LIMIT ?`,
      q ? (isNumericPrefix ? [like, `${q}%`, limit] : [like, limit]) : [limit]
    );
    const data = rows.map(r => ({ id: r.id, username: r.username, displayName: `${r.id} | ${r.username}`, role: r.role, banned: !!r.banned }));
    return res.json(data);
  } catch (e) { next(e); }
});

// RESTful admin user update and ban
app.put('/api/admin/users/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const userId = String(req.params.id);
    const { username, email } = req.body || {};
    if (!username && !email) return res.status(400).json({ error: 'no_changes' });

    if (username) {
      const normUsername = String(username).trim().toLowerCase();
      const exists = await get('SELECT id FROM users WHERE username = ? AND id <> ?', [normUsername, userId]);
      if (exists) return res.status(409).json({ error: 'username_taken' });
      await run('UPDATE users SET username = ? WHERE id = ?', [normUsername, userId]);
    }
    if (email) {
      const normEmail = String(email).trim().toLowerCase();
      const exists = await get('SELECT id FROM users WHERE email = ? AND id <> ?', [normEmail, userId]);
      if (exists) return res.status(409).json({ error: 'email_taken' });
      await run('UPDATE users SET email = ? WHERE id = ?', [normEmail, userId]);
    }
    const updated = await get('SELECT id, username, email, role, banned, created_at, last_login FROM users WHERE id = ?', [userId]);
    await logAdminAction({ adminId: req.user.id, action: 'user.update', targetUserId: userId, details: { username: !!username, email: !!email }, req });
    return res.json(updated);
  } catch (e) { next(e); }
});

app.post('/api/admin/users/:id/ban', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const userId = String(req.params.id);
    let banned = req.body?.banned;
    if (typeof banned === 'undefined') {
      const row = await get('SELECT banned FROM users WHERE id = ?', [userId]);
      banned = row ? !row.banned : true;
    }
    const numeric = banned ? 1 : 0;
    await run('UPDATE users SET banned = ? WHERE id = ?', [numeric, userId]);
    const updated = await get('SELECT id, username, email, role, banned, created_at, last_login FROM users WHERE id = ?', [userId]);
    await logAdminAction({ adminId: req.user.id, action: banned ? 'user.ban' : 'user.unban', targetUserId: userId, details: { banned: !!banned }, req });
    return res.json(updated);
  } catch (e) { next(e); }
});

// Backwards compatible endpoints
app.post('/api/admin/users/ban', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { userId, banned } = req.body || {};
    if (!userId || typeof banned === 'undefined') return res.status(400).json({ error: 'missing_fields' });
    const numeric = banned ? 1 : 0;
    await run('UPDATE users SET banned = ? WHERE id = ?', [numeric, userId]);
    await logAdminAction({ adminId: req.user.id, action: banned ? 'user.ban' : 'user.unban', targetUserId: userId, details: { banned: !!banned }, req });
    return res.json({ success: true });
  } catch (e) { next(e); }
});

// Games config and logs
app.get('/api/admin/games', authMiddleware, adminOnly, async (_req, res, next) => {
  try {
    // Derive enabled flags from settings key enabledGames; default all true when absent
    const row = await get('SELECT value FROM settings WHERE key_name = ?', ['enabledGames']);
    let enabled = { RiskPlay: true, HighRiskClicker: true, Blackjack: true, Tetris: true, Snake: true };
    if (row?.value) {
      try { enabled = JSON.parse(row.value); } catch {}
    }
    const games = Object.keys(enabled).map((k) => ({ key: k, enabled: !!enabled[k] }));
    return res.json(games);
  } catch (e) { next(e); }
});

app.get('/api/admin/games/:game/logs', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const game = String(req.params.game);
    const { userId, dateFrom, dateTo, limit = '50', offset = '0' } = req.query || {};
    const params = [game];
    let where = 'WHERE game = ?';
    if (userId) { where += ' AND user_id = ?'; params.push(String(userId)); }
    if (dateFrom) { where += ' AND created_at >= ?'; params.push(String(dateFrom)); }
    if (dateTo) { where += ' AND created_at <= ?'; params.push(String(dateTo)); }
    const lim = Math.min(200, Math.max(1, parseInt(String(limit), 10)));
    const off = Math.max(0, parseInt(String(offset), 10));
    const rows = await all(`SELECT * FROM game_logs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, lim, off]);
    return res.json({ logs: rows });
  } catch (e) { next(e); }
});

app.delete('/api/admin/games/:game/logs/:logId', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { game, logId } = req.params;
    await run('DELETE FROM game_logs WHERE id = ? AND game = ?', [parseInt(String(logId), 10), String(game)]);
    await logAdminAction({ adminId: req.user.id, action: 'game_logs.delete', game, details: { logId: Number(logId) }, req });
    return res.json({ success: true });
  } catch (e) { next(e); }
});

app.delete('/api/admin/games/:game/logs', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { game } = req.params;
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'missing_ids' });
    const inClause = ids.map(() => '?').join(',');
    await run(`DELETE FROM game_logs WHERE game = ? AND id IN (${inClause})`, [String(game), ...ids.map((x) => Number(x))]);
    await logAdminAction({ adminId: req.user.id, action: 'game_logs.bulk_delete', game, details: { count: ids.length }, req });
    return res.json({ success: true });
  } catch (e) { next(e); }
});

// Make blackjack admin balance endpoint a no-op per requirement
app.post('/api/admin/blackjack/set_balance', authMiddleware, adminOnly, async (_req, res) => {
  return res.status(400).json({ error: 'operation_disabled' });
});

// Public leaderboard per spec (best_balance aliasing existing score column)
app.get('/api/public/leaderboard', async (req, res, next) => {
  try {
    const game = String(req.query.game || 'Blackjack');
    const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit || '50'), 10)));
    const rows = await all(
      `SELECT l.user_id as userId, u.username as username, u.role as role, l.game as game, l.score as best_balance, l.updated_at as last_seen_at
       FROM leaderboard l JOIN users u ON u.id = l.user_id
       WHERE l.game = ?
       ORDER BY l.score DESC LIMIT ?`,
      [game, limit]
    );
    const data = rows.map(r => ({ userId: r.userId, username: r.username, best_balance: r.best_balance, last_seen_at: r.last_seen_at, isAdmin: r.role === 'admin' }));
    return res.json(data);
  } catch (e) { next(e); }
});

// New audit endpoint with joins and filters
app.get('/api/admin/audit', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { q = '', userId = '', action = '', dateFrom = '', dateTo = '', limit = '100', offset = '0' } = req.query || {};
    const params = [];
    let where = 'WHERE 1=1';
    if (q) { where += ' AND (a.action LIKE ? OR u.username LIKE ? OR au.username LIKE ?)'; const like = `%${q}%`; params.push(like, like, like); }
    if (userId) { where += ' AND (a.user_id = ? OR a.actor_user_id = ?)'; params.push(String(userId), String(userId)); }
    if (action) { where += ' AND a.action = ?'; params.push(String(action)); }
    if (dateFrom) { where += ' AND a.created_at >= ?'; params.push(String(dateFrom)); }
    if (dateTo) { where += ' AND a.created_at <= ?'; params.push(String(dateTo)); }
    const lim = Math.min(500, Math.max(1, parseInt(String(limit), 10)));
    const off = Math.max(0, parseInt(String(offset), 10));
    const rows = await all(
      `SELECT a.*, u.username as target_username, au.username as actor_username
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.user_id
       LEFT JOIN users au ON au.id = a.actor_user_id
       ${where}
       ORDER BY a.id DESC LIMIT ? OFFSET ?`,
      [...params, lim, off]
    );
    return res.json(rows);
  } catch (e) { next(e); }
});

// Pages lock admin endpoints
app.get('/api/admin/settings/pages', authMiddleware, adminOnly, async (_req, res, next) => {
  try {
    const rows = await all('SELECT page_key as pageKey, locked_for_members as lockedForMembers, locked_message_en as lockedMessageEn, locked_message_de as lockedMessageDe, updated_at as updatedAt FROM pages', []);
    return res.json(rows);
  } catch (e) { next(e); }
});

app.put('/api/admin/settings/pages/:pageKey', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const pageKey = String(req.params.pageKey);
    const { lockedForMembers = false, lockedMessageEn = '', lockedMessageDe = '' } = req.body || {};
    const now = new Date().toISOString();
    await run(
      `INSERT INTO pages (page_key, locked_for_members, locked_message_en, locked_message_de, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE locked_for_members = VALUES(locked_for_members), locked_message_en = VALUES(locked_message_en), locked_message_de = VALUES(locked_message_de), updated_at = VALUES(updated_at)`,
      [pageKey, lockedForMembers ? 1 : 0, lockedMessageEn, lockedMessageDe, now]
    );
    await logAdminAction({ adminId: req.user.id, action: 'pages.lock_update', details: { pageKey, lockedForMembers }, req });
    return res.json({ success: true });
  } catch (e) { next(e); }
});

// Public page status
app.get('/api/public/page-status/:pageKey', async (req, res, next) => {
  try {
    const pageKey = String(req.params.pageKey);
    const row = await get('SELECT page_key as pageKey, locked_for_members as lockedForMembers, locked_message_en as lockedMessageEn, locked_message_de as lockedMessageDe FROM pages WHERE page_key = ?', [pageKey]);
    return res.json(row || { pageKey, lockedForMembers: false, lockedMessageEn: '', lockedMessageDe: '' });
  } catch (e) { next(e); }
});

// Public contact via nodemailer, with audit log
app.post('/api/public/contact', async (req, res, next) => {
  try {
    const { name = '', email = '', message = '' } = req.body || {};
    if (!email || !message) return res.status(400).json({ success: false, error: 'missing_fields' });

    const host = process.env.SMTP_HOST;
    const port = parseInt(String(process.env.SMTP_PORT || '587'), 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = String(process.env.SMTP_SECURE || 'false') === 'true';

    const transporter = nodemailer.createTransport({ host, port, secure, auth: user && pass ? { user, pass } : undefined });

    const to = process.env.CONTACT_TO || user || 'test@example.com';
    const info = await transporter.sendMail({
      from: process.env.CONTACT_FROM || user || 'no-reply@localhost',
      to,
      subject: `[Nurvio Hub] Contact from ${name || email}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    // Audit (guest actor is null)
    await run('INSERT INTO audit_logs (user_id, actor_user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)', [null, null, 'public.contact', 'contact', null, JSON.stringify({ name, email, message, messageId: info?.messageId || null })]);

    return res.json({ success: true });
  } catch (e) {
    try {
      await run('INSERT INTO audit_logs (user_id, actor_user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)', [null, null, 'public.contact.error', 'contact', null, JSON.stringify({ error: String(e?.message || e) })]);
    } catch {}
    return res.status(500).json({ success: false, error: 'send_failed' });
  }
});

// Helper to record a game event and update leaderboard best balance
async function recordGameEvent({ userId, game, action, amountBefore = null, amountAfter = null }) {
  await run('INSERT INTO game_logs (user_id, game, action, amount_before, amount_after) VALUES (?, ?, ?, ?, ?)', [userId, game, action, amountBefore, amountAfter]);
  if (typeof amountAfter === 'number') {
    const existing = await get('SELECT score FROM leaderboard WHERE user_id = ? AND game = ?', [userId, game]);
    if (!existing) {
      await run('INSERT INTO leaderboard (user_id, game, score, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [userId, game, amountAfter, new Date().toISOString(), new Date().toISOString()]);
    } else if (amountAfter > existing.score) {
      await run('UPDATE leaderboard SET score = ?, updated_at = ? WHERE user_id = ? AND game = ?', [amountAfter, new Date().toISOString(), userId, game]);
    }
  }
}

// New: Admin dashboard stats
app.get('/api/admin/stats', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const usersCountRow = await get('SELECT COUNT(*) as c FROM users', []);
    const bannedCountRow = await get('SELECT COUNT(*) as c FROM users WHERE banned = 1', []);
    const lbCountRow = await get('SELECT COUNT(*) as c FROM leaderboard', []);
    const gamesDistinct = await all('SELECT DISTINCT game FROM leaderboard', []);
    const balancesCountRow = await get('SELECT COUNT(*) as c FROM blackjack_balance', []);
    return res.json({ success: true, data: {
      users: usersCountRow?.c || 0,
      bannedUsers: bannedCountRow?.c || 0,
      leaderboardEntries: lbCountRow?.c || 0,
      gamesTracked: gamesDistinct.map(r => r.game),
      blackjackBalances: balancesCountRow?.c || 0,
    }});
  } catch (e) { next(e); }
});

// Global error handler to convert DB outages to 503
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({ error: 'server_error' });
});

// Boot
ensureSchema()
  .catch((err) => {
    console.error('Schema setup failed', err);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on :${PORT}`);
    });
  });
