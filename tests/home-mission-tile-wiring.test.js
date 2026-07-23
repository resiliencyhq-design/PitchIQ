import test from "node:test";
import assert from "node:assert/strict";
import { MISSION_LIFECYCLE } from "../src/missions/mission-contract.js";
import { readCurrentMission, transitionMission } from "../src/missions/mission-store.js";
import { createDefaultHomeMission, missionTileAttributes, resolveHomeMission } from "../js/app/home-mission-tile.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
}

const state = { game: { level: 3 } };

test("creates the universal Home mission without changing its visual contract", () => {
  const mission = createDefaultHomeMission(state);
  assert.equal(mission.title, "Beat yesterday. Think faster.");
  assert.equal(mission.objectives[1].target, 7);
  assert.equal(mission.activity.route, "training");
});

test("assigns once and restores an active canonical mission", () => {
  const storage = memoryStorage();
  const first = resolveHomeMission(state, storage);
  const briefed = transitionMission(MISSION_LIFECYCLE.BRIEFED, {}, storage);
  const restored = resolveHomeMission(state, storage);
  assert.equal(first.id, "daily-football-iq");
  assert.equal(restored.lifecycle, MISSION_LIFECYCLE.BRIEFED);
  assert.equal(readCurrentMission(storage)?.id, briefed.id);
});

test("replaces completed missions with a new assigned mission", () => {
  const storage = memoryStorage();
  resolveHomeMission(state, storage);
  transitionMission(MISSION_LIFECYCLE.COMPLETED, {}, storage);
  const replacement = resolveHomeMission(state, storage);
  assert.equal(replacement.lifecycle, MISSION_LIFECYCLE.ASSIGNED);
});

test("exposes mission identity on the existing tile", () => {
  const attributes = missionTileAttributes(createDefaultHomeMission(state));
  assert.match(attributes, /data-mission-id="daily-football-iq"/);
  assert.match(attributes, /data-mission-type="football_iq"/);
});
