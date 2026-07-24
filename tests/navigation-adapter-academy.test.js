import test from "node:test";
import assert from "node:assert/strict";
import { createNavigationAdapter } from "../js/app/navigation/navigation-adapter.js";

function createHarness({ hash = "", currentStep = "academy-induction", entryRoute = "onboard" } = {}) {
  const calls = [];
  const location = { pathname: "/PitchIQ/", search: "?dev=1", hash };
  const history = {
    replaceState(_state, _title, url) {
      const [pathAndSearch, nextHash = ""] = url.split("#");
      location.hash = nextHash ? `#${nextHash}` : "";
      calls.push({ type: "replace", url, pathAndSearch });
    },
  };
  const navigation = {
    go(route, context) {
      calls.push({ type: "go", route, context });
      return route;
    },
  };
  const firstRun = {
    getCurrentStep: () => currentStep,
    completeStep: (step) => calls.push({ type: "complete", step }),
    getEntryRoute: () => entryRoute,
  };
  return { calls, location, history, navigation, firstRun };
}

test("enterAcademy writes the canonical academy hash", () => {
  const harness = createHarness();
  const originalWindow = globalThis.window;
  globalThis.window = { dispatchEvent() {}, HashChangeEvent: globalThis.HashChangeEvent };
  const adapter = createNavigationAdapter(harness);
  assert.equal(adapter.enterAcademy("test"), "academy-trial");
  assert.equal(harness.location.hash, "#academy-trial");
  globalThis.window = originalWindow;
});

test("normalizeAcademyRoute upgrades the legacy plural route", () => {
  const harness = createHarness({ hash: "#academy-trials" });
  const originalWindow = globalThis.window;
  globalThis.window = { dispatchEvent() {} };
  const adapter = createNavigationAdapter(harness);
  assert.equal(adapter.normalizeAcademyRoute(), "academy-trial");
  assert.equal(harness.location.hash, "#academy-trial");
  globalThis.window = originalWindow;
});

test("normalizeAcademyRoute preserves the canonical route", () => {
  const harness = createHarness({ hash: "#academy-trial" });
  const originalWindow = globalThis.window;
  globalThis.window = { dispatchEvent() {} };
  const adapter = createNavigationAdapter(harness);
  assert.equal(adapter.normalizeAcademyRoute(), "academy-trial");
  assert.equal(harness.calls.length, 0);
  globalThis.window = originalWindow;
});
