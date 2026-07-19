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

const selection = {
  mission: {
    id: "predict-next",
    title: "Predict the Next Play",
  },
};

test("Predict the Next Play is registered as a native mission adapter", () => {
  assert.equal(missionHasNativeAdapter("predict-next"), true);
  const integration = resolveMissionIntegration(selection);
  assert.equal(integration.adapterStatus, RUNTIME_ADAPTER_STATUS.NATIVE);
  assert.equal(integration.adapter.adapterId, "predict-next-v1");
  assert.equal(integration.adapter.cueProfile, "pattern-anticipation");
});

test("Predict the Next Play creates a native anticipation drill", () => {
  const drill = createMissionDrill("predict-next");
  assert.equal(drill.adapterId, "predict-next-v1");
  assert.equal(drill.scoringProfile, "prediction-accuracy-reaction-confidence");
  assert.equal(drill.patternIndex, 0);
  assert.equal(drill.patternStep, 0);
});

test("Predict the Next Play presents context cues before the prediction cue", () => {
  const drill = createMissionDrill("predict-next");
  const cues = Array.from({ length: 4 }, () => nextMissionCue(drill));
  assert.deepEqual(cues.map((cue) => cue.id), ["red", "blue", "red", "blue"]);
  assert.ok(cues.slice(0, 3).every((cue) => cue.contextCue && !cue.predictionRequired));
  assert.equal(cues[3].predictionRequired, true);
  assert.equal(cues[3].expectedPrediction, "blue");
  assert.equal(drill.patternIndex, 1);
  assert.equal(drill.patternStep, 0);
});

test("anticipation scoring rewards correct prediction, speed and confidence", () => {
  const drill = createMissionDrill("predict-next");
  const cue = Array.from({ length: 4 }, () => nextMissionCue(drill)).at(-1);
  const highConfidence = missionScoreForResult(cue, true, 600, { confidence: 1.2 });
  const lowConfidence = missionScoreForResult(cue, true, 1400, { confidence: 0.7 });
  const wrong = missionScoreForResult(cue, false, 500, { confidence: 1 });

  assert.equal(highConfidence.missionId, "predict-next");
  assert.equal(highConfidence.anticipationBonus, 75);
  assert.ok(highConfidence.total > lowConfidence.total);
  assert.equal(wrong.total, 0);
});

test("existing native adapters and generic fallbacks remain intact", () => {
  assert.equal(createMissionDrill("scan-first").adapterId, "scan-first-v1");
  assert.equal(createMissionDrill("spot-the-cue").adapterId, "spot-the-cue-v1");
  assert.equal(createMissionDrill("read-pressure"), null);
  assert.equal(nextMissionCue({ adapterId: "generic" }), null);
});
