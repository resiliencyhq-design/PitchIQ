# Sprint 12.5D — Home Coaching Recommendation (Display Only)

## Objective
Show the current adaptive Football IQ mission on Home without allowing Home to calculate or alter recommendations.

## Behaviour
- Training persists its selected mission to `pitchiq.adaptiveTraining.current.v1`.
- Home reads that stored selection and displays the mission title, focus type and recommendation state.
- Personalised selections display **Your priority**.
- Balanced and fallback selections display **Today's focus**.
- When no selection exists, Home displays a safe first-mission prompt.
- The call to action uses the existing `data-route="training"` route.

## Architecture boundary
- Home does not import the adaptive engine.
- Home does not import or generate Coaching Intelligence.
- Home does not score assessments or select missions.
- Recommendation generation remains owned by Training and Coaching Intelligence.

## Safety
- Rendering is idempotent through a content signature.
- The observer watches only direct app child replacement, avoiding subtree mutation loops.
- Failures in the optional Home module are caught by the existing guarded loader.

## Validation
1. Open Home before entering Training and confirm the first-mission prompt.
2. Enter Training and confirm a mission is selected.
3. Return Home and confirm the same mission appears.
4. Select Continue Training and confirm the existing Training flow opens.
5. Confirm Home, Results and Player navigation remain stable.