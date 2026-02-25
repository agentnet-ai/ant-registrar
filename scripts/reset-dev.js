#!/usr/bin/env node
require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_NAME || !DB_NAME.includes('registrar')) {
  console.error(`ABORT: DB_NAME="${DB_NAME}" does not look like a registrar database.`);
  process.exit(1);
}

const sqlFile = path.join(__dirname, 'reset-dev.sql');
const cmd = `mysql -h ${DB_HOST} -P ${DB_PORT || 3306} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < "${sqlFile}"`;

console.log(`[reset:dev] Resetting ${DB_NAME} on ${DB_HOST}:${DB_PORT || 3306} ...`);

try {
  execSync(cmd, { stdio: 'inherit' });
} catch (err) {
  console.error('[reset:dev] SQL execution failed:', err.message);
  process.exit(1);
}

// Verification queries
const verify = [
  "SELECT 'owners' AS tbl, COUNT(*) AS cnt FROM owners",
  "SELECT 'owner_aliases' AS tbl, COUNT(*) AS cnt FROM owner_aliases",
  "SELECT 'nodes' AS tbl, COUNT(*) AS cnt FROM nodes",
  "SELECT 'audit_log' AS tbl, COUNT(*) AS cnt FROM audit_log",
  "SELECT owner_id, owner_slug, status FROM owners",
].join('; ');

console.log('\n[reset:dev] Verification:');
try {
  execSync(
    `mysql -h ${DB_HOST} -P ${DB_PORT || 3306} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} -e "${verify}"`,
    { stdio: 'inherit' },
  );
} catch { /* non-fatal */ }

console.log('\n[reset:dev] ant-registrar reset complete.');
