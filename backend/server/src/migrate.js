import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { get, run, all } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.resolve(projectRoot, 'database', 'migrations');

async function ensureMigrationsTable() {
	await run(`CREATE TABLE IF NOT EXISTS _migrations (
		id VARCHAR(255) PRIMARY KEY,
		applied_at DATETIME NOT NULL
	) ENGINE=InnoDB`);
}

async function hasMigration(id) {
	const row = await get('SELECT id FROM _migrations WHERE id = ?', [id]);
	return !!row;
}

async function applyMigrations() {
	if (!fs.existsSync(migrationsDir)) {
		console.log('No migrations directory found. Skipping.');
		process.exit(0);
	}

	await ensureMigrationsTable();
	const files = fs.readdirSync(migrationsDir)
		.filter((f) => f.endsWith('.sql'))
		.sort();

	for (const file of files) {
		const id = file;
		if (await hasMigration(id)) continue;
		const sql = fs.readFileSync(path.resolve(migrationsDir, file), 'utf-8');
		console.log(`Applying migration ${file}...`);
		// Split on ; but keep it simple: execute as one statement batch if single statement per file
		await run(sql);
		await run('INSERT INTO _migrations (id, applied_at) VALUES (?, ?)', [id, new Date()]);
	}
	console.log('Migrations complete.');
	process.exit(0);
}

applyMigrations().catch((err) => {
	console.error(err);
	process.exit(1);
});