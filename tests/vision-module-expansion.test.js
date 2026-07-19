import test from "node:test";
import assert from "node:assert/strict";
import {
  missionById,
  missionsForModule,
  moduleProgress,
} from "../js/data/football-iq-missions.js";
import {
  resolveMissionIntegration,
  RUNTIME_ADAPTER_STATUS,
} from "../src/missions/runtime-integration.js";

const VISION_IDS = ["predict-next-play", "see-weak-side", "spot-overload"];
const STAGES = ["foundation", "developing", "advanced"];

test("Vision contains exactly three ordered core missions", () => {
  const missions = missionsForModule("vision");
  assert.equal(missions.length, 3);
  assert.deepEqual(missions.map((mission) => mission.id), VISION_IDS);
  assert.deepEqual(missions.map((mission) => mission.progressionStage), STAGES);
});

test("Vision missions satisfy the locked content metadata contract", () => {
  for (const id of VISION_IDS) {
    const mission = missionById(id);
    assert.ok(mission, `missing mission ${id}`);
    assert.equal(mission.category, "vision");
    assert.ok(mission.title);
    assert.ok(mission.description);
    assert.ok(Array.isArray(mission.objectives) && mission.objectives.length >= 3);
    assert.ok(mission.coachingPrompt);
    assert.ok(Array.isArray(mission.successIndicators) && mission.successIndicators.length >= 3);
    assert.ok(mission.assessmentCriteria?.recognition);
    assert.ok(mission.assessmentCriteria?.timing);
    assert.ok(mission.assessmentCriteria?.decisionQuality);
    assert.ok(Array.isArray(mission.commonMistakes) && mission.commonMistakes.length >= 3);
    assert.ok(mission.feedback?.before);
    assert.ok(Array.isArray(mission.feedback?.during) && mission.feedback.during.length >= 1);
    assert.ok(mission.feedback?.after?.strength);
    assert.ok(mission.feedback?.after?.improvement);
    assert.ok(mission.feedback?.after?.transferQuestion);
    assert.equal(mission.launchRoute, "training");
  }
});

test("Vision aggregation includes all three available missions", () => {
  const progress = moduleProgress("vision");
  assert.equal(progress.total, 3);
  assert.equal(progress.available, 3);
  assert.equal(progress.totalMinutes, 16);
  assert.equal(progress.nextMission?.id, "predict-next-play");
});

test("Vision missions resolve through the documented generic fallback", () => {
  for (const id of VISION_IDS) {
    const mission = missionById(id);
    const integration = resolveMissionIntegration({ mission });
    assert.equal(integration.missionId, id);
    assert.equal(integration.adapterStatus, RUNTIME_ADAPTER_STATUS.GENERIC_FALLBACK);
    assert.equal(integration.fallbackReason, "Mission-specific live runtime is not implemented yet.");
  }
});

test("existing Vision mission identity remains compatible", () => {
  const mission = missionById("predict-next-play");
  assert.equal(mission.title, "Predict the Next Play");
  assert.equal(mission.recommended, true);
});
