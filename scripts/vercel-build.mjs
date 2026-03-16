/**
 * Vercel build helper: sets DATABASE_URL from TiDB env vars then kicks off
 * the actual build pipeline (migrate → setup → next build).
 *
 * This replaces the bash `export DATABASE_URL=$(node ./scripts/env.mjs) && ...`
 * which does not work reliably in all CI environments.
 */
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const {
  TIDB_USER,
  TIDB_PASSWORD,
  TIDB_HOST,
  TIDB_PORT,
  TIDB_DB_NAME = 'bookshop',
  DATABASE_URL,
} = process.env;

const SSL_FLAGS = 'pool_timeout=60&sslaccept=accept_invalid_certs';

const resolvedURL =
  TIDB_USER && TIDB_HOST && TIDB_PORT
    ? `mysql://${TIDB_USER}:${TIDB_PASSWORD}@${TIDB_HOST}:${TIDB_PORT}/${TIDB_DB_NAME}?${SSL_FLAGS}`
    : DATABASE_URL
    ? `${DATABASE_URL}?${SSL_FLAGS}`
    : null;

if (!resolvedURL) {
  console.error(
    '❌  No database URL found. Set DATABASE_URL or TIDB_USER/TIDB_HOST/TIDB_PORT env vars.'
  );
  process.exit(1);
}

// Inject into this process so child commands inherit it
process.env.DATABASE_URL = resolvedURL;

function run(cmd) {
  console.log(`\n▶ ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

run('npx prisma generate');
run('npx prisma migrate deploy');
run(`node --experimental-json-modules ./scripts/setup.mjs`);
run('npx next build');
