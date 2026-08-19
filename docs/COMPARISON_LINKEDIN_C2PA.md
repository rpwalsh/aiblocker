# How AI Content Blocker relates to LinkedIn's AI content badge ("CR")

LinkedIn now shows a small **"CR" badge** on images that carry signed
[C2PA Content Credentials](https://c2pa.org/): clicking it opens a panel
showing which tool made the image, when, and whether AI was involved. It is
part of a platform wave driven by the EU AI Act's Article 50 requirement
for machine-readable marking of AI-generated media (deployer obligations
landing August 2, 2026).

AI Content Blocker puts the **same badge-on-content experience** in the
user's own browser — on every site, not one platform — and keeps working
in the cases where disclosure-based labeling goes quiet.

## What's the same

| | LinkedIn "CR" badge | AI Content Blocker |
|---|---|---|
| UX primitive | inline badge anchored to the content | inline badge anchored to the content (`blockingMode: "none"` default — label, don't censor) |
| Provenance standard | reads signed C2PA Content Credentials | parses C2PA / Content Credentials markers, EXIF/XMP/IPTC (`src/content-agent-orange.js`) |
| Detail on demand | click badge → tool, date, AI role | badge → confidence, contributing signals, feedback controls |
| Non-destructive default | labels, never removes | badge-only by default; blur/hide/watermark are opt-in modes |

## What's different — and why it matters

**Disclosure-based labeling only works when the credential survives.**
LinkedIn's badge appears only for content that arrives *signed*. Screenshot
an AI image, re-encode it, or route it through any pipeline that strips
metadata, and the CR badge silently vanishes — the content most worth
flagging is precisely the content least likely to carry its papers.

AI Content Blocker covers that gap by design:

- **Detection, not just disclosure.** Text stylometry, image analysis,
  metadata, provenance, and page-context signals are combined; unsigned and
  unlabeled AI content still gets scored.
- **Stripped metadata is itself a signal.** Where LinkedIn's badge goes
  blank, the analyzer treats a suspiciously credential-free file as an AI
  indicator rather than an all-clear.
- **Everywhere, locally.** One platform's feed vs. every page you visit,
  evaluated on-device with privacy-preserving defaults and local feedback
  logs; crowd-learning model updates are signed and strictly opt-in.
- **User-tunable.** Confidence threshold, per-domain allow/deny lists, and
  blocking modes belong to the reader — not to the platform's policy team.

In short: LinkedIn's CR badge is the *publisher-disclosure* half of AI
content transparency. AI Content Blocker is the *reader-side* half — the
same badge language, applied by your own agent, including to content that
never asked to be labeled.

## Sources

- [LinkedIn & X AI Image Labels: C2PA & Made with AI (2026)](https://explainx.ai/blog/linkedin-content-credentials-c2pa-ai-images-2026)
- [That little "CR" badge on LinkedIn — what it means (Medium)](https://medium.com/@umesh382.kushwaha/that-little-cr-badge-on-linkedin-heres-what-it-actually-means-365ef5e725b6)
- [LinkedIn adds labels for AI-generated content (Social Media Today)](https://www.socialmediatoday.com/news/linkedin-labels-ai-generated-content/716674/)
