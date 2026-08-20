/*
 * Copyright (c) 2026 Ryan P. Walsh
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Noncommercial use is free; commercial use requires a separate
 * license from the author. See LICENSE.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const sqlPath = path.join(__dirname, 'sql', '001_init.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const client = new Client({ connectionString: DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('Migrations applied successfully.');
} catch (e) {
  await client.query('ROLLBACK');
  console.error('Migration failed:', e);
  process.exitCode = 1;
} finally {
  await client.end();
}
