# Sprint 10.0E — iPhone Camera Preview Recovery

## Objective
Prevent Auto Juggler validation from starting until a real camera frame is rendered on iPhone Safari or the installed PWA.

## Changes
- Wait for camera metadata and a rendered frame before reporting ready.
- Verify non-zero video dimensions and a live video track.
- Retry playback once.
- Fall back through rear-camera and generic camera constraints.
- Keep Start Validation disabled until preview readiness is confirmed.
- Add temporary preview diagnostics for track state, ready state, dimensions, playback and frame receipt.
- Stop and clear the stream when leaving or backgrounding the feature.

## Validation gate
Real-device iPhone confirmation is still required before merge.
