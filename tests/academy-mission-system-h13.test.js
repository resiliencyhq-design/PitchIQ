import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root=new URL("../",import.meta.url);
const read=path=>readFile(new URL(path,root),"utf8");

test("H13 Academy engine defines pathways, seasons and persistent state",async()=>{
  const source=await read("js/app/academy-mission-system-h13.js");
  assert.match(source,/Foundation Player/);
  assert.match(source,/Match Leader/);
  assert.match(source,/Foundation/);
  assert.match(source,/Elite/);
  assert.match(source,/pitchiq\.academy\.state\.v1/);
  assert.match(source,/weeklyItems/);
  assert.match(source,/createAcademyReview/);
});

test("H13 dashboard exposes pathway, weekly plan, unlock and season progress",async()=>{
  const source=await read("js/app/academy-world-h13.js");
  assert.match(source,/Current pathway/);
  assert.match(source,/Weekly Academy plan/);
  assert.match(source,/Next unlock/);
  assert.match(source,/Season progress/);
  assert.match(source,/Generate Coach Review/);
});

test("H13 preserves independent Academy worlds and Home routing",async()=>{
  const worlds=await read("js/app/home-world-stack-h5.js");
  const home=await read("js/app/home-adaptive-mission-h8.js");
  assert.match(worlds,/academy-world/);
  assert.match(worlds,/football-iq-library/);
  assert.match(worlds,/reflect-world/);
  assert.match(worlds,/mindiq-world/);
  assert.match(worlds,/coach-world/);
  assert.match(home,/data-h13-open-academy/);
  assert.match(home,/pitchiq:academy-updated/);
});