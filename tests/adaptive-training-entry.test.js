import test from "node:test";
import assert from "node:assert/strict";

import {
  applyAdaptiveMissionToTrainingScreen,
  fallbackSelection,
} from "../js/app/adaptive-training-entry.js";

function element() {
  return {
    textContent: "",
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
  };
}

function fakeScreen() {
  const nodes = {
    ".reactive-top span": element(),
    ".reactive-phase": element(),
    ".reactive-cue": element(),
    ".reactive-feedback": element(),
    '[data-action="start-mission-training"]': element(),
  };
  return {
    dataset: {},
    nodes,
    querySelector(selector) { return nodes[selector] || null; },
  };
}

test("fallback selection always provides a safe scanning mission", () => {
  const selection = fallbackSelection();
  assert.equal(selection.mode, "fallback");
  assert.equal(selection.mission.drillId, "scanning");
  assert.equal(selection.mission.title, "Scan First");
});

test("training screen receives the selected mission without changing its start action", () => {
  const screen = fakeScreen();
  const selection = {
    mode: "balanced_evidence_building",
    mission: {
      id: "spot-the-cue",
      drillId: "vision",
      title: "Spot the Cue",
      description: "Notice useful information early.",
    },
  };

  assert.equal(applyAdaptiveMissionToTrainingScreen(screen, selection), true);
  assert.equal(screen.dataset.adaptiveMissionId, "spot-the-cue");
  assert.equal(screen.dataset.adaptiveMode, "balanced_evidence_building");
  assert.equal(screen.nodes[".reactive-top span"].textContent, "Vision mission");
  assert.equal(screen.nodes[".reactive-phase"].textContent, "Today's focus");
  assert.equal(screen.nodes[".reactive-cue"].textContent, "SPOT THE CUE");
  assert.equal(screen.nodes[".reactive-feedback"].textContent, "Notice useful information early.");
  assert.equal(screen.nodes['[data-action="start-mission-training"]'].textContent, "ENTER LIVE REP →");
});

test("personalised selections are labelled as the player's priority", () => {
  const screen = fakeScreen();
  applyAdaptiveMissionToTrainingScreen(screen, {
    mode: "personalised",
    mission: {
      id: "find-space",
      drillId: "position",
      title: "Find the Space",
      description: "Recognise useful space before moving.",
    },
  });

  assert.equal(screen.nodes[".reactive-phase"].textContent, "Your priority");
  assert.equal(screen.nodes[".reactive-top span"].textContent, "Positioning mission");
});

test("missing screen or selection fails closed", () => {
  assert.equal(applyAdaptiveMissionToTrainingScreen(null, fallbackSelection()), false);
  assert.equal(applyAdaptiveMissionToTrainingScreen(fakeScreen(), null), false);
});
