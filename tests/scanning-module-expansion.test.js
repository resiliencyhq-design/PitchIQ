import test from "node:test";
import assert from "node:assert/strict";
import {
  missionById,
  missionsForModule,
  moduleProgress,
} from "../js/data/football-iq-missions.js";
import {
  missionHasNativeAdapter,
  resolveMissionIntegration,
  RUNTIME_ADAPTER_STATUS,
} from "../src/missions/runtime-integration.js";

const REQUIRED_STAGES = ["foundation", "developing", "advanced"];

function assertContentContract(mission) {
  assert.ok(mission.id);
  assert.equal(mission.category, "scanning");
  assert.ok(REQUIRED_STAGES.includes(mission.progressionStage));
  assert.ok(Number(mission.difficulty) > 0);
  assert.ok(Number(mission.xp) > 0);
  assert.ok(Number(mission.minutes) > 0);
  assert.ok(mission.description);
  assert.ok(mission.objectives.length >= 3);
  assert.ok(mission.coachingPrompt);
  assert.ok(mission.successIndicators.length >= 3);
  assert.ok(mission.assessmentCriteria.recognition);
  assert.ok(mission.assessmentCriteria.timing);
  assert.ok(mission.assessmentCriteria.decisionQuality);
  assert.ok(mission.commonMistakes.length >= 3);
  assert.ok(mission.feedback.before);
  assert.ok(mission.feedback.during.length >= 1);
  assert.ok(mission.feedback.after.strength);
  assert.ok(mission.feedback.after.improvement);
  assert.ok(mission.feedback.after.transferQuestion);
  assert.equal(mission.launchRoute, "training");
}

test("Scanning contains exactly three ordered core missions", () => {
  const missions = missionsForModule("scanning");
  assert.equal(missions.length, 3);
  assert.deepEqual(missions.map((mission) => mission.progressionStage), REQUIRED_STAGES);
  assert.deepEqual(missions.map((mission) => mission.id), [
    "scan-before-receive",
    "scan-while-moving",
    "transition-scan",
  ]);
});

test("Scanning missions satisfy the Sprint 22 content contract", () => {
  missionsForModule("scanning").forEach(assertContentContract);
});

test("Scanning mission IDs resolve and aggregate correctly", () => {
  assert.equal(missionById("scan-before-receive")?.title, "Scan Before Receiving");
  assert.equal(missionById("scan-while-moving")?.title, "Scan While Moving");
  assert.equal(missionById("transition-scan")?.title, "Scan During Transition");
  const progress = moduleProgress("scanning");
  assert.equal(progress.total, 3);
  assert.equal(progress.available, 3);
  assert.equal(progress.totalMinutes, 15);
});

test("Scanning missions resolve to native or documented fallback runtimes", () => {
  const foundation = resolveMissionIntegration({ mission: missionById("scan-before-receive") });
  const developing = resolveMissionIntegration({ mission: missionById("scan-while-moving") });
  const advanced = resolveMissionIntegration({ mission: missionById("transition-scan") });

  assert.equal(foundation.adapterStatus, RUNTIME_ADAPTER_STATUS.GENERIC_FALLBACK);
  assert.equal(developing.adapterStatus, RUNTIME_ADAPTER_STATUS.GENERIC_FALLBACK);
  assert.equal(advanced.adapterStatus, RUNTIME_ADAPTER_STATUS.NATIVE);
  assert.equal(missionHasNativeAdapter("transition-scan"), true);
});
