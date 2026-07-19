import assert from "node:assert/strict";
import test from "node:test";

import {
  AI_COACH_IDENTITY,
  buildAICoachGuardrails,
  buildAICoachRecommendation,
  buildCoachLanguage
} from "../src/coaching/ai-coach.js";

test("uses one locked PitchIQ Coach identity", () => {
  assert.equal(AI_COACH_IDENTITY.id, "pitchiq-coach");
  assert.equal(AI_COACH_IDENTITY.name, "PitchIQ Coach");
  assert.equal(AI_COACH_IDENTITY.role, "Your Football IQ coach");
});

test("uses evidence-building language when personalised evidence is unavailable", () => {
  const recommendation = buildAICoachRecommendation({});

  assert.equal(recommendation.personalised, false);
  assert.match(recommendation.title, /Today’s focus/i);
  assert.match(recommendation.message, /build more evidence/i);
  assert.match(recommendation.evidenceNote, /not a judgement of ability/i);
});

test("uses careful personalised language only when evidence exists", () => {
  const recommendation = buildAICoachRecommendation({
    formalPriority: "positioning",
    evidenceCount: 4
  });

  assert.equal(recommendation.personalised, true);
  assert.match(recommendation.title, /Let’s build Positioning/i);
  assert.match(recommendation.message, /current Football IQ evidence suggests/i);
  assert.doesNotMatch(recommendation.message, /watched|saw you|improved/i);
});

test("coach language stays encouraging and non-evaluative", () => {
  const language = buildCoachLanguage({ focus: "scanning", evidenceCount: 0 });

  assert.match(language.encouragement, /no pressure/i);
  assert.doesNotMatch(language.encouragement, /poor|weak|failed/i);
});

test("guardrails prevent unsupported claims and score contamination", () => {
  const guardrails = buildAICoachGuardrails();

  assert.equal(guardrails.doesNotClaimObservationWithoutEvidence, true);
  assert.equal(guardrails.reflectionsAreNotAssessmentScores, true);
  assert.equal(guardrails.doesNotModifyFootballIQ, true);
});
