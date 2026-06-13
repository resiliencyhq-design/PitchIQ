# PitchIQ Patch 4.2.1 — Route Export Compatibility Fix

Fixes the live error:

`Importing binding name 'renderCollection' is not found.`

This patch adds compatibility exports to `js/app/routes.js` so any main.js version that imports `renderCollection` or `renderArt` will not crash.

Changed:
- `js/app/routes.js`
- `README.md`

Upload all contents to the root of the GitHub repository.
