# PitchIQ Patch 0.1 — Import Fix

Built from Patch 0 Stability Recovery.

Fix:
- Removed missing imports `renderCollection` and `renderArt` from `js/app/main.js`.
- Removed route handlers for `collection` and `art`.

Reason:
The browser error showed:
`Importing binding name 'renderCollection' is not found.`

This patch keeps the architecture unchanged and fixes the JavaScript module load failure.
