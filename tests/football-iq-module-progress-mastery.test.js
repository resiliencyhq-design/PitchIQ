import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const progressionPath = new URL("../js/app/football-iq-progression-w1-4.js", import.meta.url);
const libraryPath = new URL("../js/app/football-iq-library-w1-1.js", import.meta.url);

async function source(path){
  return readFile(path, "utf8");
}

test("module mastery is calculated from persistent mission performance", async () => {
  const code = await source(progressionPath);
  assert.match(code, /moduleProgressSnapshot/);
  assert.match(code, /personalBest/);
  assert.match(code, /performance >= 90 \? "Mastered"/);
  assert.match(code, /performance >= 70 \? "Strong"/);
  assert.match(code, /performance >= 40 \? "Developing"/);
});

test("locked missions are excluded from module totals and mastery", async () => {
  const code = await source(progressionPath);
  assert.match(code, /const eligible = missions\.filter\(mission => mission\.unlocked\)/);
  assert.match(code, /total: eligible\.length/);
});

test("mission completion preserves best score and increments attempts", async () => {
  const code = await source(progressionPath);
  assert.match(code, /attempts: Number\(previous\.attempts \|\| 0\) \+ 1/);
  assert.match(code, /personalBest: Math\.max/);
  assert.match(code, /lastPlayed: completedAt/);
});

test("module and detail screens use live progress snapshots", async () => {
  const code = await source(libraryPath);
  assert.match(code, /moduleProgressSnapshot\(module\.id\)/);
  assert.match(code, /missionSnapshot\(base, currentProgress\(\)\)/);
  assert.match(code, /pitchiq:football-iq-progress/);
});

test("starting a mission records the mission identity before runtime handoff", async () => {
  const code = await source(libraryPath);
  assert.match(code, /rememberActiveMission\(id\)/);
  assert.match(code, /launchMission\(start\.dataset\.fiqStartMission\)/);
});