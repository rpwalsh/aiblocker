/*
 * Copyright (c) 2026 Sarah Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

// Helper script in case you want offline signing of a frozen model JSON.
// Not required for runtime (server already signs).

import fs from 'node:fs';
import dotenv from 'dotenv';
import { signModelPayload } from './crypto.js';

dotenv.config();

const PRIVATE_KEY_PEM = process.env.MODEL_SIGNING_PRIVATE_KEY_PEM;
if (!PRIVATE_KEY_PEM) {
  console.error('Missing MODEL_SIGNING_PRIVATE_KEY_PEM');
  process.exit(1);
}

const inPath = process.argv[2];
if (!inPath) {
  console.error('Usage: node src/sign-model.js path/to/model.json');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const signature = signModelPayload(payload, PRIVATE_KEY_PEM);
console.log(signature);
