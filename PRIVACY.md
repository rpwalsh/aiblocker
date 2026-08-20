# Privacy

SlopBlocker is local-first by design. This document states exactly what
data the extension touches, in language intended to be checkable against
the source code in this repository.

## What stays on your machine (everything, by default)

- The pages you visit, the text analyzed, images, audio, and video:
  **never transmitted anywhere.** All detection runs in your browser.
- The Paste Checker tab performs **no network requests and no storage**:
  pasted text exists only in that tab and is gone when you close it.
- Evidence reports are generated locally and placed on your clipboard
  only when you click the copy button.
- Settings and local statistics live in your browser's extension storage
  on your device.

## Network: none

The former opt-in crowd-learning feature has been removed. The extension
makes no network requests of its own; feedback you give on flags is
stored only on your device.

## Permissions, explained

- `<all_urls>` host access: required to analyze content in the pages you
  visit and to fetch image bytes for metadata forensics. Used for
  analysis only; nothing is reported out.
- `storage`: your settings and local counters.
- `tabs`, `contextMenus`, `alarms`: opening the checker tab, the
  right-click inspect action, and periodic local maintenance.

## Data requests

There is nothing to request: no server operated by the author ever
receives your content or your activity.
