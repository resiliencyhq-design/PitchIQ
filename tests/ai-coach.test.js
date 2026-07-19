import test from "node:test";
import assert from "node:assert/strict";
import { buildAICoachGuardrails, buildAICoachRecommendation } from "../src/coaching/ai-coach.js";

test("AI Coach prioritises formal assessment and does not modify Football IQ", () => {
  const recommendation = buildAICoachRecommendation({
    footballIQScores: { scanning: 2, positioning: 4 },
    latestMatchEvidence: { summary: { recommendedFocus: "communication" } },
    readinessScore: 0.4,
    evidenceCount: 2
  });
  assert.equal(recommendation.focus, "scanning");
  assert.equal(recommendation.updatesFootballIQ, false);
  assert.equal(recommendation.recommendationOnly, true);
});

test("AI Coach guardrails preserve scientific boundaries", () => {
  const guardrails = buildAICoachGuardrails();
  assert.equal(guardrails.doesNotRankPlayers, true);
  assert.equal(guardrails.doesNotModifyFootballIQ, true);
  assert.equal(guardrails.requiresFormalReassessmentForScoreChange, true);
});
