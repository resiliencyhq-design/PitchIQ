import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("H8 resolves missions in the approved priority order", async () => {
  const source = await read("js/app/home-adaptive-mission-h8.js");
  assert.match(source, /activeMission\(\) \|\| recommendedFootballIqMission\(\) \|\| FALLBACK_MISSION/);
  assert.match(source, /pitchiq\.adaptiveTraining\.current\.v1/);
  assert.match(source, /primaryFootballIqRecommendation/);
  assert.match(source, /technical-foundation/);
});

test("H8 mission card exposes coaching and progression information", async () => {
  const source = await read("js/app/home-adaptive-mission-h8.js");
  assert.match(source, /Today's Mission/);
  assert.match(source, /mission\.minutes/);
  assert.match(source, /mission\.xp/);
  assert.match(source, /Personal best/);
  assert.match(source, /Mission in progress/);
});

test("active missions continue through the canonical training runtime", async () => {
  const source = await read("js/app/home-adaptive-mission-h8.js");
  assert.match(source, /data-route="training"/);
  assert.match(source, /data-action="start-mission-training"/);
  assert.doesNotMatch(source, /location\.reload/);
});

test("Football IQ recommendations use the existing lazy route family", async () => {
  const source = await read("js/app/home-adaptive-mission-h8.js");
  const loader = await read("js/app/football-iq-lazy-loader-h7.js");
  assert.match(source, /football-iq-mission\//);
  assert.match(loader, /football-iq-mission/);
});

test("H8 is wired into canonical Home composition and production build", async () => {
  const composition = await read("js/app/home-content-composition.js");
  const bootstrap = await read("js/app/production-bootstrap.js");
  const index = await read("index.html");
  assert.match(composition, /applyHomeAdaptiveMission/);
  assert.match(composition, /homeComposition = "h8"/);
  assert.match(bootstrap, /sprint-h8/);
  assert.match(index, /sprint-h8-adaptive-mission-hub-20260721/);
});

test("H8 preserves the H7 Academy worlds", async () => {
  const composition = await read("js/app/home-content-composition.js");
  assert.match(composition, /applyHomeWorldStack/);
  assert.match(composition, /applyHomeWorldPolish/);
  assert.match(composition, /academy-worlds/);
});
