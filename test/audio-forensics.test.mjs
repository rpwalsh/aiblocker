// node test/audio-forensics.test.mjs — synthesized frequency-bin frames
// through the pure math core; no browser required.
import { createRequire } from "node:module";
import assert from "node:assert";
const require = createRequire(import.meta.url);
const { audioFrameStats, audioVerdict } = require("../src/audio-forensics.js");

const SR = 48000;
const BINS = 2048;

function frame(shape) {
  const out = new Array(BINS);
  for (let i = 0; i < BINS; i++) out[i] = shape(i / BINS);
  return out;
}

// 1. Brickwall at 46% of Nyquist (22.05k pipeline in a 48k stream) with a
//    sterile floor and steady loudness: must flag as synthetic.
{
  const synthFrame = () => frame(x => x < 0.46 ? -35 + Math.sin(x * 40) * 3 : -110);
  const frames = Array.from({ length: 12 }, () => audioFrameStats(synthFrame(), SR, BINS * 2));
  const v = audioVerdict(frames, SR);
  assert.strictEqual(v.available, true);
  assert.ok(v.signals.some(s => s.signal === "brickwall-cutoff"), "brickwall detected");
  assert.ok(v.signals.some(s => s.signal === "steady-loudness"), "steady loudness detected");
  assert.strictEqual(v.isAiGenerated, true, `synthetic profile must flag (score ${v.score.toFixed(2)})`);
}

// 2. Natural recording: gradual rolloff to Nyquist, audible noise floor,
//    loudness varying frame to frame: must NOT flag.
{
  let phase = 0;
  const natFrame = () => {
    phase += 1;
    const wob = Math.sin(phase * 1.7) * 6 + (phase % 3) * 2;
    return frame(x => -30 - x * 45 + wob + Math.sin(x * 25 + phase) * 4);
  };
  const frames = Array.from({ length: 12 }, () => audioFrameStats(natFrame(), SR, BINS * 2));
  const v = audioVerdict(frames, SR);
  assert.strictEqual(v.available, true);
  assert.strictEqual(v.isAiGenerated, false, `natural profile must not flag (score ${v.score.toFixed(2)}, signals ${JSON.stringify(v.signals)})`);
}

// 3. Tainted/cross-origin graph (-Infinity bins): unavailable, never a verdict.
{
  const tainted = frame(() => -Infinity);
  const frames = Array.from({ length: 8 }, () => audioFrameStats(tainted, SR, BINS * 2));
  const v = audioVerdict(frames, SR);
  assert.strictEqual(v.available, false, "tainted audio reports unavailable");
  assert.strictEqual(v.isAiGenerated, false);
}

// 4. Silence: unavailable, never a verdict.
{
  const silent = frame(() => -100);
  const frames = Array.from({ length: 8 }, () => audioFrameStats(silent, SR, BINS * 2));
  const v = audioVerdict(frames, SR);
  assert.strictEqual(v.available, false, "silence reports unavailable");
}

console.log("audio-forensics: all tests passed");
