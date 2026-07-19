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

test("Spot the Cue is registered as a native runtime", () => {
  assert.equal(missionHasNativeAdapter("spot-the-cue"), true);
  const integration = resolveMissionIntegration({
    mission: { id: "spot-the-cue", title: "Spot the Cue" },
  });
  assert.equal(integration.adapterStatus, RUNTIME_ADAPTER_STATUS.NATIVE);
  assert.equal(integration.adapter.adapterId, "spot-the-cue-v1");
  assert.equal(integration.adapter.scoringProfile, "accuracy-reaction-sequence");
});

test("Spot the Cue creates a mission-specific drill", () => {
  const drill = createMissionDrill("spot-the-cue");
  assert.equal(drill.adapterId, "spot-the-cue-v1");
  assert.equal(drill.scoringProfile, "accuracy-reaction-sequence");
  assert.equal(drill.patternIndex, 0);
  assert.equal(drill.patternStep, 0);
});

test("Spot the Cue presents deterministic three-cue patterns", () => {
  const drill = createMissionDrill("spot-the-cue");
  const cues = Array.from({ length: 6 }, () => nextMissionCue(drill));
  assert.deepEqual(cues.map((cue) => cue.id), ["red", "blue", "red", "left", "right", "left"]);
  assert.deepEqual(cues.map((cue) => cue.sequencePosition), [1, 2, 3, 1, 2, 3]);
  assert.deepEqual(cues.map((cue) => cue.sequenceComplete), [false, false, true, false, false, true]);
});

test("Spot the Cue scoring rewards correct pattern completion and speed", () => {
  const drill = createMissionDrill("spot-the-cue");
  nextMissionCue(drill);
  nextMissionCue(drill);
  const completionCue = nextMissionCue(drill);
  const quick = missionScoreForResult(completionCue, true, 600);
  const slow = missionScoreForResult(completionCue, true, 1600);
  const wrong = missionScoreForResult(completionCue, false, 500);

  assert.equal(quick.missionId, "spot-the-cue");
  assert.equal(quick.sequenceCompletionBonus, 50);
  assert.ok(quick.total > slow.total);
  assert.equal(wrong.total, 0);
});

test("Scan First remains native and unrelated missions remain fallbacks", () => {
  assert.equal(createMissionDrill("scan-first").adapterId, "scan-first-v1");
  assert.equal(createMissionDrill("predict-next"), null);
  assert.equal(missionHasNativeAdapter("predict-next"), false);
});
