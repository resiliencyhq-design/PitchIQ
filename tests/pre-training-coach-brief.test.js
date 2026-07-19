import test from "node:test";
import assert from "node:assert/strict";
import { buildPreTrainingBrief } from "../js/app/pre-training-coach-brief.js";

test("personalised brief matches the persisted mission", () => {
  const brief = buildPreTrainingBrief({
    mode: "personalised",
    mission: { title: "Scan First", drillId: "scanning" }
  });
  assert.equal(brief.missionTitle, "Scan First");
  assert.equal(brief.modeLabel, "Your priority");
  assert.match(brief.explanation, /current Football IQ evidence/i);
  assert.match(brief.noticeCue, /before the ball arrives/i);
});

test("balanced brief uses evidence-building language", () => {
  const brief = buildPreTrainingBrief({
    mode: "balanced_evidence_building",
    mission: { title: "Find the Angle", drillId: "position" }
  });
  assert.equal(brief.modeLabel, "Today’s focus");
  assert.match(brief.explanation, /building more evidence/i);
  assert.doesNotMatch(brief.explanation, /watched|improved|mistake/i);
});

test("missing selection produces a safe fallback brief", () => {
  const brief = buildPreTrainingBrief(null);
  assert.equal(brief.missionTitle, "Scan First");
  assert.equal(brief.coachName, "PitchIQ Coach");
  assert.equal(brief.personalised, false);
});
