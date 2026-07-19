import test from "node:test";
import assert from "node:assert/strict";
import { missionsForModule, moduleProgress, missionById } from "../js/data/football-iq-missions.js";
import { getMissionModule } from "../src/missions/mission-module-registry.js";

const IDS = ["play-forward-or-secure", "choose-best-option", "change-the-decision"];
const STAGES = ["foundation", "developing", "advanced"];

test("Decision Making contains exactly three ordered core missions", () => {
  const missions = missionsForModule("decision");
  assert.equal(missions.length, 3);
  assert.deepEqual(missions.map((mission) => mission.id), IDS);
  assert.deepEqual(missions.map((mission) => mission.progressionStage), STAGES);
});

test("Decision Making missions satisfy the Sprint 22 content contract", () => {
  for (const id of IDS) {
    const mission = missionById(id);
    assert.ok(mission);
    assert.ok(mission.coachingPrompt);
    assert.ok(mission.objectives.length >= 3);
    assert.ok(mission.successIndicators.length >= 4);
    assert.ok(mission.commonMistakes.length >= 3);
    assert.ok(mission.assessmentCriteria.recognition);
    assert.ok(mission.assessmentCriteria.timing);
    assert.ok(mission.assessmentCriteria.decisionQuality);
    assert.ok(mission.feedback.before);
    assert.ok(mission.feedback.during.length >= 3);
    assert.ok(mission.feedback.after.strength);
    assert.ok(mission.feedback.after.improvement);
    assert.ok(mission.feedback.after.transferQuestion);
  }
});

test("Decision Making aggregation reflects the complete pathway", () => {
  const progress = moduleProgress("decision");
  assert.equal(progress.total, 3);
  assert.equal(progress.available, 3);
  assert.equal(progress.totalMinutes, 16);
  assert.equal(progress.mastery, "Foundation");
  assert.equal(progress.nextMission.id, "play-forward-or-secure");
});

test("Decision Making missions resolve through the existing mission registry", () => {
  for (const id of IDS) {
    const module = getMissionModule(id);
    assert.ok(module);
    assert.equal(module.moduleId, id);
    assert.ok(["decisionQuality", "adaptability"].includes(module.constructId));
    assert.equal(module.status, "content_ready_generic_runtime");
    assert.ok(module.capabilities.includes("decisionQualityScoring"));
  }
});
