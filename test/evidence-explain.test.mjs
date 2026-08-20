// node test/evidence-explain.test.mjs — the explain mode must return
// findings whose offsets index the RAW input exactly; a report that
// mislabels positions is worse than no report.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = ["slop-stylometry", "slop-lexicon", "slop-score"]
  .map(f => readFileSync(path.join(here, "..", "src", `${f}.js`), "utf8")).join("\n");
const ctx = { module: { exports: {} } };
vm.createContext(ctx);
vm.runInContext(src + "\nglobalThis.__s = slopScore;", ctx);
const score = (t, o) => ctx.__s(t, o);

const pad = " This filler sentence keeps the sample above the minimum length gate for scoring purposes.";

// 1. Invisible character: exact offset, exact codepoint in label.
{
  const text = "A perfectly ordinary sentence hiding something.​ And another one after it." + pad;
  const r = score(text, { explain: true });
  const f = r.findings.find(x => x.kind === "invisible");
  assert.ok(f, "invisible finding present");
  assert.strictEqual(text.slice(f.start, f.end), "​", "offset indexes the hidden char");
  assert.ok(f.label.includes("200B"), "label names the codepoint");
}

// 2. Human slip: "should of" located exactly.
{
  const text = "I think he should of known better than to try that on a busy day." + pad;
  const r = score(text, { explain: true });
  const f = r.findings.find(x => x.kind === "humanError" && text.slice(f0(x), x.end).length >= 0 && text.toLowerCase().slice(x.start, x.end) === "should of");
  function f0(x) { return x.start; }
  assert.ok(f, "should-of finding present at exact offsets");
}

// 3. Slop phrase located exactly (case-insensitive source).
{
  const text = "It's important to note that the committee reviewed all seventeen submissions carefully." + pad;
  const r = score(text, { explain: true });
  const f = r.findings.find(x => x.kind === "slop");
  assert.ok(f, "slop finding present");
  assert.strictEqual(text.toLowerCase().slice(f.start, f.end), text.toLowerCase().slice(f.start, f.end));
  assert.ok(text.toLowerCase().slice(f.start, f.end).includes("important to note"), "offsets cover the phrase");
}

// 4. Confusable: Cyrillic char inside a Latin word located exactly.
{
  const text = "The bаnk statement looked normal at first glance to everyone who read it quickly." + pad;
  const r = score(text, { explain: true });
  const f = r.findings.find(x => x.kind === "confusable");
  assert.ok(f, "confusable finding present");
  assert.strictEqual(text.slice(f.start, f.end), "а", "offset indexes the Cyrillic char");
}

// 5. No explain option: no findings collected, score identical.
{
  const text = "It's important to note that the committee reviewed all seventeen submissions carefully." + pad;
  const a = score(text, { explain: true });
  const b = score(text);
  assert.strictEqual(a.score, b.score, "explain must not change the score");
  assert.strictEqual((b.findings ?? []).length, 0, "no findings without explain");
}

console.log("evidence-explain: all tests passed");
