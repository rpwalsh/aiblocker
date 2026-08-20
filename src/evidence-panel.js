/*
 * Copyright (c) 2026 Ryan P. Walsh
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Noncommercial use is free; commercial use requires a separate
 * license from the author. See LICENSE.
 */

// Evidence panel: "detection you can defend." Renders a selected text's
// verdict with every finding highlighted in place, hidden characters made
// visible, a sentence-rhythm chart, and a copy-ready plain-text report.
// Shadow DOM, zero dependencies, zero network.

(function () {
  "use strict";
  if (window.__slopEvidencePanel) return;

  const KIND_STYLE = {
    invisible: { bg: "#7c3aed", fg: "#fff", tag: "HIDDEN" },
    confusable: { bg: "#dc2626", fg: "#fff", tag: "LOOK-ALIKE" },
    caseAnomaly: { bg: "#dc2626", fg: "#fff", tag: "CASE" },
    slop: { bg: "#fbbf24", fg: "#1f2937", tag: "AI PHRASE" },
    humanTell: { bg: "#34d399", fg: "#064e3b", tag: "HUMAN" },
    humanError: { bg: "#10b981", fg: "#fff", tag: "HUMAN SLIP" }
  };

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlighted(text, findings) {
    const marks = [...findings].sort((a, b) => a.start - b.start || b.end - a.end);
    let out = "";
    let at = 0;
    for (const f of marks) {
      if (f.start < at) continue; // overlapping: first wins
      out += esc(text.slice(at, f.start));
      const st = KIND_STYLE[f.kind] ?? { bg: "#9ca3af", fg: "#fff", tag: f.kind };
      const body = f.kind === "invisible" ? "⟦" + f.label.split(" ")[2] + "⟧" : esc(text.slice(f.start, f.end));
      out += `<mark style="background:${st.bg};color:${st.fg};padding:0 2px;border-radius:3px" title="${esc(f.label)}">${body}</mark>`;
      at = f.end;
    }
    return out + esc(text.slice(at));
  }

  function rhythmChart(lengths) {
    if (!lengths || lengths.length < 3) return "";
    const max = Math.max(...lengths, 1);
    const bars = lengths.slice(0, 60).map(l =>
      `<div style="flex:1;background:#60a5fa;border-radius:1px;height:${Math.max(6, (l / max) * 46)}px" title="${l} words"></div>`
    ).join("");
    return `<div style="display:flex;align-items:flex-end;gap:2px;height:50px;margin:6px 0">${bars}</div>`;
  }

  function plainReport(text, result) {
    const lines = [
      "SlopBlocker evidence report",
      new Date().toISOString(),
      "",
      `Score: ${(result.score * 100).toFixed(0)}% machine-likely (flag threshold 69%; measured 5% false-positive budget)`,
      `Sentence rhythm (burstiness): ${result.burstiness?.toFixed(2)} (human prose usually > 0.45)`,
      "",
      "Findings:"
    ];
    if (!result.findings.length) lines.push("  (none — no individual markers; score rests on rhythm and style statistics)");
    for (const f of result.findings) {
      lines.push(`  [${f.kind}] chars ${f.start}-${f.end}: "${text.slice(f.start, Math.min(f.end, f.start + 40))}" — ${f.label}`);
    }
    lines.push("", "Every signal above is a deterministic, documented rule (no AI model was used to produce this report).", "This report is informational only. It is not proof of authorship or misconduct, has a measured error rate (see repository README), and must not be the sole basis for any accusation, grade, or adverse action. Methodology: github.com/rpwalsh/slopblocker");
    return lines.join("\n");
  }

  function show(text, result) {
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;top:16px;right:16px;z-index:2147483647";
    const root = host.attachShadow({ mode: "closed" });
    const pct = Math.round(result.score * 100);
    const verdict = result.isAiGenerated
      ? `Signals consistent with machine generation — ${pct}% score, ${result.findings.length} marked finding${result.findings.length === 1 ? "" : "s"}`
      : pct > 45
        ? `Uncertain — ${pct}%; inspect the highlights`
        : `Signals consistent with human writing — ${pct}% score`;
    const color = result.isAiGenerated ? "#dc2626" : pct > 45 ? "#d97706" : "#059669";
    root.innerHTML = `
      <div style="width:420px;max-height:70vh;overflow:auto;background:#fff;color:#111;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.25);font:13px/1.5 system-ui,sans-serif">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid #eee">
          <strong style="color:${color}">${verdict}</strong>
          <button id="x" style="border:0;background:none;font-size:16px;cursor:pointer">✕</button>
        </div>
        <div style="padding:10px 14px">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em">Sentence rhythm</div>
          ${rhythmChart(result.sentenceLengths)}
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-top:8px">Evidence, in place</div>
          <div style="white-space:pre-wrap;word-break:break-word;background:#f9fafb;border-radius:8px;padding:10px;margin-top:4px">${highlighted(text, result.findings)}</div>
          <button id="copy" style="margin-top:10px;padding:7px 12px;border:1px solid #d1d5db;border-radius:8px;background:#f3f4f6;cursor:pointer">Copy evidence report</button>
          <span id="copied" style="margin-left:8px;color:#059669;display:none">copied</span>
          <div style="margin-top:8px;font-size:11px;color:#6b7280">Every highlight is a documented deterministic rule — nothing here was judged by an AI. A lead to inspect, not a verdict. This is not proof of authorship or misconduct and must not be the sole basis for any accusation or adverse action.</div>
        </div>
      </div>`;
    root.getElementById("x").onclick = () => host.remove();
    root.getElementById("copy").onclick = () => {
      navigator.clipboard.writeText(plainReport(text, result)).then(() => {
        root.getElementById("copied").style.display = "inline";
      });
    };
    document.documentElement.appendChild(host);
  }

  window.__slopEvidencePanel = {
    inspect(text) {
      if (!text || text.trim().length < 120) {
        show(text || "", { score: 0, isAiGenerated: false, findings: [], sentenceLengths: [], burstiness: 1 });
        return;
      }
      const result = typeof slopScore === "function" ? slopScore(text, { explain: true }) : null;
      if (result) show(text, result);
    }
  };
})();
