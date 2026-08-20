// Benchmark harness: node test/benchmark.mjs <bench.jsonl> [detector]
// bench.jsonl rows: {label: 0|1, text: string} (1 = AI-generated).
// Reports AUROC, accuracy at the best threshold, and TPR at 5% FPR.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const benchPath = process.argv[2];
const which = process.argv[3] ?? "current";
if (!benchPath) { console.error("usage: node test/benchmark.mjs <bench.jsonl> [current|slop]"); process.exit(1); }

// HC3 human answers are detokenized ("do n't", "it 's"); ChatGPT answers are
// not. Collapse that so features measure language, not preprocessing.
function normalizeTokenization(text) {
  return text.replace(/\s+(n't|'s|'re|'m|'ll|'ve|'d)\b/g, "$1");
}
const rows = readFileSync(benchPath, "utf8").trim().split("\n")
  .map(l => JSON.parse(l))
  .map(r => ({ ...r, text: normalizeTokenization(r.text) }));

function loadScorer(name) {
  if (name === "current") {
    const src = readFileSync(path.join(here, "..", "src", "ml-detector.js"), "utf8");
    const ctx = {};
    vm.createContext(ctx);
    vm.runInContext(src + "\nglobalThis.__TextAnalyzer = TextAnalyzer;", ctx);
    const analyzer = new ctx.__TextAnalyzer();
    return async text => (await analyzer.analyze(text)).score ?? 0;
  }
  if (name === "slop") {
    const src = readFileSync(path.join(here, "..", "src", "slop-score.js"), "utf8");
    const ctx = {};
    vm.createContext(ctx);
    vm.runInContext(src + "\nglobalThis.__score = slopScore;", ctx);
    return async text => ctx.__score(text).score;
  }
  throw new Error(`unknown detector ${name}`);
}

function auroc(scored) {
  const pos = scored.filter(s => s.label === 1).map(s => s.score);
  const neg = scored.filter(s => s.label === 0).map(s => s.score);
  let wins = 0;
  for (const p of pos) for (const n of neg) wins += p > n ? 1 : p === n ? 0.5 : 0;
  return wins / (pos.length * neg.length);
}

function bestAccuracy(scored) {
  const thresholds = [...new Set(scored.map(s => s.score))].sort((a, b) => a - b);
  let best = { acc: 0, t: 0 };
  for (const t of thresholds) {
    const acc = scored.filter(s => (s.score >= t) === (s.label === 1)).length / scored.length;
    if (acc > best.acc) best = { acc, t };
  }
  return best;
}

function tprAtFpr(scored, targetFpr) {
  const neg = scored.filter(s => s.label === 0).map(s => s.score).sort((a, b) => b - a);
  const cut = neg[Math.max(0, Math.floor(neg.length * targetFpr) - 1)] ?? Infinity;
  const pos = scored.filter(s => s.label === 1);
  return pos.filter(s => s.score > cut).length / pos.length;
}

const score = loadScorer(which);
const scored = [];
for (const row of rows) scored.push({ label: row.label, score: await score(row.text) });

const best = bestAccuracy(scored);
console.log(JSON.stringify({
  detector: which,
  samples: scored.length,
  auroc: Number(auroc(scored).toFixed(4)),
  bestAccuracy: Number(best.acc.toFixed(4)),
  bestThreshold: Number(best.t.toFixed(4)),
  tprAt5pctFpr: Number(tprAtFpr(scored, 0.05).toFixed(4))
}));
