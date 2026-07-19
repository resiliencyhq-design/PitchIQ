import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const assessment = fs.readFileSync("js/app/football-iq-assessment-s21-4.js", "utf8");
const ui = fs.readFileSync("js/app/football-iq-adaptive-ui-w1-5.js", "utf8");

test("assessment exposes four benchmark bands", () => {
  assert.match(assessment, /Elite/);
  assert.match(assessment, /Advanced/);
  assert.match(assessment, /Developing/);
  assert.match(assessment, /Foundation/);
});

test("assessment derives scores from persistent module progress", () => {
  assert.match(assessment, /moduleProgressSnapshot/);
  assert.match(assessment, /getFootballIqProgress/);
  assert.match(assessment, /footballIqSeason/);
});

test("assessment identifies strengths and development priorities", () => {
  assert.match(assessment, /strengths/);
  assert.match(assessment, /priorities/);
  assert.match(assessment, /score >= 70/);
});

test("phase checkpoints can be passed, ready, in progress or locked", () => {
  assert.match(assessment, /"passed"/);
  assert.match(assessment, /"ready"/);
  assert.match(assessment, /"in-progress"/);
  assert.match(assessment, /"locked"/);
});

test("library renders benchmark score and checkpoints", () => {
  assert.match(ui, /data-fiq-assessment-dashboard/);
  assert.match(ui, /Football IQ benchmark/);
  assert.match(ui, /Development priorities/);
  assert.match(ui, /assessment\.checkpoints/);
});
