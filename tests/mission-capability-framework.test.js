import test from "node:test";
import assert from "node:assert/strict";

import {
  MISSION_CAPABILITIES,
  validateCapabilities,
} from "../src/missions/capability-registry.js";
import {
  MISSION_MODULES,
  getMissionModule,
  validateMissionRegistry,
} from "../src/missions/mission-module-registry.js";
import {
  capabilityIsEnabled,
  resolveMissionRuntime,
} from "../src/missions/mission-runtime.js";

test("all registered mission capabilities are known", () => {
  const validation = validateCapabilities(Object.keys(MISSION_CAPABILITIES));
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.unknown, []);
});

test("all ten adaptive missions have module definitions", () => {
  assert.equal(Object.keys(MISSION_MODULES).length, 10);
  assert.ok(getMissionModule("scan-first"));
  assert.ok(getMissionModule("predict-next"));
  assert.ok(getMissionModule("create-space"));
});

test("mission registry has no invalid capability references", () => {
  const results = validateMissionRegistry();
  assert.equal(results.every((result) => result.valid), true);
});

test("runtime activates only capabilities requested by the mission", () => {
  const runtime = resolveMissionRuntime("predict-next");
  assert.equal(capabilityIsEnabled(runtime, "videoScenario"), true);
  assert.equal(capabilityIsEnabled(runtime, "predictionQualityScoring"), true);
  assert.equal(capabilityIsEnabled(runtime, "colourCue"), false);
  assert.equal(capabilityIsEnabled(runtime, "voice"), false);
});

test("future capabilities remain dormant until implemented", () => {
  const runtime = resolveMissionRuntime("create-space");
  assert.equal(capabilityIsEnabled(runtime, "animatedPlayers"), false);
  assert.equal(runtime.dormantCapabilities.some((item) => item.id === "animatedPlayers"), true);
});

test("strict runtime mode leaves interface-only capabilities dormant", () => {
  const runtime = resolveMissionRuntime("predict-next", { allowInterfaceOnly: false });
  assert.equal(capabilityIsEnabled(runtime, "videoScenario"), false);
  assert.equal(runtime.dormantCapabilities.some((item) => item.id === "videoScenario"), true);
});

test("unknown missions fail clearly instead of falling back silently", () => {
  assert.throws(
    () => resolveMissionRuntime("unknown-mission"),
    /No mission module registered/,
  );
});
