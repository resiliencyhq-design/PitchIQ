import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("H12 combines Football IQ, Reflect and MindIQ into one coach profile", async () => {
  const source = await read("js/app/coach-intelligence-h12.js");
  assert.match(source, /getFootballIqProgress/);
  assert.match(source, /getReflections/);
  assert.match(source, /mindIqSummary/);
  assert.match(source, /buildCoachProfile/);
  assert.match(source, /resolveCoachRecommendation/);
});

test("H12 persists coaching memory and development plans", async () => {
  const source = await read("js/app/coach-intelligence-h12.js");
  assert.match(source, /pitchiq\.coach\.memory\.v1/);
  assert.match(source, /pitchiq\.coach\.plan\.v1/);
  assert.match(source, /strengths/);
  assert.match(source, /priorities/);
  assert.match(source, /weeklyGoal/);
  assert.match(source, /fourWeekTheme/);
});

test("H12 sends unified recommendations to Home", async () => {
  const home = await read("js/app/home-adaptive-mission-h8.js");
  assert.match(home, /coachSnapshot/);
  assert.match(home, /Chosen by your coach/);
  assert.match(home, /Mental support/);
  assert.match(home, /h12-coach-intelligence/);
});

test("H12 exposes a lazy-loaded coach dashboard and preserves existing worlds", async () => {
  const index = await read("index.html");
  const worlds = await read("js/app/home-world-stack-h5.js");
  const dashboard = await read("js/app/coach-world-h12.js");
  assert.match(index, /coach-intelligence-h12\.js/);
  assert.match(index, /coach-lazy-loader-h12\.js/);
  assert.match(worlds, /Coach Intelligence/);
  assert.match(worlds, /Football IQ/);
  assert.match(worlds, /Reflect/);
  assert.match(worlds, /MindIQ/);
  assert.match(dashboard, /Performance coaching only/);
  assert.match(dashboard, /Today’s coaching plan/);
});