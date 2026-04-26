# AI Content Blocker

AI Content Blocker is a local-first Chrome extension that highlights likely AI-generated content on pages you browse. It is designed for manual installation from source, not Chrome Web Store distribution.

## Rights Notice

Copyright (c) 2026 Ryan Walsh. All rights reserved.

This repository is published for public viewing and professional reference only. No license is granted to use, copy, modify, distribute, deploy, or create derivative works from this software without prior written permission from Ryan Walsh. This codebase is proprietary commercial software and is not open source. See [LICENSE.md](LICENSE.md).

The extension works as a signal highlighter: it looks for text, image, media provenance, metadata, and page-context indicators, then shows badges and optional visual treatments. It does not claim certainty. Treat every result as a lead to inspect, not a final judgment.

## Features

- Highlights likely AI-generated text and image content on ordinary web pages.
- Shows confidence and evidence when a detected item is selected.
- Supports badge-only mode by default, plus optional blur, watermark, or hide modes.
- Provides popup controls for detection, image/text/video scanning, sensitivity, rescan, and settings.
- Supports local feedback logs so users can mark detections as AI or not AI.
- Includes optional crowd-learning support for self-hosted endpoints. This is disabled by default.
- Includes an optional crowd-learning server for aggregate feature votes and signed model updates.
- Builds a clean unpacked extension folder for local Chrome loading.
- Includes release gates for manifest integrity, permissions, syntax checks, privacy defaults, and server dependency audit.

## Privacy Model

Default behavior is local-first.

- Crowd learning is off by default.
- No default remote analytics endpoint is configured.
- The extension stores settings and local feedback in Chrome extension storage.
- Page URLs and content are not uploaded unless the user explicitly enables crowd learning and configures a trusted endpoint.
- Crowd-learning packets are intended to contain schema-like feature IDs and coarse feedback, not raw page text or full URLs.

The extension still needs broad host access because it runs content scripts on pages the user wants scanned. That permission is powerful, so the codebase keeps the required Chrome API permissions narrow: storage, tabs, alarms, and context menus.

## Manual Install

See [QUICKINSTALL.md](QUICKINSTALL.md).

Short version:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-local.ps1
```

Then open `chrome://extensions`, enable Developer mode, choose "Load unpacked", and select:

```text
dist\local
```

## Development

Run the release checks:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test-release.ps1
```

Or run the Node-only tests:

```powershell
npm test
```

The old simulated E2E script has been replaced with a manual checklist in [test/manual-e2e-checklist.md](test/manual-e2e-checklist.md). Do not treat manual checklist items as automated proof.

## Crowd Server

The crowd server is optional. It is not required for local extension use.

To test it:

```powershell
cd crowd-server
npm ci
cd ..
powershell -ExecutionPolicy Bypass -File .\scripts\test-release.ps1 -WithCrowdServerSelfTest
```

For a real deployment, generate your own signing keys and keep private keys out of the repository. Do not ship `.env`, `.dev-keys`, sqlite databases, or `node_modules`.

## Limitations

- AI detection is heuristic and can produce false positives and false negatives.
- Some sites prevent media inspection through browser or CORS rules.
- Content scripts run in Chrome's extension context, so page-level network interception is limited.
- Video analysis is off by default because it is heavier than image and text scanning.
- Manual installation means updates are manual unless you build your own distribution process.

## Release Standard

A clean local release should satisfy:

- `scripts/test-release.ps1` passes.
- `scripts/install-local.ps1` creates `dist\local`.
- Chrome loads `dist\local` without manifest or service-worker errors.
- Popup opens on an ordinary page.
- Rescan works.
- Crowd learning remains off until the user enables it and sets an endpoint.
- No private keys, sqlite files, or `node_modules` are included in the release folder.

