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

test("Break the Line is registered as a native adapter", () => {
  assert.equal(missionHasNativeAdapter("break-the-line"), true);
  const integration = resolveMissionIntegration({ mission: { id: "break-the-line", title: "Break the Line" } });
  assert.equal(integration.adapterStatus, RUNTIME_ADAPTER_STATUS.NATIVE);
  assert.equal(integration.adapter.adapterId, "break-the-line-v1");
});

test("Break the Line creates a line-breaking native drill", () => {
  const drill = createMissionDrill("break-the-line");
  assert.equal(drill.adapterId, "break-the-line-v1");
  assert.equal(drill.scoringProfile, "line-breaking-recognition-progression-reaction");
});

test("line-breaking scenarios expose defensive shape, lane, movement and final decision metadata", () => {
  const drill = createMissionDrill("break-the-line");
  const cues = Array.from({ length: 4 }, () => nextMissionCue(drill));
  assert.deepEqual(cues.map((cue) => cue.id), ["check", "left", "red", "drive"]);
  assert.ok(cues.every((cue) => cue.defensiveLineShape === "flat-four"));
  assert.ok(cues.every((cue) => cue.passingLaneState === "opens-central"));
  assert.ok(cues.every((cue) => cue.receiverMovement === "checks-between-lines"));
  assert.equal(cues[0].decisionRequired, false);
  assert.equal(cues[3].lineBreakingOpportunity, true);
  assert.equal(cues[3].expectedDecision, "drive");
});

test("line-breaking scoring rewards recognition, progression, scanning and fast responses", () => {
  const drill = createMissionDrill("break-the-line");
  nextMissionCue(drill);
  nextMissionCue(drill);
  nextMissionCue(drill);
  const decisionCue = nextMissionCue(drill);
  const quick = missionScoreForResult(decisionCue, true, 600, { scanCount: 3 });
  const slow = missionScoreForResult(decisionCue, true, 1600, { scanCount: 1 });
  const wrong = missionScoreForResult(decisionCue, false, 500, { scanCount: 3 });
  assert.ok(quick.total > slow.total);
  assert.ok(quick.lineBreakingBonus > 0);
  assert.ok(quick.progressiveDecisionBonus > 0);
  assert.ok(quick.passingLaneBonus > 0);
  assert.ok(quick.scanningBonus > 0);
  assert.equal(wrong.total, 30);
});

test("unimplemented missions remain generic fallbacks", () => {
  assert.equal(createMissionDrill("tempo-control"), null);
  assert.equal(missionHasNativeAdapter("tempo-control"), false);
});
