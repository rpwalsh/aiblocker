/*
 * Copyright (c) 2026 Sarah Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

import crypto from 'node:crypto';

const BASE = process.env.CROWD_ENDPOINT || 'http://localhost:8787';

async function j(method, url, body) {
  const r = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    // ignore
  }
  if (!r.ok) {
    const detail = data ? JSON.stringify(data) : text;
    throw new Error(`${method} ${url} failed: ${r.status} ${detail}`);
  }
  return data;
}

function stableId() {
  return crypto.randomBytes(6).toString('hex');
}

async function main() {
  console.log(`[selftest] Checking ${BASE}/healthz`);
  const health = await j('GET', `${BASE}/healthz`);
  console.log('[selftest] healthz:', health);

  console.log(`[selftest] Posting a vote to ${BASE}/v1/vote`);
  const fid = `t:phrase:selftest:${stableId()}`;
  const voteRes = await j('POST', `${BASE}/v1/vote`, {
    vote: 'ai',
    featureIds: [fid],
  });
  console.log('[selftest] vote:', voteRes);

  console.log(`[selftest] Fetching model from ${BASE}/v1/model`);
  const model = await j('GET', `${BASE}/v1/model`);
  const keys = Object.keys(model || {});
  console.log('[selftest] model keys:', keys);

  if (!model || typeof model.signature !== 'string' || model.signature.length < 32) {
    throw new Error('Model response missing signature');
  }
  if (!model.featureWeights || typeof model.featureWeights !== 'object') {
    throw new Error('Model response missing featureWeights');
  }

  console.log('[selftest] OK');
}

main().catch((e) => {
  console.error('[selftest] FAIL:', e);
  process.exitCode = 1;
});
