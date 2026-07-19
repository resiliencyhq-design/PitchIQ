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

test("Find the Third Player is registered as a native adapter", () => {
  assert.equal(missionHasNativeAdapter("find-third-player"), true);
  const integration = resolveMissionIntegration({ mission: { id: "find-third-player", title: "Find the Third Player" } });
  assert.equal(integration.adapterStatus, RUNTIME_ADAPTER_STATUS.NATIVE);
  assert.equal(integration.adapter.adapterId, "find-third-player-v1");
});

test("Find the Third Player creates a mission-specific drill", () => {
  const drill = createMissionDrill("find-third-player");
  assert.equal(drill.adapterId, "find-third-player-v1");
  assert.equal(drill.scoringProfile, "third-player-identification-scanning-reaction");
});

test("third-player scenarios expose options, blocked lanes and final decision metadata", () => {
  const drill = createMissionDrill("find-third-player");
  const cues = Array.from({ length: 4 }, () => nextMissionCue(drill));
  assert.deepEqual(cues.map((cue) => cue.id), ["check", "left", "right", "drive"]);
  assert.ok(cues.every((cue) => cue.primaryOption === "left"));
  assert.ok(cues.every((cue) => cue.secondaryOption === "right"));
  assert.ok(cues.every((cue) => cue.thirdPlayerOption === "drive"));
  assert.deepEqual(cues[0].blockedLanes, ["left"]);
  assert.equal(cues[0].decisionRequired, false);
  assert.equal(cues[3].decisionRequired, true);
  assert.equal(cues[3].passingLaneAvailable, true);
  assert.equal(cues[3].expectedDecision, "drive");
});

test("third-player scoring rewards the correct option, scanning and fast decisions", () => {
  const drill = createMissionDrill("find-third-player");
  nextMissionCue(drill);
  nextMissionCue(drill);
  nextMissionCue(drill);
  const decisionCue = nextMissionCue(drill);
  const quick = missionScoreForResult(decisionCue, true, 600, { scanCount: 4 });
  const slow = missionScoreForResult(decisionCue, true, 1600, { scanCount: 1 });
  const wrong = missionScoreForResult(decisionCue, false, 500, { scanCount: 4 });
  assert.ok(quick.total > slow.total);
  assert.ok(quick.thirdPlayerBonus > 0);
  assert.ok(quick.laneRecognitionBonus > 0);
  assert.ok(quick.scanningBonus > 0);
  assert.equal(wrong.accuracyPoints, 0);
  assert.equal(wrong.thirdPlayerBonus, 0);
  assert.equal(wrong.laneRecognitionBonus, 0);
});

test("unimplemented missions remain generic fallbacks", () => {
  assert.equal(createMissionDrill("break-the-line"), null);
  assert.equal(missionHasNativeAdapter("break-the-line"), false);
});
