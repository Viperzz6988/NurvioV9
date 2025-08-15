import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { run, get, all } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DATABASE_URL = process.env.DATABASE_URL || '';
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
    locked_until DATETIME NULL
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
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  const cookieOpts = {
    httpOnly: true,
    sameSite: 'strict',
    secure: NODE_ENV !== 'development',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // seconds
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
    return res.json({ id, name: name || username, username: normUsername, email: normEmail, role: 'user' });
  } catch (e) { next(e); }
});

app.post('/api/auth/login', rateLimitLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
    const normEmail = String(email).trim().toLowerCase();
    const user = await get('SELECT id, email, username, name, password_hash, role, failed_login_attempts, locked_until, force_password_change FROM users WHERE email = ?', [normEmail]);
    // Always generic error to avoid user existence disclosure
    const genericError = () => res.status(401).json({ error: 'invalid_credentials' });
    if (!user) return genericError();

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

    await run('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);
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
    let sql = `SELECT l.user_id as userId, u.name as name, u.username as username, l.game as game, l.score as score, l.updated_at as date
             FROM leaderboard l JOIN users u ON u.id = l.user_id`;
    if (game) { sql += ' WHERE l.game = ?'; params.push(String(game)); }
    sql += ' ORDER BY l.score DESC LIMIT 100';
    const rows = await all(sql, params);
    const entries = rows.map((r, idx) => ({ id: `${r.userId}-${r.game}`, userId: r.userId, name: r.name || r.username, game: r.game, score: r.score, date: r.date }));
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
    if (now - item.ts > SCORE_QUEUE_TTL_MS) { scoreRetryQueue.shift(); continue; }
    try {
      const existing = await get('SELECT score FROM leaderboard WHERE user_id = ? AND game = ?', [item.userId, item.game]);
      if (!existing) {
        await run('INSERT INTO leaderboard (user_id, game, score, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [
          item.userId, item.game, item.score, new Date().toISOString(), new Date().toISOString()
        ]);
      } else if (item.score > existing.score) {
        await run('UPDATE leaderboard SET score = ?, updated_at = ? WHERE user_id = ? AND game = ?', [
          item.score, new Date().toISOString(), item.userId, item.game
        ]);
      }
      scoreRetryQueue.shift();
    } catch {
      break; // stop, likely down again
    }
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
      return res.json({ ok: true });
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
    const user = await get('SELECT id, email, username, name, password_hash, role, failed_login_attempts, locked_until, force_password_change FROM users WHERE email = ?', [normEmail]);
    const genericError = () => res.status(401).json({ error: 'invalid_credentials' });
    if (!user) return genericError();
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
      return res.json({ ok: true });
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
    return res.json({ ok: true });
  } catch (e) { next(e); }
});

app.post('/api/admin/leaderboard/remove', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { userId, game } = req.body || {};
    if (!userId || !game) return res.status(400).json({ error: 'missing_fields' });
    await run('DELETE FROM leaderboard WHERE user_id = ? AND game = ?', [userId, game]);
    await logAdminAction({ adminId: req.user.id, action: 'leaderboard.remove', targetUserId: userId, game, details: null, req });
    return res.json({ ok: true });
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
    return res.json({ ok: true });
  } catch (e) { next(e); }
});

app.get('/api/admin/audit', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { adminId, game, action, limit = 100 } = req.query || {};
    const params = [];
    let sql = 'SELECT * FROM admin_audit WHERE 1=1';
    if (adminId) { sql += ' AND admin_user_id = ?'; params.push(String(adminId)); }
    if (game) { sql += ' AND game = ?'; params.push(String(game)); }
    if (action) { sql += ' AND action = ?'; params.push(String(action)); }
    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(Math.min(500, Number(limit) || 100));
    const rows = await all(sql, params);
    return res.json(rows.map(r => ({ ...r, details: r.details ? JSON.parse(r.details) : null })));
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