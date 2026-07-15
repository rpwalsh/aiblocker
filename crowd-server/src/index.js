/*
 * Copyright (c) 2026 Sarah Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { computeFeatureWeights } from './model.js';
import { signModelPayload } from './crypto.js';

dotenv.config();

const { Pool } = pg;

const PORT = Number(process.env.PORT || 8787);
const DATABASE_URL = process.env.DATABASE_URL;
const SQLITE_PATH = process.env.SQLITE_PATH || './data/dev.sqlite';

function normalizePem(value) {
  if (!value) return '';
  return String(value).replace(/\\n/g, '\n').trim();
}

const PRIVATE_KEY_PEM = normalizePem(process.env.MODEL_SIGNING_PRIVATE_KEY_PEM);

if (!PRIVATE_KEY_PEM) {
  console.error('Missing MODEL_SIGNING_PRIVATE_KEY_PEM');
  process.exit(1);
}

const dbMode = DATABASE_URL ? 'postgres' : 'sqlite';

let pool = null;
let sqlite = null;

function ensureSqliteSchema(db) {
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS feature_stats (
      feature_id TEXT PRIMARY KEY,
      ai_yes INTEGER NOT NULL DEFAULT 0,
      ai_no INTEGER NOT NULL DEFAULT 0,
      updated_at_ms INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS model_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at_ms INTEGER NOT NULL,
      model_json TEXT NOT NULL,
      model_sig TEXT NOT NULL
    );
  `);
}

function initDb() {
  if (dbMode === 'postgres') {
    pool = new Pool({ connectionString: DATABASE_URL });
    return;
  }
  const dir = path.dirname(SQLITE_PATH);
  if (dir && dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  sqlite = new Database(SQLITE_PATH);
  ensureSqliteSchema(sqlite);
}

initDb();

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '64kb' }));

app.get('/healthz', async (_req, res) => {
  try {
    if (dbMode === 'postgres') {
      const r = await pool.query('SELECT 1 as ok');
      res.json({ ok: r.rows?.[0]?.ok === 1, db: dbMode });
    } else {
      const r = sqlite.prepare('SELECT 1 as ok').get();
      res.json({ ok: r?.ok === 1, db: dbMode });
    }
  } catch (e) {
    res.status(500).json({ ok: false, db: dbMode });
  }
});

// Vote packet shape:
// { v:1, day:int, cohort:int, vote:"ai"|"not_ai", featureIds:[...], conf:number|null, cid:string|null }
app.post('/v1/vote', async (req, res) => {
  try {
    const body = req.body || {};
    const vote = body.vote;
    const featureIds = Array.isArray(body.featureIds) ? body.featureIds : [];

    if (vote !== 'ai' && vote !== 'not_ai') {
      return res.status(400).json({ ok: false, error: 'invalid_vote' });
    }

    // Strict feature id validation: only allow safe characters.
    const safe = featureIds
      .filter((x) => typeof x === 'string')
      .map((x) => x.trim())
      .filter((x) => x.length > 0 && x.length <= 140)
      .filter((x) => /^[a-zA-Z0-9:_\-\.]+$/.test(x))
      .slice(0, 32);

    if (safe.length === 0) {
      return res.status(400).json({ ok: false, error: 'no_features' });
    }

    const yesInc = vote === 'ai' ? 1 : 0;
    const noInc = vote === 'not_ai' ? 1 : 0;

    if (dbMode === 'postgres') {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const fid of safe) {
          await client.query(
            `INSERT INTO feature_stats(feature_id, ai_yes, ai_no)
             VALUES ($1, $2, $3)
             ON CONFLICT (feature_id)
             DO UPDATE SET
               ai_yes = feature_stats.ai_yes + $2,
               ai_no  = feature_stats.ai_no + $3,
               updated_at = NOW()`,
            [fid, yesInc, noInc]
          );
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } else {
      const now = Date.now();
      const upsert = sqlite.prepare(
        `INSERT INTO feature_stats(feature_id, ai_yes, ai_no, updated_at_ms)
         VALUES (@feature_id, @ai_yes, @ai_no, @updated_at_ms)
         ON CONFLICT(feature_id) DO UPDATE SET
           ai_yes = feature_stats.ai_yes + excluded.ai_yes,
           ai_no  = feature_stats.ai_no  + excluded.ai_no,
           updated_at_ms = excluded.updated_at_ms`
      );
      const tx = sqlite.transaction((fids) => {
        for (const fid of fids) {
          upsert.run({ feature_id: fid, ai_yes: yesInc, ai_no: noInc, updated_at_ms: now });
        }
      });
      tx(safe);
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

// Serve the latest signed model.
app.get('/v1/model', async (_req, res) => {
  try {
    // Read all stats (small); if you expect huge size, paginate or precompute.
    let rows = [];
    if (dbMode === 'postgres') {
      const stats = await pool.query('SELECT feature_id, ai_yes, ai_no FROM feature_stats');
      rows = stats.rows;
    } else {
      rows = sqlite
        .prepare('SELECT feature_id, ai_yes, ai_no FROM feature_stats')
        .all()
        .map((r) => ({
          feature_id: r.feature_id,
          ai_yes: Number(r.ai_yes) || 0,
          ai_no: Number(r.ai_no) || 0,
        }));
    }

    const featureWeights = computeFeatureWeights(rows);

    // Version can be timestamp-based or monotonic. We use day bucket + counter-ish.
    const version = Math.floor(Date.now() / 1000);
    const payload = { version, featureWeights };

    const signature = signModelPayload(payload, PRIVATE_KEY_PEM);

    // Optional: persist for audit/debug (still no user identity).
    if (dbMode === 'postgres') {
      await pool.query('INSERT INTO model_versions(model_json, model_sig) VALUES ($1, $2)', [payload, signature]);
    } else {
      sqlite
        .prepare('INSERT INTO model_versions(created_at_ms, model_json, model_sig) VALUES (?, ?, ?)')
        .run(Date.now(), JSON.stringify(payload), signature);
    }

    res.json({ ...payload, signature, alg: 'RS256' });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

app.listen(PORT, () => {
  console.log(`Crowd server listening on :${PORT} (db=${dbMode})`);
});
