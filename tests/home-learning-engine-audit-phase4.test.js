import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = path => fs.readFileSync(path, "utf8");
const index = read("index.html");
const routes = read("js/app/routes.js");
const main = read("js/app/main.js");
const missionRuntime = read("js/app/mission-runtime-integration.js");
const reflection = read("js/app/post-training-coach-reflection.js");
const adaptiveUi = read("js/app/football-iq-adaptive-ui-w1-5.js");

test("canonical Home exposes the current production actions", () => {
  assert.match(routes, /Technical Training/);
  assert.match(routes, /Results/);
  assert.match(routes, /PitchIQ Lab/);
  assert.match(routes, /Today's Mission/);
});

test("core training completion persists results and progression", () => {
  assert.match(main, /addXP\(state,gain\)/);
  assert.match(main, /state\.game\.lastResult=trainingSummary/);
  assert.match(main, /state\.analytics\.sessions\.push/);
  assert.match(main, /saveState\(state\)/);
});

test("mission runtime is loaded but depends on an adaptive selection", () => {
  assert.match(index, /mission-runtime-integration\.js/);
  assert.match(missionRuntime, /pitchiq\.adaptiveTraining\.current\.v1/);
  assert.match(missionRuntime, /if \(!selection\)/);
});

test("Football IQ adaptive UI is not currently production loaded", () => {
  assert.match(adaptiveUi, /applyHomeRecommendation/);
  assert.match(adaptiveUi, /data-home-adaptive-recommendation/);
  assert.doesNotMatch(index, /football-iq-adaptive-ui-w1-5\.js/);
});

test("post-training reflection exists but is not connected to canonical completion", () => {
  assert.match(reflection, /showPostTrainingCoachReflection/);
  assert.match(reflection, /finish-live-session/);
  assert.doesNotMatch(index, /post-training-coach-reflection\.js/);
  assert.doesNotMatch(main, /finish-live-session/);
});

test("canonical route set does not yet expose learning-engine routes", () => {
  assert.match(main, /VALID_ROUTES = new Set\(\["splash", "onboard", "home", "training", "results", "player"\]\)/);
  assert.doesNotMatch(main, /"football-iq"/);
  assert.doesNotMatch(main, /"mindiq"/i);
  assert.doesNotMatch(main, /"reflective-space"/);
});
