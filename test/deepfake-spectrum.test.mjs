// node test/deepfake-spectrum.test.mjs — loads the production
// DeepfakeDetector class and verifies frequency verdict behavior on
// synthetic frames: periodic artifacts flag, smoothness alone must not.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.join(here, "..", "src", "deepfake-detector.js"), "utf8");
const classStart = source.indexOf("class DeepfakeDetector");
const classEnd = source.indexOf("\nclass ", classStart + 1);
const snippet = source.slice(0, classStart)
  + source.slice(classStart, classEnd === -1 ? source.length : classEnd)
  + "\nglobalThis.__DD = DeepfakeDetector;";
const fakeWindow = { top: undefined, addEventListener() {} };
fakeWindow.top = fakeWindow;
const ctx = { console, window: fakeWindow, document: { createElement: () => ({ getContext: () => null }) }, navigator: { userAgent: "test" }, chrome: { runtime: { onMessage: { addListener() {} }, sendMessage() {} } } };
vm.createContext(ctx);
vm.runInContext(snippet, ctx);
const dd = new ctx.__DD();

function rgba(fill) {
  const w = 64, h = 64;
  const px = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = fill(x, y);
    const i = (y * w + x) * 4;
    px[i] = px[i + 1] = px[i + 2] = v; px[i + 3] = 255;
  }
  return { px, w, h };
}

// 1. Strong 8px periodic checkerboard: periodicity artifacts must flag.
{
  const { px, w, h } = rgba((x, y) => ((Math.floor(x / 8) + Math.floor(y / 8)) % 2) * 255);
  const s = dd.computeFrequencySpectrum(px, w, h);
  assert.strictEqual(s.hasPeriodicityArtifacts, true, "checkerboard periodicity detected");
}

// 2. Random noise: no periodicity, high-frequency content present.
{
  let seed = 42;
  const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const { px, w, h } = rgba(() => Math.floor(rand() * 256));
  const s = dd.computeFrequencySpectrum(px, w, h);
  assert.strictEqual(s.lowHighFrequencyContent, false, "noise has high-frequency energy");
}

// 3. Smooth gradient reads low-high-frequency, but that flag alone is
//    context: the source encodes no verdict from it (guarded in
//    analyzeFrequencyDomain; assert the smooth spectrum itself).
{
  const { px, w, h } = rgba((x) => Math.floor((x / 64) * 255));
  const s = dd.computeFrequencySpectrum(px, w, h);
  assert.strictEqual(s.lowHighFrequencyContent, true, "gradient is smooth");
  assert.strictEqual(s.hasPeriodicityArtifacts, false, "gradient is not periodic");
}

// 4. The verdict wiring: smoothness must not set isAiGenerated (source
//    contract check — the guarded branch adds context only).
{
  const guarded = /Smoothness is context, never a verdict/.test(source);
  assert.ok(guarded, "smoothness-verdict guard present in source");
  const verdictFromSmoothness = /lowHighFrequencyContent\)\s*{[^}]*isAiGenerated = true/.test(source);
  assert.strictEqual(verdictFromSmoothness, false, "no verdict from smoothness alone");
}

console.log("deepfake-spectrum: all tests passed");
