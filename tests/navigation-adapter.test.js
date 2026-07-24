import test from "node:test";
import assert from "node:assert/strict";
import { createNavigationAdapter } from "../js/app/navigation/navigation-adapter.js";

function createFixture({ step = "landing", entryRoute = "onboard", hash = "" } = {}) {
  const calls = [];
  const navigation = {
    go(route, context) {
      calls.push({ route, context });
      return route;
    },
  };
  const completed = [];
  const firstRun = {
    getCurrentStep: () => step,
    completeStep: (value) => completed.push(value),
    getEntryRoute: () => entryRoute,
  };
  const historyCalls = [];
  const location = { pathname: "/PitchIQ/", search: "?dev=1", hash };
  const adapter = createNavigationAdapter({
    navigation,
    firstRun,
    history: { replaceState: (...args) => historyCalls.push(args) },
    location,
  });
  return { adapter, calls, completed, historyCalls, location };
}

test("enterFromLanding completes landing and uses the guarded entry route", () => {
  const fixture = createFixture({ step: "landing", entryRoute: "onboard" });
  assert.equal(fixture.adapter.enterFromLanding(), "onboard");
  assert.deepEqual(fixture.completed, ["landing"]);
  assert.deepEqual(fixture.calls, [{ route: "onboard", context: { source: "landing" } }]);
});

test("enterHomeFromModule redirects incomplete first run through navigation", () => {
  const fixture = createFixture({ step: "avatar", entryRoute: "onboard" });
  assert.equal(fixture.adapter.enterHomeFromModule("academy"), "onboard");
  assert.equal(fixture.historyCalls.length, 0);
  assert.deepEqual(fixture.calls, [{ route: "onboard", context: { source: "academy" } }]);
});

test("enterHomeFromModule clears academy hash before guarded Home navigation", () => {
  const fixture = createFixture({ step: "complete", entryRoute: "home" });
  assert.equal(fixture.adapter.enterHomeFromModule("academy"), "home");
  assert.deepEqual(fixture.historyCalls, [[null, "", "/PitchIQ/?dev=1"]]);
  assert.deepEqual(fixture.calls, [{ route: "home", context: { source: "academy" } }]);
});

test("enterAcademy writes the canonical academy hash through the adapter", () => {
  const fixture = createFixture();
  assert.equal(fixture.adapter.enterAcademy(), "academy-trial");
  assert.deepEqual(fixture.historyCalls, [[null, "", "/PitchIQ/?dev=1#academy-trial"]]);
});

test("normalizeAcademyRoute upgrades the legacy plural hash", () => {
  const fixture = createFixture();
  assert.equal(fixture.adapter.normalizeAcademyRoute("#academy-trials"), "academy-trial");
  assert.deepEqual(fixture.historyCalls, [[null, "", "/PitchIQ/?dev=1#academy-trial"]]);
});
