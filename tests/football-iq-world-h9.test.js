import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("H9 loads the dedicated Football IQ world only through the lazy route loader", async () => {
  const loader = await read("js/app/football-iq-lazy-loader-h7.js");
  const index = await read("index.html");
  assert.match(loader, /football-iq-world-h9\.js/);
  assert.match(loader, /football-iq-adaptive-ui-w1-5\.js/);
  assert.match(index, /football-iq-lazy-loader-h7\.js\?v=sprint-h9-football-iq-world/);
  assert.doesNotMatch(index, /src="js\/app\/football-iq-world-h9\.js/);
});

test("H9 dashboard exposes benchmark, insights, curriculum, recommendation and results", async () => {
  const source = await read("js/app/football-iq-world-h9.js");
  assert.match(source, /Football IQ benchmark/);
  assert.match(source, /Adaptive Coach/);
  assert.match(source, /Strengths/);
  assert.match(source, /Priorities/);
  assert.match(source, /12-week pathway/);
  assert.match(source, /Results and personal bests/);
});

test("H9 reuses existing Football IQ engines and mission routes", async () => {
  const source = await read("js/app/football-iq-world-h9.js");
  assert.match(source, /footballIqAssessment/);
  assert.match(source, /footballIqSeason/);
  assert.match(source, /adaptiveFootballIqPlan/);
  assert.match(source, /getFootballIqProgress/);
  assert.match(source, /data-fiq-open-mission/);
  assert.match(source, /data-fiq-open-module/);
});

test("H9 retains useful empty-data states", async () => {
  const source = await read("js/app/football-iq-world-h9.js");
  assert.match(source, /Your results will appear here/);
  assert.match(source, /Complete missions to identify your strongest areas/);
  assert.match(source, /Your first mission is ready/);
});
