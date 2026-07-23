import test from "node:test";
import assert from "node:assert/strict";
import { assignMission } from "../src/missions/mission-store.js";
import { MISSION_LIFECYCLE, MISSION_TYPES } from "../src/missions/mission-contract.js";
import { beginBriefedMission, prepareMissionBrief, renderMissionBrief } from "../js/app/mission-brief.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
}

function mission() {
  return {
    id: "brief-test",
    type: MISSION_TYPES.FOOTBALL_IQ,
    title: "Scan First",
    category: "Awareness",
    purpose: "Scan before receiving the ball.",
    artwork: "assets/test.png",
    activity: { adapterId: "scan-v1", route: "training" },
    objectives: [{ id: "scan", label: "Scan 20 cues", target: 20, unit: "cues" }],
    reward: { xp: 120, label: "Elite Boots" },
  };
}

test("opening the brief transitions assigned missions to briefed", () => {
  const storage = memoryStorage();
  assignMission(mission(), storage);
  const briefed = prepareMissionBrief(storage);
  assert.equal(briefed.lifecycle, MISSION_LIFECYCLE.BRIEFED);
});

test("starting the brief transitions the mission to active", () => {
  const storage = memoryStorage();
  assignMission(mission(), storage);
  prepareMissionBrief(storage);
  const active = beginBriefedMission(storage);
  assert.equal(active.lifecycle, MISSION_LIFECYCLE.ACTIVE);
});

test("renders canonical title, objectives, reward and start action", () => {
  const storage = memoryStorage();
  assignMission(mission(), storage);
  const html = renderMissionBrief(prepareMissionBrief(storage));
  assert.match(html, /MISSION BRIEF/);
  assert.match(html, /Scan First/);
  assert.match(html, /Scan 20 cues/);
  assert.match(html, /Elite Boots/);
  assert.match(html, /data-mission-brief-start/);
});
