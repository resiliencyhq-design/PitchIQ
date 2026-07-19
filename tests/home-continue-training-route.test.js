import test from "node:test";
import assert from "node:assert/strict";

import {
  routeAdaptiveTrainingClick,
  TRAINING_ROUTE_SELECTOR,
} from "../js/app/home-adaptive-recommendation.js";

test("Continue Training delegates to the canonical Training navigation control", () => {
  let prevented = false;
  let stopped = false;
  let canonicalClicks = 0;

  const trigger = {};
  const event = {
    target: {
      closest(selector) {
        assert.equal(selector, TRAINING_ROUTE_SELECTOR);
        return trigger;
      },
    },
    preventDefault() { prevented = true; },
    stopImmediatePropagation() { stopped = true; },
  };

  const root = {
    querySelector(selector) {
      assert.equal(selector, '#nav [data-route="training"]');
      return { click() { canonicalClicks += 1; } };
    },
  };

  assert.equal(routeAdaptiveTrainingClick(event, root), true);
  assert.equal(prevented, true);
  assert.equal(stopped, true);
  assert.equal(canonicalClicks, 1);
});

test("unrelated clicks are ignored", () => {
  const event = {
    target: { closest() { return null; } },
  };

  assert.equal(routeAdaptiveTrainingClick(event, { querySelector() { throw new Error("should not query"); } }), false);
});

test("missing canonical Training navigation fails safely", () => {
  const event = {
    target: { closest() { return {}; } },
    preventDefault() { throw new Error("should not prevent"); },
    stopImmediatePropagation() { throw new Error("should not stop"); },
  };

  assert.equal(routeAdaptiveTrainingClick(event, { querySelector() { return null; } }), false);
});
