import test from "node:test";
import assert from "node:assert/strict";

import { renderPlayerDevelopment } from "../src/development/player-development.js";

const profile = {
  playerId: "player-1",
  profileVersion: "1.0.0",
  assessmentDate: "2026-07-19T00:00:00.000Z",
  evidenceStatus: {
    state: "complete",
    eligibleConstructs: ["awareness", "gameReading", "decisionQuality", "adaptability", "useOfSpace"],
  },
  integratedFIQ: { score: 78 },
};

const coaching = {
  evidenceStatus: { state: "ready" },
  strengths: [{
    label: "Awareness",
    confidence: "strong_confidence",
    statement: "You notice useful information before the ball arrives.",
  }],
  priorities: [{
    label: "Decision Quality",
    recommendationStrength: "provisional",
    statement: "Compare your options before choosing the most effective action.",
  }],
  focusAreas: [{
    type: "construct",
    label: "Decision Quality",
    statement: "Use a scan–options–choose routine before acting.",
  }],
};

test("ready Coaching Intelligence renders personalised development guidance", () => {
  const html = renderPlayerDevelopment({ profile, coaching });

  assert.match(html, /YOUR FOOTBALL IQ IS GROWING/);
  assert.match(html, /Football IQ score 78/);
  assert.match(html, /MY STRENGTH/);
  assert.match(html, /Awareness/);
  assert.match(html, /MY NEXT FOCUS/);
  assert.match(html, /Decision Quality/);
  assert.match(html, /RECOMMENDED TRAINING FOCUS/);
  assert.match(html, /scan–options–choose/);
  assert.match(html, /data-development-route="results"/);
});

test("insufficient Coaching Intelligence withholds priorities positively", () => {
  const html = renderPlayerDevelopment({
    profile: { ...profile, evidenceStatus: { state: "insufficient_evidence", eligibleConstructs: ["awareness"] } },
    coaching: { evidenceStatus: { state: "insufficient_evidence" } },
  });

  assert.match(html, /Your next focus is still taking shape/);
  assert.match(html, /1 of 5 dimensions ready/);
  assert.match(html, /No development priority is shown/);
  assert.doesNotMatch(html, /MY NEXT FOCUS/);
});

test("missing profile and coaching render a safe starting state", () => {
  const html = renderPlayerDevelopment({ profile: null, coaching: null });

  assert.match(html, /PROFILE IN PROGRESS/);
  assert.match(html, /0 of 5 dimensions ready/);
  assert.match(html, /Keep showing how you think/);
});
