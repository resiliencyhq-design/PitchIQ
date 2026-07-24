# Platform 2.0 — Sprint D2: Browser First-Run Proof

## Objective

Provide deterministic browser-level evidence for startup, first-run state, returning-player entry, mid-flow resume and reset across desktop Chromium and iPhone-sized WebKit.

## Coverage added

- Fresh storage starts at Landing with protected navigation hidden.
- Returning-player canonical state opens the main app with navigation visible.
- Mid-onboarding canonical state resumes the Number step after load and refresh.
- Developer reset clears canonical profile and first-run state and returns to Landing.
- Page errors, console errors, unhandled rejections and failed requests are collected as test failures.
- Screenshots, traces and videos are retained only when a test fails.
- Retries run only in CI.

## Execution

```sh
npm install
npx playwright install --with-deps
npm run test:e2e
```

The Playwright web server starts the existing Vite app locally. No deployed production URL is required.

## Projects

- Desktop Chromium
- iPhone 15 Pro WebKit

## Verification status

The test files and configuration are committed and registered. Successful execution is not claimed until CI or a local repository run provides evidence.
