# Sprint N3 — Scheduled Notification Delivery Architecture

## Goal
Make saved training reminder preferences produce real device notifications at the selected local time and weekday, including when PitchIQ is not open.

## Audit finding
The current web app stores reminder preferences and requests browser permission, but it deliberately unregisters service workers and clears PitchIQ caches in `index.html`. There is no push subscription, notification scheduler, backend job, or native wrapper bridge. Therefore a true background reminder cannot be implemented safely as a frontend-only timer.

## Architecture decision
Use an installed PWA with one canonical, versioned service worker and a small scheduled Web Push backend. This is the recommended production path because it preserves the existing web deployment model while enabling closed-app delivery on supported installed PWAs.

The legacy service-worker retirement logic must remain in place until the canonical worker is introduced. N3.1 must change that migration narrowly so it retires only obsolete registrations and caches, never the new canonical worker.

## Required architecture

### 1. PWA service worker
- Register a dedicated, versioned service worker in production.
- Handle `push` events and display notifications with `showNotification()`.
- Handle `notificationclick` and route actions such as Train Now or View Results.
- Preserve the existing legacy-worker retirement migration without continuously unregistering the new worker.
- Do not enable offline asset caching in N3.1; notification delivery and app caching remain separate concerns.

### 2. Push subscription
- Request notification permission from a direct user action.
- Create a `PushManager` subscription using the application server public key.
- Send the subscription and user reminder preferences to a backend endpoint.
- Replace or remove stale subscriptions when permission, browser installation, or endpoint state changes.
- Store the application-server private key only in backend secret storage; never commit it to the repository or expose it to the client.

### 3. Scheduling backend
- Persist subscription endpoint, encryption keys, timezone, local reminder time, weekdays, enabled status, and last-delivered occurrence.
- Run a scheduled worker at least once per minute.
- Resolve due reminders in the player's timezone.
- Send Web Push messages and record delivery attempts.
- Deduplicate by subscription plus scheduled occurrence.
- Disable subscriptions returning terminal responses such as HTTP 404 or 410.

### 4. Privacy and safety
- Store only the minimum notification-delivery data.
- Do not include sensitive player information in notification payloads.
- Use generic copy such as “Time to train ⚽”.
- Provide a clear disable path that removes or deactivates the server schedule.

## Delivery slices

### N3.1 — Service-worker foundation
- Stop the legacy retirement script from unregistering the new canonical worker.
- Add service-worker registration and lifecycle update handling.
- Add push and notification-click handlers.
- Keep production behaviour unchanged until a valid push subscription exists.
- Add a feature flag or capability gate so unsupported browsers retain the current in-app-only experience.

### N3.2 — Subscription API contract
- Add client subscription management.
- Define backend request and response schemas.
- Add validation and permission/error states in the Notification Centre.
- No fake success message when only local preferences have been saved.
- Treat enabling reminders as complete only after the backend acknowledges an active subscription and schedule.

### N3.3 — Scheduler and Web Push delivery
- Add persistent storage and scheduled processing.
- Send reminders at selected times and weekdays.
- Add idempotency, retry policy, stale-subscription cleanup, and delivery logs.
- Keep VAPID/private signing credentials in deployment secrets.

### N3.4 — Reliability and acceptance tests
- Confirm reminder delivery with the app closed on installed iPhone PWA and supported desktop browsers.
- Confirm edits reschedule correctly.
- Confirm disabling reminders prevents future delivery.
- Confirm timezone and daylight-saving changes are respected.
- Confirm duplicate messages are not delivered.
- Confirm unsupported or non-installed browser states show accurate guidance rather than a successful scheduling message.

## Release gates
N3.1 may merge without a backend because it changes no user-visible scheduling promise. N3.2 and N3.3 must not ship independently in a state where the UI claims reminders are active but the server schedule is unavailable. The production enablement gate is an end-to-end test showing one selected reminder delivered while the installed app is closed.

## Scope boundary
GitHub repository changes alone cannot provide reliable background notification delivery unless a backend hosting/runtime and Web Push application-server credentials are configured. This architecture prevents the current UI from being mistaken for a completed scheduler and establishes the implementation sequence for the selected PWA plus scheduled-backend design.