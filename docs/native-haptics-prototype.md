# PitchIQ Native Haptics Prototype

This feasibility layer keeps the existing PitchIQ Vite/PWA experience and adds an optional Capacitor iOS shell for Core Haptics.

## What is included

- Capacitor configuration and npm scripts.
- A JavaScript bridge that preserves the existing `navigator.vibrate()` fallback.
- Lab controls for Haptics On/Off, Gentle/Medium/Strong intensity and a test action.
- A Swift `PitchIQHaptics` Capacitor plugin using `CHHapticEngine`.
- Automatic stop requests on session stop, route exit, page hide and app backgrounding.

## Generate the iOS project

Run on a Mac with current Node, Xcode and CocoaPods/SPM support:

```bash
npm install
npm run build
npm run ios:add
npm run ios:sync
npm run ios:open
```

After `npx cap add ios`, add `native/ios/PitchIQHapticsPlugin.swift` to the **App** target in Xcode. Confirm the file has App target membership, then build on a physical iPhone that supports Core Haptics.

The generated `ios/` project is intentionally not committed by this feasibility PR because it is machine-generated and requires Apple signing configuration. Once the app identifier and signing team are confirmed, the generated project can be committed in a separate release-preparation sprint if desired.

## Device test

1. Install the Xcode build on a physical iPhone.
2. Open Home → Lab → Vibro Focus.
3. Confirm the capability banner says Native Core Haptics detected.
4. Use **Test iPhone haptic** at Gentle, Medium and Strong.
5. Run Calm, Focus, Reset and Recover.
6. Confirm **Stop Session**, leaving the route and backgrounding the app stop output immediately.
7. Confirm the standard web build still reports visual preview when neither Core Haptics nor browser vibration is available.

## Limits

- Safari/PWA alone still cannot access Core Haptics.
- Intensity is device-dependent and must be validated on real hardware.
- This is an experimental wellbeing feature, not a medical or therapeutic device.
