import test from "node:test";
import assert from "node:assert/strict";
import {
  missionHasNativeAdapter,
  resolveMissionIntegration,
  RUNTIME_ADAPTER_STATUS,
} from "../src/missions/runtime-integration.js";

function selection(id, title = id) {
  return { mission: { id, title } };
}

test("Scan First resolves to its native adapter", () => {
  const integration = resolveMissionIntegration(selection("scan-first", "Scan First"));
  assert.equal(integration.adapterStatus, RUNTIME_ADAPTER_STATUS.NATIVE);
  assert.equal(integration.adapter.adapterId, "scan-first-v1");
  assert.equal(integration.adapter.cueProfile, "scan-colour-direction");
  assert.equal(integration.adapter.scoringProfile, "accuracy-reaction");
});

test("planned missions are explicit generic fallbacks rather than false native modules", () => {
  const integration = resolveMissionIntegration(selection("predict-next", "Predict the Next Play"));
  assert.equal(integration.adapterStatus, RUNTIME_ADAPTER_STATUS.GENERIC_FALLBACK);
  assert.equal(integration.adapter, null);
  assert.match(integration.fallbackReason, /not implemented/i);
});

test("native adapter inventory remains intentionally narrow", () => {
  assert.equal(missionHasNativeAdapter("scan-first"), true);
  assert.equal(missionHasNativeAdapter("spot-the-cue"), false);
  assert.equal(missionHasNativeAdapter("best-option"), false);
});

test("unknown mission ids fail clearly", () => {
  assert.throws(() => resolveMissionIntegration(selection("unknown-mission")), /No mission module registered/);
});

test("missing mission ids fail clearly", () => {
  assert.throws(() => resolveMissionIntegration({ mission: {} }), /missing a mission id/);
});
