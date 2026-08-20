/*
 * Copyright (c) 2026 Ryan P. Walsh. All rights reserved.
 * Proprietary commercial software published for public reference only.
 * No license is granted to use, copy, modify, distribute, or create derivative works.
 */

// Transparent rule-based AI-text scorer. Every feature is a named,
// human-auditable statistic; the weighted sum is squashed to [0,1].
// Benchmarked by test/benchmark.mjs; weights are hand-set against the
// HC3 human/ChatGPT corpus and validated on a held-out slice.

const SLOP_PHRASES = [
  "delve", "delving", "tapestry", "testament to", "vibrant", "boasts",
  "pivotal", "multifaceted", "intricate", "nuanced", "holistic",
  "seamless", "robust", "leverage", "leveraging", "underscore",
  "underscores", "showcase", "showcasing", "elevate", "embark",
  "unlock the", "dive into", "navigate the", "ever-evolving",
  "in today's", "in conclusion", "it's important to note",
  "it is important to note", "it's worth noting", "it is worth noting",
  "plays a vital role", "plays a crucial role", "a wide range of",
  "in the realm of", "the landscape of", "furthermore", "moreover",
  "additionally", "overall,", "in summary", "to summarize",
  "it's essential to", "it is essential to", "there are several",
  "here are some", "some common", "keep in mind", "it depends on",
  "generally speaking", "as a general rule", "when it comes to",
  "on the other hand", "at the end of the day", "a variety of",
  "comprehensive", "crucial", "foster", "fostering", "enhance",
  "enhancing", "utilize", "utilizing", "ensure that", "specifically,",
  "ultimately,", "essentially,", "significantly,", "particularly,",
  "important to note", "worth noting that", "note that", "helps to",
  "one reason", "another reason", "few reasons why", "can help",
  "there are a few", "a variety of", "which can", "overall the",
  "this is because", "this means that", "in other words",
  "for example,", "such as", "a number of", "the process of",
  "is a type of", "is known as", "refers to", "the idea is",
  "in general,", "typically,", "commonly", "in order to"
];

const HUMAN_MARKERS = [
  "lol", "lmao", "tbh", "imo", "imho", "afaik", "iirc", "idk", "btw",
  "gonna", "wanna", "gotta", "kinda", "sorta", "yeah", "nope", "yep",
  "fuck", "shit", "damn", "crap", "stupid", "dumb", "pretty much",
  "basically you", "source:", "edit:", "eli5", "op ", "my ", " me ",
  "i've seen", "i remember", "i work", "i used to", "when i was"
];

const LADDER_OPENERS = /\b(firstly|secondly|thirdly|finally|first,|second,|third,|lastly)\b/gi;

function sentencesOf(text) {
  return (text.match(/[^.!?\n]+[.!?]+/g) || []).map(s => s.trim()).filter(s => s.length > 2);
}

function rate(count, per, total) {
  return total > 0 ? (count * per) / total : 0;
}

function slopScore(text) {
  const reasons = [];
  if (!text || text.length < 120) return { score: 0.0, isAiGenerated: false, reasons };
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z']+/g) || [];
  const wordCount = Math.max(1, words.length);
  const sentences = sentencesOf(text);

  // 1. Slop lexicon rate (per 1000 words).
  let slopHits = 0;
  for (const phrase of SLOP_PHRASES) {
    let from = 0;
    while (true) {
      const at = lower.indexOf(phrase, from);
      if (at < 0) break;
      slopHits++;
      from = at + phrase.length;
    }
  }
  const slopRate = rate(slopHits, 1000, wordCount);

  // 2. Human-marker rate (personal, casual, sourced).
  let humanHits = 0;
  for (const phrase of HUMAN_MARKERS) {
    let from = 0;
    while (true) {
      const at = lower.indexOf(phrase, from);
      if (at < 0) break;
      humanHits++;
      from = at + phrase.length;
    }
  }
  const humanRate = rate(humanHits, 1000, wordCount);

  // 3. Contraction rate: casual human prose contracts, assistants under-contract.
  const contractions = (lower.match(/\b[a-z]+'(t|s|re|ve|ll|d|m)\b/g) || []).length;
  const contractionRate = rate(contractions, 1000, wordCount);

  // 4. Burstiness: low sentence-length variance reads machine-steady.
  let burstiness = 1;
  if (sentences.length >= 3) {
    const lens = sentences.map(s => (s.match(/\S+/g) || []).length);
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);
    burstiness = mean > 0 ? sd / mean : 1;
  }

  // 5. Structural cadence: enumeration ladders, not-X-but-Y, triads.
  const ladder = (text.match(LADDER_OPENERS) || []).length;
  const notButY = (lower.match(/\bnot (only|just|merely)\b[^.!?]{0,60}\bbut\b/g) || []).length;
  const triads = (text.match(/,\s+[^,.!?]{2,30},\s+and\s+/g) || []).length;
  const structureRate = rate(ladder + notButY + triads, 1000, wordCount);

  // 6. Uniform openers: consecutive sentences opening the same way.
  let uniformOpeners = 0;
  if (sentences.length >= 4) {
    const openers = sentences.map(s => (s.match(/^\W*(\w+)/) || [])[1]?.toLowerCase() ?? "");
    const generic = new Set(["the", "it", "this", "these", "additionally", "however", "overall", "there"]);
    uniformOpeners = openers.filter(o => generic.has(o)).length / openers.length;
  }

  // 7. Second-person instruction register ("you can", "you should", "your").
  const secondPerson = rate((lower.match(/\byou(r|'re|'ll)?\b/g) || []).length, 1000, wordCount);

  // 8. Invisible-character forensics: zero-width spaces/joiners, word
  // joiners, BOM, soft hyphens, bidi controls, variation selectors. No
  // keyboard produces these; chat-UI copy/paste and watermark-style
  // insertion do. Presence is near-deterministic evidence of pasted
  // machine text.
  const invisibles = (text.match(/[\u200B-\u200F\u2060\uFEFF\u00AD\u202A-\u202E\u2066-\u2069\uFE00-\uFE0F]/g) || []).length;
  const invisibleRate = rate(invisibles, 1000, Math.max(1, text.length));

  void secondPerson;
  void contractionRate;
  const parts = {
    slop: Math.min(3.4, slopRate * 0.52),
    structure: Math.min(1.1, structureRate * 0.22),
    uniform: uniformOpeners > 0.4 ? (uniformOpeners - 0.4) * 2.4 : 0,
    lowBurst: burstiness < 0.45 ? (0.45 - burstiness) * 3.0 : 0,
    invisible: invisibles >= 2 ? Math.min(3.5, 1.5 + invisibleRate * 0.5) : 0,
    human: -Math.min(2.6, humanRate * 0.34)
  };
  for (const [name, value] of Object.entries(parts)) {
    if (value >= 0.25) reasons.push(`+${name}`);
    if (value <= -0.25) reasons.push(`-${name}`);
  }

  const raw = Object.values(parts).reduce((a, b) => a + b, 0);
  const score = 1 / (1 + Math.exp(-(raw - 0.35) * 2.2));
  return { score, isAiGenerated: score > 0.5, reasons, parts };
}

if (typeof module !== "undefined" && module.exports) module.exports = { slopScore };
