# Sprint N3 — Scheduled Notification Delivery Architecture

## Goal
Make saved training reminder preferences produce real device notifications at the selected local time and weekday, including when PitchIQ is not open.

## Audit finding
The current web app stores reminder preferences and requests browser permission, but it deliberately unregisters service workers and clears PitchIQ caches in `index.html`. There is no push subscription, notification scheduler, backend job, or native wrapper bridge. Therefore a true background reminder cannot be implemented safely as a frontend-only timer.

## Required architecture

### 1. PWA service worker
- Register a dedicated, versioned service worker in production.
- Handle `push` events and display notifications with `showNotification()`.
- Handle `notificationclick` and route actions such as Train Now or View Results.
- Preserve the existing legacy-worker retirement migration without continuously unregistering the new worker.

### 2. Push subscription
- Request notification permission from a direct user action.
- Create a `PushManager` subscription using the application server public key.
- Send the subscription and user reminder preferences to a backend endpoint.
- Replace or remove stale subscriptions when permission, browser installation, or endpoint state changes.

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

### N3.2 — Subscription API contract
- Add client subscription management.
- Define backend request and response schemas.
- Add validation and permission/error states in the Notification Centre.
- No fake success message when only local preferences have been saved.

### N3.3 — Scheduler and Web Push delivery
- Add persistent storage and scheduled processing.
- Send reminders at selected times and weekdays.
- Add idempotency, retry policy, stale-subscription cleanup, and delivery logs.

### N3.4 — Reliability and acceptance tests
- Confirm reminder delivery with the app closed on installed iPhone PWA and supported desktop browsers.
- Confirm edits reschedule correctly.
- Confirm disabling reminders prevents future delivery.
- Confirm timezone and daylight-saving changes are respected.
- Confirm duplicate messages are not delivered.

## Scope boundary
GitHub repository changes alone cannot provide reliable background notification delivery unless a backend hosting/runtime and Web Push application-server credentials are selected. This architecture document prevents the current UI from being mistaken for a completed scheduler and provides the implementation sequence for the next infrastructure decision.
