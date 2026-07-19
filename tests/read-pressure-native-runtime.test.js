import test from "node:test";
import assert from "node:assert/strict";
import {
  createMissionDrill,
  nextMissionCue,
  missionScoreForResult,
} from "../js/game/mission-session-adapter.js";
import {
  missionHasNativeAdapter,
  resolveMissionIntegration,
  RUNTIME_ADAPTER_STATUS,
} from "../src/missions/runtime-integration.js";

test("Read the Pressure is registered as a native adapter", () => {
  assert.equal(missionHasNativeAdapter("read-pressure"), true);
  const integration = resolveMissionIntegration({ mission: { id: "read-pressure", title: "Read the Pressure" } });
  assert.equal(integration.adapterStatus, RUNTIME_ADAPTER_STATUS.NATIVE);
  assert.equal(integration.adapter.adapterId, "read-pressure-v1");
});

test("Read the Pressure creates a pressure-aware native drill", () => {
  const drill = createMissionDrill("read-pressure");
  assert.equal(drill.adapterId, "read-pressure-v1");
  assert.equal(drill.scoringProfile, "pressure-recognition-decision-reaction");
});

test("pressure scenarios expose source, direction, intensity and final decision metadata", () => {
  const drill = createMissionDrill("read-pressure");
  const cues = Array.from({ length: 3 }, () => nextMissionCue(drill));
  assert.deepEqual(cues.map((cue) => cue.id), ["check", "left", "right"]);
  assert.ok(cues.every((cue) => cue.pressureSource === "single-defender"));
  assert.ok(cues.every((cue) => cue.pressureDirection === "left"));
  assert.ok(cues.every((cue) => cue.pressureIntensity === 1));
  assert.equal(cues[0].decisionRequired, false);
  assert.equal(cues[2].decisionRequired, true);
  assert.equal(cues[2].expectedDecision, "right");
});

test("pressure scoring rewards recognition, correct decisions and fast responses", () => {
  const drill = createMissionDrill("read-pressure");
  nextMissionCue(drill);
  nextMissionCue(drill);
  const decisionCue = nextMissionCue(drill);
  const quick = missionScoreForResult(decisionCue, true, 600);
  const slow = missionScoreForResult(decisionCue, true, 1600);
  const wrong = missionScoreForResult(decisionCue, false, 500);
  assert.ok(quick.total > slow.total);
  assert.ok(quick.pressureRecognitionBonus > 0);
  assert.ok(quick.pressureDecisionBonus > 0);
  assert.equal(wrong.total, 0);
});

test("unimplemented missions remain generic fallbacks", () => {
  assert.equal(createMissionDrill("best-option"), null);
  assert.equal(missionHasNativeAdapter("best-option"), false);
});
