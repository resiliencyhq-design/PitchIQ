import test from "node:test";
import assert from "node:assert/strict";

import {
  ADAPTIVE_CURRENT_KEY,
  homeRecommendationView,
  readHomeAdaptiveRecommendation,
} from "../js/app/home-adaptive-recommendation.js";

function memoryStorage(value = null) {
  return {
    getItem(key) {
      return key === ADAPTIVE_CURRENT_KEY && value ? JSON.stringify(value) : null;
    },
  };
}

test("shows a safe first-mission prompt when no recommendation exists", () => {
  const view = homeRecommendationView(null);
  assert.equal(view.mode, "empty");
  assert.match(view.title, /first Football IQ mission/i);
});

test("shows Today's focus for balanced evidence-building", () => {
  const view = homeRecommendationView({
    mode: "balanced_evidence_building",
    mission: {
      id: "find-space",
      drillId: "position",
      title: "Find the Space",
      description: "Recognise useful space before moving or receiving.",
    },
  });
  assert.equal(view.eyebrow, "Today's focus");
  assert.equal(view.focus, "Positioning mission");
  assert.equal(view.title, "Find the Space");
});

test("shows Your priority for personalised recommendations", () => {
  const view = homeRecommendationView({
    mode: "personalised",
    mission: { id: "best-option", drillId: "decision", title: "Choose the Best Option" },
  });
  assert.equal(view.eyebrow, "Your priority");
  assert.equal(view.focus, "Decision mission");
});

test("reads only a valid persisted selection", () => {
  const selection = { mode: "personalised", mission: { id: "scan-first", title: "Scan First" } };
  assert.deepEqual(readHomeAdaptiveRecommendation(memoryStorage(selection)), selection);
  assert.equal(readHomeAdaptiveRecommendation(memoryStorage()), null);
  assert.equal(readHomeAdaptiveRecommendation({ getItem: () => "not-json" }), null);
});