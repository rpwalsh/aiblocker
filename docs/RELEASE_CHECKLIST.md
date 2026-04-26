# Release Checklist

Use this before sharing the local-install source folder.

## Required

- [ ] Run `powershell -ExecutionPolicy Bypass -File .\scripts\test-release.ps1`.
- [ ] Run `powershell -ExecutionPolicy Bypass -File .\scripts\install-local.ps1`.
- [ ] Load `dist\local` in Chrome with Developer mode.
- [ ] Confirm the service worker starts without errors in `chrome://extensions`.
- [ ] Confirm the popup opens on a normal page.
- [ ] Confirm "Rescan Page" sends without popup errors.
- [ ] Confirm Settings saves and applies.
- [ ] Confirm Crowd Learning is disabled by default.
- [ ] Confirm no `.env`, `.dev-keys`, sqlite files, or `node_modules` are included in the shared folder.

## Optional Crowd Server

- [ ] Run `npm ci` in `crowd-server`.
- [ ] Run `powershell -ExecutionPolicy Bypass -File .\scripts\test-release.ps1 -WithCrowdServerSelfTest`.
- [ ] Generate production signing keys outside the repository.
- [ ] Set `MODEL_SIGNING_PRIVATE_KEY_PEM` in the runtime environment, not in source.
- [ ] Set the extension Crowd Server Endpoint to a trusted server URL.

