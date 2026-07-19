import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const requiredFiles = [
  "src/coaching/ai-coach.js",
  "src/team/team-intelligence.js",
  "js/app/academy-season-entry.js",
  "js/app/adaptive-training-entry.js",
  "js/app/training-evidence-entry.js",
  "js/app/match-intelligence-entry.js",
  "js/app/ai-coach-entry.js",
  "js/app/coach-dashboard-entry.js",
  "js/app/team-intelligence-entry.js",
  "docs/PLATFORM-STABILITY-LOCK.md"
];

function source(path) {
  return readFileSync(path, "utf8");
}

test("locked platform modules remain present", () => {
  for (const path of requiredFiles) {
    assert.equal(existsSync(path), true, `Missing locked platform file: ${path}`);
  }
});

test("AI Coach cannot update formal Football IQ", () => {
  const aiCoach = source("src/coaching/ai-coach.js");
  assert.match(aiCoach, /updatesFootballIQ\s*:\s*false/);
});

test("Team Intelligence cannot update Football IQ or rank players", () => {
  const team = source("src/team/team-intelligence.js");
  assert.match(team, /updatesFootballIQ\s*:\s*false/);
  assert.match(team, /ranksPlayers\s*:\s*false/);
});

test("Home integration retains all locked experience entry points", () => {
  const home = source("js/app/academy-trial-home-return.js");
  const entryPoints = [
    "academy-season-entry.js",
    "coach-dashboard-entry.js",
    "match-intelligence-entry.js",
    "ai-coach-entry.js",
    "team-intelligence-entry.js",
    "training-evidence-entry.js",
    "adaptive-training-entry.js"
  ];

  for (const entryPoint of entryPoints) {
    assert.equal(home.includes(entryPoint), true, `Home integration missing ${entryPoint}`);
  }
});

test("package scripts preserve build and full test commands", () => {
  const packageJson = JSON.parse(source("package.json"));
  assert.equal(packageJson.scripts?.build, "vite build");
  assert.equal(packageJson.scripts?.test, "node --test tests/*.test.js");
});
