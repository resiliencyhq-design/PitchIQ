# PitchIQ / WellTrackIQ Studio

Internal visual builder sandbox for PitchIQ layouts.

This Studio is intentionally separate from the existing MVP app.

## Run locally

```bash
npm install
npm run studio
```

Then open the Studio route served by Vite.

## Scope

- Uses React and Puck in `/studio` only.
- Does not replace the existing MVP screens.
- Does not change Splash, Onboarding, Home, Training, or Results routing.
- Saves v1 layout JSON to localStorage under `pitchiqPuckStudioLayoutV1`.
- Production PitchIQ remains source-of-truth until layouts are manually promoted.

## Starter templates

- Splash
- Onboarding
- Home Dashboard
- Drill
- Blank

## Starter components

- Heading
- Text
- Button
- Card
- Image placeholder
- Pitch selector placeholder
- Progress card
