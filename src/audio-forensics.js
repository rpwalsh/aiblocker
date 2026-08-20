/*
 * Copyright (c) 2026 Ryan P. Walsh
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Noncommercial use is free; commercial use requires a separate
 * license from the author. See LICENSE.
 */

// Math-only audio forensics. The pure core operates on frequency-bin
// frames (dB values, as produced by AnalyserNode.getFloatFrequencyData);
// the browser glue attaches an analyser to CORS-readable media elements
// only, samples briefly, and never disrupts playback. Every signal is a
// named statistic:
//   - spectral cutoff + brickwall steepness: TTS/voice-clone pipelines
//     generate at 16/22.05/24 kHz and upsample, leaving a hard shelf far
//     below Nyquist that natural recordings and modern codecs do not.
//   - spectral flatness: synthetic speech is flatter in-band.
//   - frame-level variance ("audio burstiness"): generated audio holds
//     unnaturally steady loudness.
//   - noise floor: real microphones capture room noise between phrases.

function audioFrameStats(freqDb, sampleRate, fftSize) {
  const bins = freqDb.length;
  const nyquist = sampleRate / 2;
  const usable = freqDb.filter(v => Number.isFinite(v));
  if (usable.length < bins * 0.5) return null; // tainted or silent

  // Noise floor: 10th percentile of finite bins.
  const sorted = [...usable].sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.1)];
  const peak = sorted[sorted.length - 1];
  if (peak - floor < 8) return null; // effectively silence

  // Spectral cutoff: highest bin still 12 dB above the floor.
  let cutoffBin = 0;
  for (let i = bins - 1; i >= 0; i--) {
    if (Number.isFinite(freqDb[i]) && freqDb[i] > floor + 12) { cutoffBin = i; break; }
  }
  const cutoffHz = (cutoffBin / bins) * nyquist;

  // Brickwall steepness: dB drop across the 6 bins after the cutoff.
  let after = 0;
  let count = 0;
  for (let i = cutoffBin + 1; i < Math.min(bins, cutoffBin + 7); i++) {
    if (Number.isFinite(freqDb[i])) { after += freqDb[i]; count++; }
  }
  const steepness = count ? (freqDb[cutoffBin] - after / count) : 0;

  // Spectral flatness (in-band, up to the cutoff): geometric/arithmetic
  // mean ratio of linear power.
  let logSum = 0;
  let linSum = 0;
  let n = 0;
  for (let i = 1; i <= cutoffBin; i++) {
    if (!Number.isFinite(freqDb[i])) continue;
    const p = Math.pow(10, freqDb[i] / 10);
    logSum += Math.log(p);
    linSum += p;
    n++;
  }
  const flatness = n ? Math.exp(logSum / n) / (linSum / n) : 0;

  // Frame loudness (mean dB of finite bins).
  const level = usable.reduce((a, b) => a + b, 0) / usable.length;

  return { cutoffHz, cutoffRatio: cutoffHz / nyquist, steepness, flatness, floor, level };
}

function audioVerdict(frames, sampleRate) {
  const signals = [];
  const valid = frames.filter(Boolean);
  if (valid.length < 4) {
    return { available: false, score: 0, isAiGenerated: false, signals: [{ signal: "insufficient-data", detail: "Too few readable frames (silent, tainted, or cross-origin audio)" }] };
  }
  const mean = key => valid.reduce((a, f) => a + f[key], 0) / valid.length;
  const cutoffRatio = mean("cutoffRatio");
  const steepness = mean("steepness");
  const flatness = mean("flatness");
  const floor = mean("floor");
  const levels = valid.map(f => f.level);
  const lm = levels.reduce((a, b) => a + b, 0) / levels.length;
  const levelSd = Math.sqrt(levels.reduce((a, b) => a + (b - lm) ** 2, 0) / levels.length);

  let raw = -1.1;
  // Hard shelf far below Nyquist with brickwall steepness: resampled
  // synthetic pipeline. 22.05k content in a 44.1/48k stream sits ~0.5.
  if (cutoffRatio < 0.72 && steepness > 18) {
    raw += 1.4;
    signals.push({ signal: "brickwall-cutoff", detail: `Hard spectral shelf at ${(cutoffRatio * (sampleRate / 2) / 1000).toFixed(1)} kHz with ${steepness.toFixed(0)} dB drop — synthetic resample signature` });
  }
  // Unnaturally steady loudness across frames.
  if (levelSd < 1.6) {
    raw += 0.8;
    signals.push({ signal: "steady-loudness", detail: `Frame loudness variance ${levelSd.toFixed(2)} dB — machine-steady dynamics` });
  }
  // In-band flatness beyond natural speech/music.
  if (flatness > 0.35) {
    raw += 0.6;
    signals.push({ signal: "high-flatness", detail: `Spectral flatness ${flatness.toFixed(2)} — noise-like uniform spectrum` });
  }
  // Impossibly clean floor: no room, no mic, no codec noise.
  if (floor < -105) {
    raw += 0.4;
    signals.push({ signal: "sterile-floor", detail: `Noise floor ${floor.toFixed(0)} dB — no room/microphone noise (context; studio masters can too)` });
  }

  const score = 1 / (1 + Math.exp(-raw * 1.6));
  return { available: true, score, isAiGenerated: score > 0.7, signals, stats: { cutoffRatio: Number(cutoffRatio.toFixed(3)), steepness: Number(steepness.toFixed(1)), flatness: Number(flatness.toFixed(3)), floor: Number(floor.toFixed(1)), levelSd: Number(levelSd.toFixed(2)) } };
}

// Browser glue. Safe by construction:
// - only attaches when the element's audio is CORS-readable (verified by
//   sampling: tainted graphs return -Infinity bins and we bail),
// - the media-source node is cached per element and stays connected to
//   the destination forever (detaching would mute the element),
// - sampling stops after maxMs; playback is never paused, seeked, or
//   rerouted away from the speakers.
const __audioGraphCache = typeof WeakMap !== "undefined" ? new WeakMap() : null;

async function analyzeMediaElementAudio(element, options = {}) {
  const maxMs = options.maxMs ?? 2500;
  const frameEvery = options.frameEveryMs ?? 120;
  if (typeof AudioContext === "undefined" || !element) {
    return { available: false, score: 0, isAiGenerated: false, signals: [{ signal: "unsupported", detail: "WebAudio unavailable" }] };
  }
  try {
    let graph = __audioGraphCache.get(element);
    if (!graph) {
      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(element);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      graph = { ctx, source, analyser };
      __audioGraphCache.set(element, graph);
    }
    if (graph.ctx.state === "suspended") await graph.ctx.resume();
    const bins = new Float32Array(graph.analyser.frequencyBinCount);
    const frames = [];
    const started = Date.now();
    while (Date.now() - started < maxMs) {
      await new Promise(r => setTimeout(r, frameEvery));
      if (element.paused) continue;
      graph.analyser.getFloatFrequencyData(bins);
      frames.push(audioFrameStats(Array.from(bins), graph.ctx.sampleRate, graph.analyser.fftSize));
    }
    return audioVerdict(frames, graph.ctx.sampleRate);
  } catch (error) {
    return { available: false, score: 0, isAiGenerated: false, signals: [{ signal: "attach-failed", detail: String(error && error.message || error) }] };
  }
}

if (typeof module !== "undefined" && module.exports) module.exports = { audioFrameStats, audioVerdict, analyzeMediaElementAudio };
