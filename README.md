# PitchIQ Patch 0 — Stability Recovery

Built from known-good commit `42a03cd`.

This patch deliberately preserves the existing architecture.

Changed only:
- `index.html`
- `js/app/main.js`
- `README.md`

Purpose:
- Restore a known-good working build.
- Add defensive state normalization.
- Add a render error boundary so future bugs show an error card instead of a blank stadium background.
- Add a boot watchdog to detect JavaScript failure.

Upload all contents to the root of the GitHub repository.
