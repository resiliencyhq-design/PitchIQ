# Sprint 12.5A — Adaptive Training Engine Foundation

## Objective

Create a passive, independently testable adaptive mission service without changing production behaviour.

## Included

- Five Football IQ construct model.
- Ten-mission catalogue.
- Balanced evidence-building rotation.
- Evidence thresholds for observations and confidence.
- Personalised selection when a reliable priority exists.
- Bounded mission-history storage.
- Unit tests for selection, thresholds, rotation and persistence.

## Explicitly excluded

- No app bootstrap import.
- No global loader.
- No Home, Train, Results or Player UI changes.
- No routing or onboarding changes.
- No automatic execution.
- No production feature activation.

## Integration contract

```js
import { AdaptiveTrainingEngine } from "../../src/training/adaptive-training-engine.js";

const selection = AdaptiveTrainingEngine.selectMission(playerProfile, {
  recentMissionIds,
});
```

The service returns a mission, source construct, selection mode and reason. A later sprint may call this service from the Training screen behind a safe fallback.

## Merge safety

Removing these new files must leave the app behaviour unchanged. This sprint is intentionally passive and cannot affect startup or navigation.
