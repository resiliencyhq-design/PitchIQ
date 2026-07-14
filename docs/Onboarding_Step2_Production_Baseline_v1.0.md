# Onboarding Step 2 — Production Baseline v1.0

**Status:** LOCKED  
**Approved:** 14 July 2026  
**Validated build:** merge commit `e6497b8f5b063fb6e885306be2232e9d89491c58`  
**Primary validation case:** Attacking Midfielder on iPhone

## Purpose

This document records the approved production baseline for Onboarding Step 2: position selection.

Future work must treat this screen as regression-only. Visual or behavioural changes require an explicitly approved new sprint.

## Locked visual baseline

The following elements are frozen:

- Step indicator and progress styling
- “MAKE IT YOURS” label
- “Choose your favourite position” typography
- Pitch dimensions, perspective and vertical placement
- Marker assets, size and coordinates
- Selected marker styling
- Tactical connection lines
- Marker and line animations
- Selected Position panel size, spacing and placement
- Position title and tactical-description typography
- Continue button size, design and placement
- Standard and short-screen iPhone spacing

## Locked behaviour

The following behaviour is frozen:

- No position selected by default
- One selected position at a time
- Immediate selected-puck visual update
- Tactical links generated for the selected position
- Haptic behaviour
- Continue enabled only after a valid selection
- No scrolling required on supported iPhone layouts

## Validation evidence

The approved layout was visually validated on a real iPhone using the longest-description case:

- Attacking Midfielder panel fully visible
- Full tactical description visible
- Continue button fully visible
- Pitch centred and unobstructed
- No scrolling required
- No clipping at the lower safe area

Additional positions previously checked include Goalkeeper and Right Back.

## Change control

Changes to Step 2 are permitted only when one of the following applies:

1. A reproducible regression is identified.
2. A supported-device compatibility defect is confirmed.
3. A new Step 2 sprint is explicitly approved by the Product Owner.

Any permitted change must preserve this baseline unless the replacement target is separately approved and validated.

## Regression checklist

Before merging work that could affect onboarding, confirm:

- Heading size and weight are unchanged
- Pitch size and placement are unchanged
- All markers remain aligned
- Selected marker and tactical lines remain correct
- Attacking Midfielder description fits fully
- Continue button remains fully visible
- Step 2 requires no scrolling
- iPhone safe areas remain respected
