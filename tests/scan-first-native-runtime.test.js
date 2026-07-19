import test from "node:test";
import assert from "node:assert/strict";
import {
  activeMissionId,
  createMissionDrill,
  nextMissionCue,
  missionScoreForResult,
} from "../js/game/mission-session-adapter.js";

function storage(values = {}) {
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
    },
  };
}

test("active mission prefers the resolved session runtime", () => {
  const session = storage({
    "pitchiq.missionRuntime.active.v1": JSON.stringify({ missionId: "scan-first" }),
  });
  const local = storage({
    "pitchiq.adaptiveTraining.current.v1": JSON.stringify({ mission: { id: "predict-next" } }),
  });
  assert.equal(activeMissionId(session, local), "scan-first");
});

test("Scan First creates a native mission drill", () => {
  const drill = createMissionDrill("scan-first");
  assert.equal(drill.adapterId, "scan-first-v1");
  assert.equal(drill.scoringProfile, "accuracy-reaction");
  assert.equal(drill.cuePool[0], "check");
});

test("Scan First alternates scanning with actionable cues", () => {
  const drill = createMissionDrill("scan-first");
  const cues = Array.from({ length: 6 }, () => nextMissionCue(drill));
  assert.deepEqual(cues.map((cue) => cue.id), ["check", "left", "check", "red", "check", "right"]);
  assert.ok(cues.filter((cue) => cue.type === "scan").every((cue) => cue.scoringWeight > 1));
});

test("mission scoring rewards correct scan evidence and quick responses", () => {
  const drill = createMissionDrill("scan-first");
  const cue = nextMissionCue(drill);
  const quick = missionScoreForResult(cue, true, 600);
  const slow = missionScoreForResult(cue, true, 1600);
  const wrong = missionScoreForResult(cue, false, 500);
  assert.ok(quick.total > slow.total);
  assert.equal(wrong.total, 0);
  assert.equal(quick.missionId, "scan-first");
});

test("unimplemented missions do not receive a fake native drill", () => {
  assert.equal(createMissionDrill("predict-next"), null);
  assert.equal(nextMissionCue({ id: "generic" }), null);
});
