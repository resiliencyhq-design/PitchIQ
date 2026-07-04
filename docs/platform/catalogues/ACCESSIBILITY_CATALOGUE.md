# Accessibility Catalogue v0.1

Status: Draft  
Sprint: PF-13  
Reference implementation: PitchIQ

## Purpose

This catalogue records the first accessibility baseline for PitchIQ.

## Accessibility areas

| Area | Baseline | Priority |
|---|---|---|
| Semantic controls | Buttons used for markers/CTAs | Maintain |
| Labels | Several aria labels exist | Improve coverage |
| Focus states | Marker focus-visible exists | Expand |
| Reduced motion | Marker animation support exists | Expand to all motion |
| Touch targets | Buttons generally large | Verify all controls |
| Contrast | Strong dark/neon contrast generally | Formal test needed |
| Screen reader support | Partial | Needs audit |
| Keyboard navigation | Partial | Needs audit |
| Forms | Name input labelled | Maintain/improve |

## Accessibility principles

1. Every interactive element must have a clear accessible name.
2. Every keyboard-focusable element must have a visible focus state.
3. Motion must respect reduced-motion preferences.
4. Touch targets should meet mobile minimums.
5. Decorative assets should not create screen reader noise.
6. Game-like UI must still be understandable to assistive technologies.
