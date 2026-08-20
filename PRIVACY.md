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

## The one optional network feature: crowd learning (off by default)

If — and only if — you explicitly enable crowd learning and configure an
endpoint, the extension uploads votes of the following shape and nothing
else:

- a coarse vote ("ai" / "not_ai"),
- schema-controlled feature identifiers (fixed token strings defined in
  the source code — never page content, never text, never URLs, never
  domains),
- optional on-device-hashed subfeature tokens (the server never sees the
  raw strings),
- a day bucket and a rotating daily cohort value (no stable user id),
- an optional content identifier hashed together with the day so it
  cannot be linked across days.

The upload code path enforces an allowlist pattern on every identifier
before anything leaves the device (`src/background.js`). No account, no
email, no cookies, no analytics, no third-party services.

## Permissions, explained

- `<all_urls>` host access: required to analyze content in the pages you
  visit and to fetch image bytes for metadata forensics. Used for
  analysis only; nothing is reported out.
- `storage`: your settings and local counters.
- `tabs`, `contextMenus`, `alarms`: opening the checker tab, the
  right-click inspect action, and periodic local maintenance.

## Data requests

There is nothing to request: the author operates no server that receives
your content, and the optional crowd endpoint (if you run one) receives
only the token shapes described above.
