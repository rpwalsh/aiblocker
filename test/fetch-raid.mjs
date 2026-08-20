// Rebuilds the RAID benchmark samples used for the domain-robust numbers.
// Usage:
//   node test/fetch-raid.mjs         -> test/data/raid-tune-half.jsonl + raid-hold-half.jsonl
// Samples the indexed slice of liamdugan/raid via the Hugging Face rows
// API, keeps generations >=200 chars, labels model!=human as 1, and
// splits tune/holdout deterministically by text hash.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rows = [];
for (let off = 0; off < 2_400_000; off += 60_000) {
  const url = `https://datasets-server.huggingface.co/rows?dataset=liamdugan%2Fraid&config=raid&split=train&offset=${off}&length=100`;
  try {
    const d = await (await fetch(url)).json();
    for (const { row } of d.rows ?? []) {
      const text = row.generation ?? "";
      if (!text || text.length < 200) continue;
      rows.push({ label: row.model === "human" ? 0 : 1, text, model: row.model, domain: row.domain, attack: row.attack });
    }
  } catch (e) { console.error("skip", off, e.message); }
}
const tune = [];
const hold = [];
for (const r of rows) {
  const h = parseInt(createHash("sha1").update(r.text).digest("hex").slice(0, 8), 16);
  (h % 2 === 0 ? tune : hold).push(r);
}
mkdirSync(path.join(here, "data"), { recursive: true });
writeFileSync(path.join(here, "data", "raid-tune-half.jsonl"), tune.map(x => JSON.stringify(x)).join("\n"));
writeFileSync(path.join(here, "data", "raid-hold-half.jsonl"), hold.map(x => JSON.stringify(x)).join("\n"));
const st = l => `${l.filter(x => !x.label).length}H/${l.filter(x => x.label).length}A`;
console.log("tune:", tune.length, st(tune), "| hold:", hold.length, st(hold));
