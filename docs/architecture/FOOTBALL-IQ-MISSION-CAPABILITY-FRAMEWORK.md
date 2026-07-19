# Football IQ Mission Capability Framework

## Decision

PitchIQ will use one shared mission runtime with capability-gated mission modules.

A mission does not receive every platform feature at runtime. It declares only the capabilities it needs. Future capabilities may be registered safely while remaining dormant until implemented and explicitly requested by a mission.

## Sprint 20.0 scope

This sprint establishes:

- a canonical capability registry;
- implementation status for active, interface-only and future capabilities;
- one module definition for each of the ten adaptive Football IQ missions;
- a runtime resolver that activates only requested, available capabilities;
- explicit dormant handling for future capabilities;
- validation and regression tests.

This sprint does not replace the current live-rep UI or claim that planned mission experiences are complete.

## Capability states

- `active`: available for runtime adapters now.
- `interface_only`: contract reserved; implementation may be added without redesigning the module registry.
- `future`: known platform direction, always dormant until promoted.

## Runtime rule

The selected mission is resolved to a module definition. The module lists its required capabilities. The runtime then separates those capabilities into enabled and dormant collections.

Capabilities not listed by the module are never activated.

Example: `predict-next` requests scenario, tactical-board and prediction-quality capabilities. It does not request colour cues, voice input, camera tracking or wearables.

## Mission rollout after the foundation

1. Connect adaptive mission selection to the new runtime resolver.
2. Build the Scan First runtime adapter as the reference implementation.
3. Add Spot the Cue.
4. Add prediction and pressure-reading scenario modules.
5. Add decision-quality modules.
6. Add adaptability modules.
7. Add space and positioning modules.
8. Connect module-specific evidence payloads to the unified evidence store.

## Guardrails

- No silent fallback from an unknown mission to Colour Scan.
- No capability may activate unless the selected module requests it.
- Future capabilities remain dormant even when named in a module.
- Shared lifecycle, rewards and evidence infrastructure must not be duplicated inside individual mission modules.
- Mission-specific scoring must identify the Football IQ construct it supports.
