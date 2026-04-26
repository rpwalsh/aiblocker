/*
 * Copyright (c) 2026 Ryan Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

import crypto from 'node:crypto';

// We sign the canonical JSON of {version, featureWeights}.
// The extension verifies this signature against a pinned public key.

export function canonicalizeModelPayload(payload) {
  const version = Number(payload?.version) || 0;
  const fw = payload?.featureWeights && typeof payload.featureWeights === 'object' ? payload.featureWeights : {};

  // Stable ordering of keys for deterministic signing.
  const keys = Object.keys(fw).sort();
  const ordered = {};
  for (const k of keys) ordered[k] = fw[k];

  const canonical = {
    version,
    featureWeights: ordered,
  };

  return JSON.stringify(canonical);
}

export function signModelPayload(payload, privateKeyPem) {
  const msg = canonicalizeModelPayload(payload);
  const sign = crypto.createSign('SHA256');
  sign.update(msg);
  sign.end();

  const sig = sign.sign(privateKeyPem, 'base64');
  // base64url for transport
  return sig.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function verifyModelPayloadSignature(payload, signatureB64Url, publicKeyPem) {
  const msg = canonicalizeModelPayload(payload);
  const signatureB64 = signatureB64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = signatureB64 + '==='.slice((signatureB64.length + 3) % 4);
  const sig = Buffer.from(padded, 'base64');

  const verify = crypto.createVerify('SHA256');
  verify.update(msg);
  verify.end();

  return verify.verify(publicKeyPem, sig);
}
