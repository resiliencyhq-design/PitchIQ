# PitchIQ Feature Boundaries v1.0

Status: **LOCKED**

This document defines the MVP module boundaries for PitchIQ. Future feature work must preserve these boundaries unless an explicit architecture change is approved.

## 1. Onboarding & Academy

Owns the complete first-run journey:

Landing → Name → Number → Position → Discover Your Strengths → Academy Orientation → Academy Accepted → Avatar → Home handoff

Responsibilities:
- first-run routing
- initial player creation
- academy acceptance
- avatar selection
- completion handoff to Home

This module must not own Home, Mission, Results, or Player/Profile rendering after onboarding is complete.

## 2. Home

Owns the daily hub:

- player hero
- Football IQ summary
- Today’s Mission entry
- Explore carousel
- training stats
- bottom navigation

Home may navigate into other modules but must not implement their internal screens or lifecycle logic.

## 3. Mission

Owns the mission lifecycle:

Mission Brief → Activity → Results handoff → Mission Complete

Canonical lifecycle:

assigned → briefed → active → results_ready → completed

Optional terminal state: abandoned

Mission may read shared player data but must not own player identity storage or onboarding state.

## 4. Results

Owns performance feedback:

- session results
- history
- progress
- insights
- charts and feedback presentation

Results may read mission output and shared player data. Results changes must not alter onboarding, Home composition, Mission routing, or Player/Profile ownership unless explicitly approved.

## 5. Player / Profile

Owns persistent player identity and progression data:

- name
- number
- position
- avatar
- XP
- level
- inventory
- settings

This module is the single source of truth for shared player information.

Onboarding may create the initial values. Profile editing may update them later. Home, Mission, and Results must read from the same canonical player profile rather than maintaining duplicate copies.

## Shared Data Contract

Cross-module communication must use a narrow shared contract.

Examples:
- Onboarding writes the initial player profile.
- Profile editing updates the same profile.
- Home, Mission, and Results read from that profile.
- Mission writes mission outcome data.
- Results reads mission outcome data.

A module must not directly rewrite another module’s internal DOM, routes, lifecycle state, or implementation files.

## Change Rules

1. Changes inside one module must remain inside that module unless cross-module work is explicitly approved.
2. New shared data must be added through the shared contract, not duplicated in multiple modules.
3. Feature entry points must have one interaction owner.
4. Temporary hotfix modules, duplicate listeners, and global MutationObservers must not become permanent architecture.
5. Future modules may be added additively when required.

Potential future modules include:
- Learning Academy
- Lab
- MindIQ
- CalmSense
- Coach Intelligence
- Rewards & Shop
- Team / Social
- Notifications
- Settings

## Regression Guard

Any pull request affecting routing, script loading, shared storage keys, or global event listeners must verify these flows remain intact:

1. First run: Landing → Onboarding → Discover Your Strengths → Academy → Home
2. Home → Mission Brief → Activity → Results → Mission Complete → Home
3. Profile name change is reflected in Home, Mission, and Results without rerunning onboarding
4. Results changes do not remove or bypass onboarding screens
5. Mission changes do not replace Results or Player/Profile ownership

These five modules are locked as the PitchIQ MVP architecture v1.0.
