import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { run, get } from './db.js';

async function main() {
  // Ensure base schema exists (idempotent)
  await run(`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'user',
    force_password_change TINYINT DEFAULT 0
  ) ENGINE=InnoDB`);

  const admin1Email = process.env.ADMIN1_EMAIL;
  const admin1Pw = process.env.ADMIN1_PW;
  const admin2Email = process.env.ADMIN2_EMAIL;
  const admin2Pw = process.env.ADMIN2_PW;

  let useDefaults = true; // In MySQL version, defaults are allowed for development out of the box

  const admins = [
    { email: admin1Email || 'orange.admin@nurvio.de', password: admin1Pw || 'Root.Orange!', username: 'orange.admin', name: 'Orange Admin' },
    { email: admin2Email || 'vez.admin@nurvio.de', password: admin2Pw || 'Root.Vez!', username: 'vez.admin', name: 'Vez Admin' },
  ];

  for (const a of admins) {
    const exists = await get('SELECT id FROM users WHERE email = ?', [a.email.toLowerCase()]);
    if (exists) {
      console.log(`Admin already exists: ${a.email}`);
      continue;
    }
    const id = crypto.randomUUID?.() || String(Date.now());
    const hash = await bcrypt.hash(a.password, 12);
    await run('INSERT INTO users (id, email, username, name, password_hash, created_at, role, force_password_change) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      id,
      a.email.toLowerCase(),
      a.username.toLowerCase(),
      a.name,
      hash,
      new Date().toISOString(),
      'admin',
      useDefaults ? 1 : 0,
    ]);
    console.log(`Created admin: ${a.email}`);
  }

  console.log('Seed complete.');
}

main().catch((e) => { console.error(e); process.exit(1); });