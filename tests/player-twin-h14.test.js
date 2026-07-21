import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const engine=fs.readFileSync("js/app/player-twin-h14.js","utf8");
const world=fs.readFileSync("js/app/player-twin-world-h14.js","utf8");
const loader=fs.readFileSync("js/app/player-twin-lazy-loader-h14.js","utf8");
const home=fs.readFileSync("js/app/home-world-stack-h5.js","utf8");
const index=fs.readFileSync("index.html","utf8");

test("H14 persists one canonical longitudinal Player Twin",()=>{
  assert.match(engine,/pitchiq\.playerTwin\.v1/);
  assert.match(engine,/history\.filter\(item=>item\.date!==stamp\)/);
  assert.match(engine,/HISTORY_LIMIT=104/);
  assert.match(engine,/academySnapshot/);
});

test("H14 provides trends, readiness, fingerprints and forecasting",()=>{
  assert.match(engine,/Sustained improvement/);
  assert.match(engine,/readiness/);
  assert.match(engine,/fingerprint/);
  assert.match(engine,/fourWeeks/);
  assert.match(engine,/coachReview/);
});

test("H14 dashboard preserves non-diagnostic language",()=>{
  assert.match(world,/not a health or clinical assessment/);
  assert.match(world,/Longitudinal coach review/);
  assert.match(world,/Four-week trajectory/);
});

test("H14 route is reachable from Home and loaded once",()=>{
  assert.match(home,/route:"player-twin"/);
  assert.match(loader,/player-twin-world-h14/);
  assert.match(index,/player-twin-h14\.js/);
  assert.match(index,/player-twin-lazy-loader-h14\.js/);
  assert.match(index,/sprint-h14-player-twin-20260721/);
});