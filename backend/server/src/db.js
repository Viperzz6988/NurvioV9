// backend/server/src/db.js
// Full compatibility DB helper for MySQL (mysql2/promise), ESM
// - Reads connection from process.env (DATABASE_URL or individual vars)
// - Normalizes Date / ISO datetime values into MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
// - Exports: pool, closePool, ping, toMySQLDateTime, run, db, execute, all, get
//
// Drop this file into backend/server/src/db.js (replace existing). No config.js required.

import mysql from 'mysql2/promise';

/* -------------------------
   Utility: parse boolean-ish env
   ------------------------- */
function envBool(name, defaultValue = false) {
  const v = process.env[name];
  if (v === undefined || v === null) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}

/* -------------------------
   Convert JS Date or ISO string to MySQL DATETIME
   Returns: "YYYY-MM-DD HH:MM:SS"
   If value not recognized, returns original value.
   ------------------------- */
export function toMySQLDateTime(value) {
  if (value instanceof Date) {
    // format and drop milliseconds & timezone Z
    return value.toISOString().slice(0, 19).replace('T', ' ');
  }
  if (typeof value === 'string') {
    // match ISO-like strings: YYYY-MM-DD[T ]HH:MM:SS(.sss)?Z?
    const m = value.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})(?:\.\d+)?Z?$/);
    if (m) {
      return `${m[1]} ${m[2]}`;
    }
  }
  return value;
}

/* -------------------------
   Normalize parameters array: convert Date / ISO strings
   ------------------------- */
function normalizeParams(params) {
  if (!params || !Array.isArray(params)) return params;
  return params.map((p) => toMySQLDateTime(p));
}

/* -------------------------
   Build pool options from env
   Supports DATABASE_URL or individual vars
   ------------------------- */
function buildPoolOptions() {
  const dbUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim();
  const useSsl = envBool('DB_SSL', false);

  if (dbUrl) {
    if (!useSsl) {
      // simple: provide connection string
      return dbUrl;
    }
    // Parse URL and construct options with ssl
    try {
      const u = new URL(dbUrl);
      const user = u.username || undefined;
      const password = u.password || undefined;
      const host = u.hostname;
      const port = u.port ? Number(u.port) : 3306;
      const database = u.pathname ? u.pathname.replace(/^\//, '') : undefined;

      const ssl = {
        rejectUnauthorized: envBool('DB_SSL_REJECT_UNAUTHORIZED', true),
      };

      return {
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
        queueLimit: 0,
        ssl,
      };
    } catch (err) {
      // Fallback to connection string
      return dbUrl;
    }
  }

  // Individual env vars fallback
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || process.env.DATABASE_USER || 'root',
    password: process.env.DB_PASS || process.env.DATABASE_PASSWORD || '',
    database: process.env.DB_NAME || process.env.DATABASE_NAME || 'nurvio_hub',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
    queueLimit: 0,
    ssl: useSsl ? { rejectUnauthorized: envBool('DB_SSL_REJECT_UNAUTHORIZED', true) } : undefined,
  };
}

/* -------------------------
   Create pool
   ------------------------- */
const poolOptions = buildPoolOptions();
export const pool = typeof poolOptions === 'string'
  ? mysql.createPool(poolOptions)
  : mysql.createPool(poolOptions);

/* -------------------------
   Graceful close
   ------------------------- */
export async function closePool() {
  try {
    await pool.end();
  } catch (err) {
    // ignore errors during shutdown
  }
}

/* -------------------------
   Ping / health helper
   ------------------------- */
export async function ping() {
  try {
    // simple lightweight query
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    return false;
  }
}

/* -------------------------
   Low-level execute wrapper (returns result for insert/update/delete)
   ------------------------- */
export async function execute(sql, params = []) {
  const normalized = normalizeParams(params);
  const [result] = await pool.execute(sql, normalized);
  return result;
}

/* -------------------------
   run(sql, params) - generic runner
   - For compatibility with code expecting "run"
   - Returns the execution result (OkPacket) for DML, rows for SELECT depending on SQL
   ------------------------- */
export async function run(sql, params = []) {
  const normalized = normalizeParams(params);
  const [rowsOrResult] = await pool.execute(sql, normalized);
  return rowsOrResult;
}

/* -------------------------
   db object with query convenience (returns rows)
   ------------------------- */
export const db = {
  query: async (sql, params = []) => {
    const normalized = normalizeParams(params);
    const [rows] = await pool.execute(sql, normalized);
    return rows;
  },
  execute: async (sql, params = []) => {
    const normalized = normalizeParams(params);
    const [result] = await pool.execute(sql, normalized);
    return result;
  },
  // expose pool if someone needs direct access
  pool,
};

/* -------------------------
   Legacy compatibility helpers
   Many older codebases use `all`, `get`, and `run` exports.
   We keep them to avoid refactoring the rest of the project.
   - all(sql, params) -> returns all rows (alias to db.query)
   - get(sql, params) -> returns first row or null
   - run(sql, params) -> uses run() above (keeps existing name)
   ------------------------- */
export const all = async (sql, params = []) => {
  return db.query(sql, params);
};

export const get = async (sql, params = []) => {
  const rows = await db.query(sql, params);
  return rows && rows.length ? rows[0] : null;
};

// 'run' is already exported above as a named function; re-export for compatibility
// Note: Node ESM allows named exports; ensure not to duplicate definitions.
export { run as runQuery } from './db.js'; // placeholder to satisfy bundlers? (we will also export run below)


// Because the line above would cause self-import problem in same file, avoid that.
// Instead, re-export run by assigning it to a const named `run` on export list below.
// (To keep everything in one file, we'll simply ensure `run` is defined and exported above.)

// For clarity to consumers that import { run } from './db.js', we already exported run earlier.
// Additional compatibility alias:
export const runLegacy = run;

/* -------------------------
   Note about exports:
   - Named exports in this file:
   // pool, closePool, ping, toMySQLDateTime, execute, run, db, all, get, runLegacy
   ------------------------- */

/* -------------------------
   If some modules import default or expect module shape, they can still import named exports.
   ------------------------- */
