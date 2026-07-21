import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("H11 adds a dedicated lazy-loaded MindIQ world", async () => {
  const index = await read("index.html");
  const loader = await read("js/app/mindiq-lazy-loader-h11.js");
  assert.match(index, /mindiq-engine-h11\.js/);
  assert.match(index, /mindiq-lazy-loader-h11\.js/);
  assert.match(loader, /mindiq-world-h11\.js/);
  assert.match(loader, /mindiq-world-h11\.css/);
});

test("H11 provides daily check-ins and a non-clinical performance profile", async () => {
  const engine = await read("js/app/mindiq-engine-h11.js");
  const world = await read("js/app/mindiq-world-h11.js");
  assert.match(engine, /saveMindIqCheckin/);
  assert.match(engine, /confidence/);
  assert.match(engine, /focus/);
  assert.match(engine, /calm/);
  assert.match(engine, /resilience/);
  assert.match(world, /Performance support, not diagnosis/);
});

test("H11 recommends and records practical mental skills exercises", async () => {
  const engine = await read("js/app/mindiq-engine-h11.js");
  assert.match(engine, /Reset after mistakes/);
  assert.match(engine, /Pre-match calm/);
  assert.match(engine, /Confidence under pressure/);
  assert.match(engine, /recommendMindIqExercise/);
  assert.match(engine, /completeMindIqExercise/);
});

test("H11 connects MindIQ to the Home Academy world stack", async () => {
  const home = await read("js/app/home-world-stack-h5.js");
  assert.match(home, /MindIQ/);
  assert.match(home, /mindiq-world/);
  assert.match(home, /h11-mindiq-world/);
});
