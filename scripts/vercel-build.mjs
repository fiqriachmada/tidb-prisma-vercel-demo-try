/**
 * Vercel build helper (cross-platform Node.js replacement for bash `export` trick).
 *
 * Priority for DATABASE_URL:
 *  1. TIDB_USER + TIDB_HOST + TIDB_PORT env vars (Vercel recommended for TiDB Cloud)
 *  2. DATABASE_URL env var (already a full mysql:// URL)
 *  3. .env file via dotenv (local development fallback)
 */
import { execSync } from 'child_process';
import { createRequire } from 'module';

// Load .env file if present (local dev) — on Vercel these come from the dashboard
const require = createRequire(import.meta.url);
try {
  const dotenv = require('dotenv');
  dotenv.config();
} catch {
  // dotenv may not be available in all environments — OK
}

const {
  TIDB_USER,
  TIDB_PASSWORD,
  TIDB_HOST,
  TIDB_PORT,
  TIDB_DB_NAME = 'tidb_labs_bookshop',
  DATABASE_URL,
} = process.env;

const SSL_FLAGS = 'pool_timeout=60&sslaccept=accept_invalid_certs';

let resolvedURL = null;

if (TIDB_USER && TIDB_HOST && TIDB_PORT) {
  resolvedURL = `mysql://${TIDB_USER}:${TIDB_PASSWORD}@${TIDB_HOST}:${TIDB_PORT}/${TIDB_DB_NAME}?${SSL_FLAGS}`;
  console.log(`✓ Using TIDB_* env vars (host: ${TIDB_HOST})`);
} else if (DATABASE_URL) {
  // Append SSL flags only if not already present
  resolvedURL = DATABASE_URL.includes('sslaccept')
    ? DATABASE_URL
    : `${DATABASE_URL}?${SSL_FLAGS}`;
  console.log(`✓ Using DATABASE_URL`);
} else {
  console.error(`
❌  No database connection configured for Vercel build.

    Please add one of these to your Vercel project's Environment Variables:

    Option A — Direct URL:
      DATABASE_URL = mysql://<user>:<pass>@<host>:<port>/<db>

    Option B — Individual vars:
      TIDB_USER, TIDB_PASSWORD, TIDB_HOST, TIDB_PORT, TIDB_DB_NAME

    Also required for NextAuth:
      NEXTAUTH_URL    = https://<your-app>.vercel.app
      NEXTAUTH_SECRET = <random-secret-string>
  `);
  process.exit(1);
}

// Inject into this process — all execSync calls below will inherit it
process.env.DATABASE_URL = resolvedURL;

function run(cmd) {
  console.log(`\n▶  ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

// Build pipeline
run('npx prisma generate');
run('npx prisma migrate deploy');
run('node --experimental-json-modules ./scripts/setup.mjs');
run('npx next build');
