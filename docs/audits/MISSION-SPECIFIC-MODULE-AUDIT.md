# Mission-Specific Module Audit

## Audit question

Do Football IQ missions launch distinct mission-specific modules, or are mission names currently mapped onto one generic live-rep engine?

## Executive conclusion

**Conclusion C: mission-specific modules have not been built.**

The repository contains:

1. a mission catalogue with ten named missions across five Football IQ constructs;
2. mission-selection logic that assigns each mission a broad `drillId` label;
3. UI integration that changes the mission title, description, focus label and accessibility text;
4. one shared live training engine that resolves a position-based drill and presents cue-response scoring.

The mission `drillId` is not passed into the live training engine as a module selector. Therefore missions such as **Predict the Next Play**, **Choose the Best Option**, **Find the Space** and **Change the Plan** currently change the coaching wrapper only. They do not launch unique assessment or training mechanics.

This is not a routing bug and there are no completed dormant mission modules waiting to be assigned.

## Important distinction

### Formal academy assessment

The current Academy Trial contains one implemented assessment experience: the **Juggling Assessment**. It uses camera access with a manual touch count while automatic detection remains under development.

This is separate from Football IQ adaptive training missions.

### Adaptive training missions

The training system defines ten mission names:

| Construct | Mission | Assigned drill label | Unique module present? |
|---|---|---:|---:|
| Awareness | Scan First | scanning | No |
| Awareness | Spot the Cue | vision | No |
| Game reading | Predict the Next Play | vision | No |
| Game reading | Read the Pressure | dual | No |
| Decision quality | Choose the Best Option | decision | No |
| Decision quality | Decide Under Pressure | reaction | No |
| Adaptability | Change the Plan | dual | No |
| Adaptability | Solve a New Picture | reaction | No |
| Use of space | Find the Space | position | No |
| Use of space | Create the Space | position | No |

The assigned `drillId` values are metadata used for labels and broad categorisation. They are not wired to separate engines.

## Evidence trail

### 1. Mission catalogue exists

`src/training/adaptive-training-engine.js` defines ten missions and maps each to one of six broad drill labels:

- `scanning`
- `vision`
- `decision`
- `reaction`
- `dual`
- `position`

The engine selects a mission using player priorities and recent mission history.

### 2. Mission integration changes presentation only

`js/app/adaptive-training-entry.js` reads the selected mission and updates:

- top label;
- phase label;
- mission title;
- mission description;
- CTA accessibility label;
- CTA text.

It does not pass `mission.id`, `constructId` or `mission.drillId` into the live training session creator.

### 3. Live rep uses the existing shared engine

`js/app/main.js` starts the mission through `startMissionTraining()`.

That function selects `missionDrill()?.id`, where `missionDrill()` returns the first position-recommended drill. It does not read the adaptive mission saved by `adaptive-training-entry.js`.

The shared session then uses:

- one countdown flow;
- one cue-response screen;
- the selected drill's `cuePool`;
- coach correct/incorrect scoring or voice response;
- one common scoring and results path.

### 4. Existing drill catalogue is generic and position-based

`js/data/drills.js` contains generic drills such as:

- Colour Scan;
- Left / Right React;
- Shoulder Check;
- Winger Drive;
- Striker Trigger;
- Midfield Picture;
- Reaction Ladder;
- Composure Combo.

These drills have different cue pools, but they are not implementations of the named adaptive missions. The current default mission entry resolves the first recommended drill for the player's position, which explains why different mission names can produce the same colour-scan live rep.

### 5. No dormant specialised modules found

Repository search found no separate runtime modules, routes, renderers or engines for:

- prediction scenarios;
- option-comparison decisions;
- pressure-reading scenarios;
- spatial positioning scenarios;
- adaptability rule changes;
- mission-specific scoring contracts.

Methodology documents describe intended assessments, but documentation is not connected to executable mission modules.

## Root cause of observed behaviour

The adaptive system and live training system are only partially integrated.

```text
Adaptive engine selects mission
        ↓
Mission title and brief are rendered
        ↓
Player enters live rep
        ↓
main.js ignores adaptive mission identity
        ↓
First position-recommended generic drill launches
```

For many positions, the first recommended drill is `colour-scan`, so the user repeatedly sees the same scan-style cue task regardless of mission title.

## Current implementation status

| Layer | Status |
|---|---|
| Mission catalogue | Built |
| Adaptive mission selection | Built |
| AI Coach / mission brief | Built |
| Mission-specific routing | Not built |
| Mission-specific modules | Not built |
| Mission-specific cue generation | Not built |
| Mission-specific scoring | Not built |
| Generic live-rep engine | Built |
| Formal Football IQ assessment battery | Methodology/design present; runtime battery not built |
| Academy juggling assessment | MVP built; automatic detection incomplete |

## Recommended next architecture

Do not rename the generic cue rep as if it measures every construct. Introduce a mission-module registry with an explicit implementation status.

```js
MISSION_MODULES = {
  "scan-first": { moduleId: "scan-cue", status: "implemented" },
  "spot-the-cue": { moduleId: "visual-cue", status: "planned" },
  "predict-next": { moduleId: "scenario-prediction", status: "planned" },
  "read-pressure": { moduleId: "pressure-map", status: "planned" },
  "best-option": { moduleId: "option-choice", status: "planned" },
  "fast-choice": { moduleId: "timed-choice", status: "planned" },
  "change-the-plan": { moduleId: "rule-switch", status: "planned" },
  "new-picture": { moduleId: "novel-scenario", status: "planned" },
  "find-space": { moduleId: "space-recognition", status: "planned" },
  "create-space": { moduleId: "movement-selection", status: "planned" }
};
```

Until a module is implemented, the UI should clearly label the activity as a **general Football IQ training rep** rather than implying that a mission-specific task has been delivered.

## Audit outcome

- **Modules built but unassigned:** No.
- **Partially built specialist modules:** No meaningful specialist runtime modules found.
- **Single generic module reused:** Yes.
- **Why every mission appears to activate scanning:** the adaptive mission identity is not connected to session creation, and the first position-recommended generic drill commonly resolves to Colour Scan.
- **Architecture damage:** None. This is an incomplete integration and content implementation gap, not a failure of the locked scoring boundaries.
