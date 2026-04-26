/*
 * Copyright (c) 2026 Ryan Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

// Convert aggregate vote counts into conservative weight deltas.
// Returns featureWeights: { nodeId: adj } where adj is in [-0.25, +0.25].
//
// We use a Beta prior to avoid early swings.
// p = (a + yes) / (a + b + yes + no)
// adj = clamp((p - 0.5) * scale, -0.25, 0.25)

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

export function computeFeatureWeights(rows, opts = {}) {
  const a = Number(opts.alpha ?? 2);
  const b = Number(opts.beta ?? 2);
  const minVotes = Number(opts.minVotes ?? 25);
  const scale = Number(opts.scale ?? 0.9);

  const out = {};

  for (const r of rows) {
    const yes = Number(r.ai_yes ?? 0);
    const no = Number(r.ai_no ?? 0);
    const n = yes + no;
    if (n < minVotes) continue;

    const p = (a + yes) / (a + b + yes + no);
    const adj = clamp((p - 0.5) * scale, -0.25, 0.25);

    // Only include meaningful adjustments.
    if (Math.abs(adj) >= 0.02) out[r.feature_id] = Number(adj.toFixed(4));
  }

  return out;
}
