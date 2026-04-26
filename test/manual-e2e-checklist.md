# Manual E2E Checklist

This is a manual checklist, not an automated test. Record browser version, extension folder, and date when using it as release evidence.

## Install

- [ ] Run `scripts\install-local.ps1`.
- [ ] Load `dist\local` in `chrome://extensions`.
- [ ] Confirm no manifest errors are shown.
- [ ] Confirm the service worker starts.

## Basic Use

- [ ] Visit a normal content page.
- [ ] Open the toolbar popup.
- [ ] Toggle Detection Enabled off and on.
- [ ] Click Rescan Page.
- [ ] Open Settings.
- [ ] Change sensitivity and save.
- [ ] Confirm Settings shows Crowd Learning off by default.

## Detection

- [ ] Visit a page with obvious AI provenance text, such as image alt text or metadata references.
- [ ] Confirm a badge appears when detection crosses the threshold.
- [ ] Click a highlighted item and confirm the popup details panel can show evidence.
- [ ] Confirm badge-only mode does not blur or hide content.
- [ ] Confirm blur/watermark/hide modes apply when selected.

## Privacy

- [ ] Leave Crowd Learning disabled and verify no configured endpoint exists.
- [ ] Enable Crowd Learning only with a local or trusted endpoint.
- [ ] Confirm explicit feedback is required before uploads are attempted.

## Uninstall

- [ ] Remove the extension from `chrome://extensions`.
- [ ] Confirm pages no longer show badges after reload.

