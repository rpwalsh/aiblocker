# Quick Install

Use these steps to run AI Content Blocker locally in Chrome.

## 1. Prepare The Extension

Open PowerShell in this folder:

```powershell
cd C:\Users\react\OneDrive\Desktop\wtg-repos\!clean\aiblocker
powershell -ExecutionPolicy Bypass -File .\scripts\install-local.ps1
```

The script runs release checks, generates icons, and creates:

```text
dist\local
```

## 2. Load In Chrome

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Enable Developer mode.
4. Click "Load unpacked".
5. Select the `dist\local` folder.

## 3. Verify

1. Open any normal website.
2. Click the AI Content Blocker toolbar icon.
3. Confirm the popup opens.
4. Click "Rescan Page".
5. Open "Settings" and confirm Crowd Learning is off unless you choose to enable it.

## Optional: Launch A Temporary Chrome Profile

This does not install into your normal Chrome profile. It starts Chrome with a local profile under this project folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-local.ps1 -LaunchChrome
```

