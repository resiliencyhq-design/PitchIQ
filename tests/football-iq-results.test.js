import test from "node:test";
import assert from "node:assert/strict";

import { renderFootballIQResults } from "../src/results/football-iq-results.js";

function profile({ complete = true } = {}) {
  const construct = (score = 75) => ({
    score,
    eligible: complete,
    confidence: complete ? "developing_confidence" : "emerging_evidence",
  });

  return {
    assessmentDate: "2026-07-19T00:00:00.000Z",
    evidenceStatus: {
      state: complete ? "complete" : "insufficient_evidence",
      eligibleConstructs: complete
        ? ["awareness", "gameReading", "decisionQuality", "adaptability", "useOfSpace"]
        : ["awareness"],
    },
    constructs: {
      awareness: construct(),
      gameReading: construct(),
      decisionQuality: construct(),
      adaptability: construct(),
      useOfSpace: construct(),
    },
    integratedFIQ: { score: complete ? 75 : null },
    matchChallenge: { indicator: "transfers_strongly" },
    matchMentality: {
      dimensions: {
        persistence: { band: "strong" },
        recoveryAfterError: { band: "developing" },
      },
    },
  };
}

test("complete profile renders score and all five dimensions", () => {
  const html = renderFootballIQResults({ profile: profile() });

  assert.match(html, /PROFILE UNLOCKED/);
  assert.match(html, /aria-label="Football IQ score 75"/);
  assert.match(html, /Awareness/);
  assert.match(html, /Game Reading/);
  assert.match(html, /Decision Quality/);
  assert.match(html, /Adaptability/);
  assert.match(html, /Use of Space/);
  assert.match(html, /Match Mentality/);
  assert.match(html, /Strong transfer/);
});

test("insufficient profile withholds integrated score", () => {
  const html = renderFootballIQResults({ profile: profile({ complete: false }) });

  assert.match(html, /PROFILE IN PROGRESS/);
  assert.match(html, /Football IQ score not yet available/);
  assert.match(html, /1 of 5 dimensions ready/);
  assert.doesNotMatch(html, /Football IQ score 75/);
});

test("missing profile uses positive evidence-building state", () => {
  const html = renderFootballIQResults({ profile: null });

  assert.match(html, /More evidence needed/);
  assert.match(html, /0 of 5 dimensions ready/);
  assert.match(html, /Every area can be developed/);
});