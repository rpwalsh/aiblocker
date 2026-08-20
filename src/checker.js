/*
 * Copyright (c) 2026 Ryan P. Walsh
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Noncommercial use is free; commercial use requires a separate
 * license from the author. See LICENSE.
 */

// Checker tab: paste text, get the verdict, the in-place evidence, and a
// copyable receipt. Bonus forensics unique to pasting: the clipboard's
// HTML flavor fingerprints the source application deterministically.

(function () {
  "use strict";

  const KIND_STYLE = {
    invisible: { bg: "#7c3aed", fg: "#fff" },
    confusable: { bg: "#dc2626", fg: "#fff" },
    caseAnomaly: { bg: "#dc2626", fg: "#fff" },
    slop: { bg: "#fbbf24", fg: "#1f2937" },
    humanTell: { bg: "#34d399", fg: "#064e3b" },
    humanError: { bg: "#10b981", fg: "#fff" }
  };

  // Deterministic paste-source markers from the clipboard HTML flavor.
  const PASTE_SOURCES = [
    { name: "a ChatGPT conversation window", kind: "ai-ui", test: h => /data-message-author-role|result-streaming|chatgpt/i.test(h) },
    { name: "a chat interface (assistant-style markup)", kind: "ai-ui", test: h => /data-start=\"\d+\" data-end=\"\d+\"/.test(h) },
    { name: "Microsoft Word", kind: "editor", test: h => /urn:schemas-microsoft-com:office|class=\"?Mso|Microsoft Word/i.test(h) },
    { name: "Google Docs", kind: "editor", test: h => /docs-internal-guid/i.test(h) },
    { name: "LibreOffice", kind: "editor", test: h => /LibreOffice/i.test(h) }
  ];

  const input = document.getElementById("input");
  const verdictEl = document.getElementById("verdict");
  const rhythmEl = document.getElementById("rhythm");
  const evidenceEl = document.getElementById("evidence");
  const copyBtn = document.getElementById("copy");
  let lastResult = null;
  let lastText = "";
  let pasteProvenance = null;

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function render() {
    const text = input.value;
    lastText = text;
    if (text.trim().length < 120) {
      verdictEl.textContent = "Waiting for text (needs at least 120 characters)…";
      verdictEl.style.background = "#e5e7eb";
      verdictEl.style.color = "#111";
      rhythmEl.innerHTML = "";
      evidenceEl.textContent = "";
      lastResult = null;
      return;
    }
    const r = slopScore(text, { explain: true });
    lastResult = r;
    const pct = Math.round(r.score * 100);
    let line = r.isAiGenerated
      ? `Signals consistent with machine generation — ${pct}% score, ${r.findings.length} marked finding${r.findings.length === 1 ? "" : "s"}`
      : pct > 45
        ? `Uncertain — ${pct}% machine-likely; inspect the highlights`
        : `Signals consistent with human writing — ${pct}% score`;
    if (pasteProvenance) line += ` · pasted from ${pasteProvenance.name}`;
    verdictEl.textContent = line;
    verdictEl.style.background = (r.isAiGenerated || (pasteProvenance && pasteProvenance.kind === "ai-ui")) ? "#fee2e2" : pct > 45 ? "#fef3c7" : "#d1fae5";
    verdictEl.style.color = (r.isAiGenerated || (pasteProvenance && pasteProvenance.kind === "ai-ui")) ? "#991b1b" : pct > 45 ? "#92400e" : "#065f46";

    const lens = r.sentenceLengths || [];
    const max = Math.max(...lens, 1);
    rhythmEl.innerHTML = lens.slice(0, 80).map(l => `<div style="height:${Math.max(5, (l / max) * 42)}px" title="${l} words"></div>`).join("");

    const marks = [...r.findings].sort((a, b) => a.start - b.start || b.end - a.end);
    let html = "";
    let at = 0;
    for (const f of marks) {
      if (f.start < at) continue;
      html += esc(text.slice(at, f.start));
      const st = KIND_STYLE[f.kind] ?? { bg: "#9ca3af", fg: "#fff" };
      const body = f.kind === "invisible" ? "⟦" + f.label.split(" ")[2] + "⟧" : esc(text.slice(f.start, f.end));
      html += `<mark style="background:${st.bg};color:${st.fg}" title="${esc(f.label)}">${body}</mark>`;
      at = f.end;
    }
    evidenceEl.innerHTML = html + esc(text.slice(at));
  }

  input.addEventListener("paste", e => {
    try {
      const html = e.clipboardData && e.clipboardData.getData("text/html");
      pasteProvenance = null;
      if (html) {
        for (const src of PASTE_SOURCES) {
          if (src.test(html)) { pasteProvenance = src; break; }
        }
      }
    } catch { pasteProvenance = null; }
  });

  let timer = null;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(render, 250);
  });

  copyBtn.addEventListener("click", () => {
    if (!lastResult) return;
    const r = lastResult;
    const lines = [
      "SlopBlocker evidence report",
      new Date().toISOString(),
      pasteProvenance ? `Paste provenance: clipboard HTML identifies ${pasteProvenance.name}` : "Paste provenance: none detected in clipboard metadata",
      "",
      `Score: ${(r.score * 100).toFixed(0)}% machine-likely (flag threshold 69% = measured 5% false-positive budget)`,
      `Sentence rhythm (burstiness): ${r.burstiness?.toFixed(2)} (human prose usually > 0.45)`,
      "",
      "Findings:"
    ];
    if (!r.findings.length) lines.push("  (none — score rests on rhythm and style statistics alone)");
    for (const f of r.findings) {
      lines.push(`  [${f.kind}] chars ${f.start}-${f.end}: "${lastText.slice(f.start, Math.min(f.end, f.start + 40))}" — ${f.label}`);
    }
    lines.push("", "Every signal above is a deterministic, documented rule (no AI model was used to produce this report).", "This report is informational only. It is not proof of authorship or misconduct, has a measured error rate (see repository README), and must not be the sole basis for any accusation, grade, or adverse action. Methodology: github.com/rpwalsh/slopblocker");
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      copyBtn.textContent = "Copied ✓";
      setTimeout(() => { copyBtn.textContent = "Copy evidence report"; }, 1500);
    });
  });
})();
