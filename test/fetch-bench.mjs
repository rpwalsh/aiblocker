// Rebuilds the benchmark corpora from the public HC3 dataset
// (Hello-SimpleAI/HC3 via the Hugging Face rows API). Usage:
//   node test/fetch-bench.mjs           -> test/data/bench.jsonl (tuning)
//   node test/fetch-bench.mjs holdout   -> test/data/holdout.jsonl
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const which = process.argv[2] === "holdout" ? "holdout" : "bench";
const offsets = which === "bench" ? [0, 100, 200, 300, 400, 500] : [600, 700, 800, 900];

const rows = [];
for (const offset of offsets) {
  const url = `https://datasets-server.huggingface.co/rows?dataset=Hello-SimpleAI%2FHC3&config=all&split=train&offset=${offset}&length=100`;
  const data = await (await fetch(url)).json();
  rows.push(...(data.rows ?? []).map(r => r.row));
}

const out = [];
for (const r of rows) {
  for (const h of (r.human_answers ?? []).slice(0, 1)) if (h && h.length >= 200) out.push({ label: 0, text: h, source: r.source });
  for (const a of (r.chatgpt_answers ?? []).slice(0, 1)) if (a && a.length >= 200) out.push({ label: 1, text: a, source: r.source });
}

mkdirSync(path.join(here, "data"), { recursive: true });
const file = path.join(here, "data", `${which}.jsonl`);
writeFileSync(file, out.map(x => JSON.stringify(x)).join("\n"));
console.log(`${file}: ${out.length} samples (${out.filter(x => !x.label).length} human / ${out.filter(x => x.label).length} ai)`);
