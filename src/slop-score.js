/*
 * Copyright (c) 2026 Ryan P. Walsh
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Noncommercial use is free; commercial use requires a separate
 * license from the author. See LICENSE.
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

// Humans typo, drop apostrophes, and reach for the wrong homophone;
// assistants essentially never do. High-precision list only.
const TYPO_MARKERS = [
  "definately", "recieve", "seperate", "alot", "wierd", "occured",
  "untill", "becuase", "thier", "teh ", "tommorow", "accross",
  "should of", "could of", "would of", "must of", "your welcome",
  "payed", "there own", "noone", "everytime",
  "atleast", "aswell", "eachother", "incase", "infact"
];
const APOSTROPHE_DROPS = /\b(dont|cant|wont|isnt|doesnt|didnt|wasnt|werent|couldnt|shouldnt|wouldnt|im|ive|youre|youve|theyre|theyve|thats|whats|heres|theres|lets)\b/g;
const LOWERCASE_I = /(?:^|[^A-Za-z])i(?:'m|'ve|'ll|'d)?\s/g;

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

  // 9. Human error forensics: misspellings, homophone slips, dropped
  // apostrophes, lowercase "i". Machines almost never produce these.
  let typoHits = 0;
  for (const marker of TYPO_MARKERS) {
    let from = 0;
    while (true) {
      const at = lower.indexOf(marker, from);
      if (at < 0) break;
      typoHits++;
      from = at + marker.length;
    }
  }
  typoHits += (lower.match(APOSTROPHE_DROPS) || []).length;
  typoHits += (text.match(LOWERCASE_I) || []).length;
  const typoRate = rate(typoHits, 1000, wordCount);

  // 10. Encyclopedic definition register: "Subject (ACRONYM) is a ...".
  const acronymExpansion = (text.match(/\b[A-Z][a-z]+(?: [a-z]+){0,3} \([A-Z]{2,6}\)/g) || []).length;
  const firstSentence = sentences[0] ?? "";
  const definitionOpener = sentences.length >= 2
    && /^[A-Z"'][^.!?]{2,80}\bis (a|an|the)\b/.test(firstSentence) ? 1 : 0;

  // Burrows-Delta stylometry (src/slop-stylometry.js when present):
  // distance to the published human vs machine function-word centroids.
  // Function words are topic-free, so this channel survives domain shift
  // that breaks phrase lexicons.
  let stylo = 0;
  const styloTable = typeof STYLO_TABLE !== "undefined" ? STYLO_TABLE
    : (typeof module !== "undefined" && (() => { try { return require("./slop-stylometry.js").STYLO_TABLE; } catch { return undefined; } })());
  if (styloTable && wordCount >= 60) {
    const counts = {};
    for (const w of words) counts[w] = (counts[w] ?? 0) + 1;
    let dH = 0;
    let dA = 0;
    for (const t of styloTable) {
      const f = ((counts[t.w] ?? 0) * 1000) / wordCount;
      dH += Math.abs(f - t.h) / t.sd;
      dA += Math.abs(f - t.a) / t.sd;
    }
    stylo = (dH - dA) / styloTable.length;
  }

  // Degenerate repetition: sampling-mode generators loop trigrams no
  // human writer repeats.
  let degeneracy = 0;
  if (words.length >= 60) {
    const tri = {};
    let maxTri = 0;
    for (let i = 0; i + 2 < words.length; i++) {
      const key = words[i] + " " + words[i + 1] + " " + words[i + 2];
      tri[key] = (tri[key] ?? 0) + 1;
      if (tri[key] > maxTri) maxTri = tri[key];
    }
    degeneracy = rate(Math.max(0, maxTri - 2), 1000, words.length);
  }

  // Mixed-script confusables inside Latin words: homoglyph evasion is
  // itself near-deterministic evidence of adversarial machine text.
  const confusables = (text.match(/[a-zA-Z][Ѐ-ӿͰ-Ͽ][a-zA-Z]|[a-zA-Z]{2}[Ѐ-ӿͰ-Ͽ]|[Ѐ-ӿͰ-Ͽ][a-zA-Z]{2}/g) || []).length;

  // Weighted style-phrase lexicon (src/slop-lexicon.js) when present:
  // per-phrase log-odds, SpamAssassin-style, fully visible.
  let weighted = 0;
  const weights = typeof SLOP_WEIGHTS !== "undefined" ? SLOP_WEIGHTS
    : (typeof module !== "undefined" && (() => { try { return require("./slop-lexicon.js").SLOP_WEIGHTS; } catch { return undefined; } })());
  if (weights) {
    for (const [phrase, weight] of weights) {
      let from = 0;
      while (true) {
        const at = lower.indexOf(phrase, from);
        if (at < 0) break;
        weighted += weight;
        from = at + phrase.length;
      }
    }
    weighted = rate(weighted, 1000, wordCount);
  }

  // Formal-human counter-evidence: citations, bracketed references, URLs,
  // parenthesized years, inline numbers with units. Formal HUMAN prose
  // (abstracts, news, books) produces these; generators mostly do not.
  // This is what stops the phrase channels misreading formal humans as
  // machines, without blinding them to chat-register machine text.
  const formalHumanHits =
    (text.match(/\[\d{1,3}\]/g) || []).length
    + (text.match(/\((?:19|20)\d{2}[a-z]?\)/g) || []).length
    + (text.match(/\bhttps?:\/\/|\bdoi\.org|\bwww\./gi) || []).length
    + (text.match(/\bet al\.?/gi) || []).length
    + (text.match(/\b(?:Fig\.|Figure \d|Table \d|Eq\.)/g) || []).length
    + (text.match(/\bpp?\.\s?\d/g) || []).length;
  const formalHumanRate = rate(formalHumanHits, 1000, wordCount);

  // Register gate: phrase channels only apply to conversational text
  // (contractions, casual markers, or second-person address — chat
  // assistants say "you" incessantly). Formal prose of either class is
  // judged solely by register-free channels; register cannot separate
  // classes when the register IS the domain.
  const casualWeight = Math.min(1, 0.15 + contractionRate * 0.055 + humanRate * 0.16 + secondPerson * 0.035);
  
  const parts = {
    stylo: Math.max(-2.6, Math.min(2.6, stylo * 4.2)),
    degeneracy: Math.min(2.8, degeneracy * 0.9),
    confusable: confusables >= 2 ? Math.min(3.0, 1.2 + confusables * 0.1) : 0,
    lowBurst: burstiness < 0.45 ? (0.45 - burstiness) * 3.4 : 0,
    invisible: invisibles >= 2 ? Math.min(3.5, 1.5 + invisibleRate * 0.5) : 0,
    typos: -Math.min(3.2, typoRate * 1.35),
    formalHuman: -Math.min(3.4, formalHumanRate * 0.55),
    weighted: weights ? casualWeight * Math.max(-3.2, Math.min(3.6, weighted * 0.055)) : 0,
    slop: casualWeight * Math.min(4.2, slopRate * 0.52),
    structure: casualWeight * Math.min(1.1, structureRate * 0.22),
    uniform: uniformOpeners > 0.4 ? casualWeight * (uniformOpeners - 0.4) * 2.4 : 0,
    encyclopedic: casualWeight * Math.min(1.3, acronymExpansion * 0.8 + definitionOpener * 0.55),
    human: -Math.min(2.6, humanRate * 0.34)
  };
  for (const [name, value] of Object.entries(parts)) {
    if (value >= 0.25) reasons.push(`+${name}`);
    if (value <= -0.25) reasons.push(`-${name}`);
  }

  const raw = Object.values(parts).reduce((a, b) => a + b, 0);
  // Gentle squash: steep sigmoids pinned both classes at 1.0 and
  // destroyed threshold resolution at strict false-positive budgets.
  const score = 1 / (1 + Math.exp(-(raw - 0.8) * 0.85));
  // Flag conservatively: 0.98 is the measured ~5% false-positive point on
  // the held-out corpora; character forensics flag unconditionally because
  // their false-positive rate is effectively zero. Protecting users from
  // false accusations outranks catching every machine text.
  const isAiGenerated = score > 0.98 || parts.invisible > 0 || parts.confusable > 0;
  return { score, isAiGenerated, reasons, parts };
}

if (typeof module !== "undefined" && module.exports) module.exports = { slopScore };
