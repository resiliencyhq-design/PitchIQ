import test from "node:test";
import assert from "node:assert/strict";
import { aggregateTeamEvidence, buildSquadSnapshot, createSessionPlan } from "../src/team/team-intelligence.js";

test("builds bounded squad snapshots without recalculating Football IQ", () => {
  const [player] = buildSquadSnapshot([{ id: "1", name: "Alex", readiness: 2, footballIQ: { score: 72 } }]);
  assert.equal(player.readiness, 1);
  assert.deepEqual(player.footballIQ, { score: 72 });
});

test("aggregates evidence without ranking players or updating Football IQ", () => {
  const result = aggregateTeamEvidence([
    { name: "A", trainingEvidenceCount: 2, matchEvidenceCount: 1, readiness: .9, priorityTags: ["scanning"] },
    { name: "B", trainingEvidenceCount: 3, matchEvidenceCount: 2, readiness: .4, priorityTags: ["scanning", "positioning"] }
  ]);
  assert.equal(result.playerCount, 2);
  assert.equal(result.trainingEvidenceCount, 5);
  assert.equal(result.matchEvidenceCount, 3);
  assert.equal(result.reassessmentReadyCount, 1);
  assert.equal(result.priorities[0].construct, "scanning");
  assert.equal(result.updatesFootballIQ, false);
  assert.equal(result.ranksPlayers, false);
});

test("creates an evidence-led session plan", () => {
  const plan = createSessionPlan([
    { priorityTags: ["decisionMaking"] },
    { priorityTags: ["decisionMaking", "communication"] }
  ]);
  assert.equal(plan.primaryFocus, "decisionMaking");
  assert.match(plan.title, /Decision making/);
  assert.equal(plan.updatesFootballIQ, false);
});
