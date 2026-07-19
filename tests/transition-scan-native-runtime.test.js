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

test("Transition Scan is registered as a native adapter", () => {
  assert.equal(missionHasNativeAdapter("transition-scan"), true);
  const integration = resolveMissionIntegration({ mission: { id: "transition-scan", title: "Transition Scan" } });
  assert.equal(integration.adapterStatus, RUNTIME_ADAPTER_STATUS.NATIVE);
  assert.equal(integration.adapter.adapterId, "transition-scan-v1");
});

test("Transition Scan creates a transition-aware native drill", () => {
  const drill = createMissionDrill("transition-scan");
  assert.equal(drill.adapterId, "transition-scan-v1");
  assert.equal(drill.scoringProfile, "transition-recognition-early-scan-decision-reaction");
});

test("transition scenarios expose possession, scan, lane and threat metadata", () => {
  const drill = createMissionDrill("transition-scan");
  const cues = Array.from({ length: 4 }, () => nextMissionCue(drill));
  assert.deepEqual(cues.map((cue) => cue.id), ["check", "left", "red", "drive"]);
  assert.ok(cues.every((cue) => cue.transitionType === "attack"));
  assert.ok(cues.every((cue) => cue.possessionState === "won"));
  assert.equal(cues[0].scanTiming, "immediate");
  assert.equal(cues[0].firstVisualTarget, "forward-lane");
  assert.deepEqual(cues[0].availablePassingLanes, ["central", "left"]);
  assert.deepEqual(cues[0].defensiveThreats, []);
  assert.equal(cues[3].decisionRequired, true);
  assert.equal(cues[3].expectedDecision, "drive");
});

test("defensive transitions expose threat identification", () => {
  const drill = createMissionDrill("transition-scan");
  Array.from({ length: 4 }, () => nextMissionCue(drill));
  const defensiveCue = nextMissionCue(drill);
  assert.equal(defensiveCue.transitionType, "defence");
  assert.equal(defensiveCue.possessionState, "lost");
  assert.equal(defensiveCue.threatIdentified, true);
  assert.deepEqual(defensiveCue.defensiveThreats, ["right-channel-runner"]);
});

test("transition scoring rewards recognition, early scanning, threats and fast decisions", () => {
  const drill = createMissionDrill("transition-scan");
  const firstCue = nextMissionCue(drill);
  const earlyScan = missionScoreForResult(firstCue, true, 600, { scanCount: 3 });
  assert.ok(earlyScan.transitionRecognitionBonus > 0);
  assert.ok(earlyScan.earlyScanBonus > 0);
  assert.ok(earlyScan.scanningBonus > 0);

  nextMissionCue(drill);
  nextMissionCue(drill);
  const decisionCue = nextMissionCue(drill);
  const quick = missionScoreForResult(decisionCue, true, 600);
  const slow = missionScoreForResult(decisionCue, true, 1600);
  const wrong = missionScoreForResult(decisionCue, false, 500);
  assert.ok(quick.total > slow.total);
  assert.ok(quick.transitionDecisionBonus > 0);
  assert.equal(wrong.total, 0);
});

test("unimplemented missions remain generic fallbacks", () => {
  assert.equal(createMissionDrill("tempo-control"), null);
  assert.equal(missionHasNativeAdapter("tempo-control"), false);
});
