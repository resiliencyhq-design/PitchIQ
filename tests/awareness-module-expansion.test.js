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

const REQUIRED_STAGES = ["foundation", "developing", "advanced"];
const REQUIRED_IDS = ["find-third-player", "see-beyond-ball", "track-three-players"];

test("Awareness contains exactly three ordered core missions", () => {
  const missions = missionsForModule("awareness");
  assert.equal(missions.length, 3);
  assert.deepEqual(missions.map((mission) => mission.id), REQUIRED_IDS);
  assert.deepEqual(missions.map((mission) => mission.progressionStage), REQUIRED_STAGES);
});

test("Awareness missions satisfy the Sprint 22 content contract", () => {
  for (const id of REQUIRED_IDS) {
    const mission = missionById(id);
    assert.ok(mission, `${id} should resolve`);
    assert.equal(mission.category, "awareness");
    assert.ok(mission.title);
    assert.ok(Number.isFinite(mission.difficulty));
    assert.ok(Number.isFinite(mission.xp));
    assert.ok(Number.isFinite(mission.minutes));
    assert.ok(mission.description);
    assert.ok(mission.objectives.length >= 3);
    assert.ok(mission.coachingPrompt);
    assert.ok(mission.successIndicators.length >= 3);
    assert.deepEqual(Object.keys(mission.assessmentCriteria).sort(), ["decisionQuality", "recognition", "timing"]);
    assert.ok(mission.commonMistakes.length >= 3);
    assert.ok(mission.feedback.before);
    assert.ok(mission.feedback.during.length >= 1);
    assert.ok(mission.feedback.after.strength);
    assert.ok(mission.feedback.after.improvement);
    assert.ok(mission.feedback.after.transferQuestion);
    assert.equal(mission.launchRoute, "training");
  }
});

test("Awareness module progress aggregates all three missions", () => {
  const progress = moduleProgress("awareness");
  assert.equal(progress.total, 3);
  assert.equal(progress.available, 3);
  assert.equal(progress.totalMinutes, 16);
  assert.equal(progress.nextMission.id, "find-third-player");
});

test("Awareness missions resolve through native or documented fallback runtime", () => {
  const foundation = resolveMissionIntegration({ mission: missionById("find-third-player") });
  const developing = resolveMissionIntegration({ mission: missionById("see-beyond-ball") });
  const advanced = resolveMissionIntegration({ mission: missionById("track-three-players") });

  assert.equal(foundation.adapterStatus, RUNTIME_ADAPTER_STATUS.NATIVE);
  assert.equal(developing.adapterStatus, RUNTIME_ADAPTER_STATUS.GENERIC_FALLBACK);
  assert.equal(advanced.adapterStatus, RUNTIME_ADAPTER_STATUS.GENERIC_FALLBACK);
  assert.match(developing.fallbackReason, /not implemented/i);
  assert.match(advanced.fallbackReason, /not implemented/i);
});
