import test from "node:test";
import assert from "node:assert/strict";
import {
  FOOTBALL_IQ_MODULES,
  FOOTBALL_IQ_MISSIONS,
  moduleById,
  missionsForModule,
  moduleProgress,
} from "../js/data/football-iq-missions.js";

test("every Football IQ mission belongs to a registered module", () => {
  for (const mission of FOOTBALL_IQ_MISSIONS) {
    assert.ok(moduleById(mission.category), `${mission.id} has an unknown module`);
  }
});

test("module mission lists are generated from the mission registry", () => {
  const vision = missionsForModule("vision");
  assert.deepEqual(vision.map((mission) => mission.id), ["predict-next-play"]);
  assert.equal(missionsForModule("missing").length, 0);
});

test("module progress reports completion, mastery and available duration", () => {
  const positioning = moduleProgress("positioning");
  assert.equal(positioning.total, 1);
  assert.equal(positioning.completed, 1);
  assert.equal(positioning.percent, 100);
  assert.equal(positioning.mastery, "Advanced");
  assert.equal(positioning.totalMinutes, 4);
  assert.equal(positioning.lastTrained, "2 days ago");
});

test("new modules can be added without changing module screen rendering", () => {
  assert.deepEqual(Object.keys(FOOTBALL_IQ_MODULES), [
    "awareness",
    "scanning",
    "vision",
    "decision",
    "positioning",
    "anticipation",
    "communication",
  ]);
  assert.equal(moduleProgress("communication").nextMission, null);
});
