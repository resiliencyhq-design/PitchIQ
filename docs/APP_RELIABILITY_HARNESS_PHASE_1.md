# App Reliability Harness — Phase 1

## Repository audit

- Application: Vite-based browser app with a vanilla JavaScript production runtime and a separate React/Puck Studio.
- Existing scripts: `dev`, `build`, Node test runner, and Capacitor iOS commands.
- Routing: in-memory route rendering in `js/app/main.js`, with hash-based Academy module ownership.
- First-run authority: `FirstRunController`, persisted under `pitchiqFirstRun`.
- Canonical player state: `pitchiq_integrated_v1`, maintained through `PlayerService`.
- Compatibility keys remain in use by current and legacy modules, including player name, jersey number, selected position, player style, avatars, Academy acceptance, guardian email, contract state, onboarding completion, and migration state.
- Existing regression coverage: broad Node `node:test` suites, including first-run and Academy ownership tests. No real-browser end-to-end harness existed before this phase.
- Existing CI: no dedicated Playwright reliability workflow was found in the audited repository tree.

## Phase 1 coverage

The Playwright suite runs in desktop Chromium and an iPhone 13 WebKit project and covers:

1. Complete first-run journey from Landing to Home.
2. Returning-player startup and reload.
3. Player Reset and storage cleanup.
4. Bottom-navigation routing for Home, Train, Results, and Player.
5. Browser startup health, including page errors, console errors, and failed first-party requests.

## Evidence retained on failure

- screenshot
- video
- Playwright trace
- HTML report
- JUnit result file

## Scope boundaries

This phase does not add visual-regression baselines, exploratory crawling, deployed-URL testing, or product behaviour changes. It also does not replace physical-device validation for iOS Safari/PWA lifecycle behaviour, camera permissions and feeds, accelerometer/device motion, or haptics.

## Local commands

```bash
npm ci
npx playwright install chromium webkit
npm run test:e2e
```

Run all current checks with:

```bash
npm run test:reliability
```
