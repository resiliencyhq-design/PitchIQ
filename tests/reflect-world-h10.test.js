import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("H10 loads the reflection engine and lazy Reflect World route", async () => {
  const index = await read("index.html");
  const loader = await read("js/app/reflect-lazy-loader-h10.js");
  assert.match(index, /reflection-engine-h10\.js\?v=sprint-h10-reflect-world/);
  assert.match(index, /reflect-lazy-loader-h10\.js\?v=sprint-h10-reflect-world/);
  assert.match(loader, /reflect-world-h10\.js/);
});

test("H10 creates reflections directly from mission completion events", async () => {
  const engine = await read("js/app/reflection-engine-h10.js");
  assert.match(engine, /pitchiq:mission-complete/);
  assert.match(engine, /recordReflection/);
  assert.match(engine, /strength/);
  assert.match(engine, /coachingInsight/);
  assert.match(engine, /confidence/);
  assert.match(engine, /pitchiq\.reflections\.v1/);
});

test("H10 Reflect World contains today, journal, progress and empty states", async () => {
  const world = await read("js/app/reflect-world-h10.js");
  assert.match(world, /Today's reflection/);
  assert.match(world, /Reflection journal/);
  assert.match(world, /What went well/);
  assert.match(world, /Next focus/);
  assert.match(world, /Your first reflection will appear here/);
  assert.match(world, /data-reflection-save/);
});

test("H10 connects Reflect to the existing Home Academy stack", async () => {
  const home = await read("js/app/home-world-stack-h5.js");
  assert.match(home, /dataHomeReflectRoute/);
  assert.match(home, /reflect-world/);
  assert.match(home, /Turn every session into learning/);
  assert.match(home, /h10-reflect-world/);
});
