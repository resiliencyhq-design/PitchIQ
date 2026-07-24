import test from "node:test";
import assert from "node:assert/strict";

import { NavigationController } from "../js/app/controllers/navigation-controller.js";
import { StateStore } from "../js/services/state-store.js";

class MemoryStorage {
  constructor(seed = {}) {
    this.values = new Map(Object.entries(seed));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

class MemoryEventTarget {
  constructor() {
    this.events = [];
  }

  dispatchEvent(event) {
    this.events.push(event);
    return true;
  }
}

if (typeof globalThis.CustomEvent === "undefined") {
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
    }
  };
}

test("NavigationController blocks protected routes until first run is complete", () => {
  let complete = false;
  const rendered = [];
  const routeChanges = [];
  const navigation = new NavigationController({
    validRoutes: ["splash", "onboard", "home", "training"],
    protectedRoutes: ["home", "training"],
    firstRun: {
      isComplete: () => complete,
      getEntryRoute: () => complete ? "home" : "onboard",
    },
    renderRoute: route => rendered.push(route),
    onRouteChange: route => routeChanges.push(route),
  });

  assert.equal(navigation.go("training"), "onboard");
  assert.equal(navigation.getCurrentRoute(), "onboard");

  complete = true;
  assert.equal(navigation.go("training"), "training");
  assert.deepEqual(rendered, ["onboard", "training"]);
  assert.deepEqual(routeChanges, ["onboard", "training"]);
});

test("NavigationController emits exactly one route change for one transition", () => {
  let renderCount = 0;
  let eventCount = 0;
  const navigation = new NavigationController({
    validRoutes: ["home", "player"],
    protectedRoutes: ["home", "player"],
    firstRun: { isComplete: () => true, getEntryRoute: () => "home" },
    renderRoute: () => { renderCount += 1; },
    onRouteChange: () => { eventCount += 1; },
  });

  navigation.go("player", { source: "test" });
  assert.equal(renderCount, 1);
  assert.equal(eventCount, 1);
});

test("StateStore migrates an unversioned payload without losing player data", () => {
  const storage = new MemoryStorage({
    pitchiq_integrated_v1: JSON.stringify({ profile: { name: "Alex", number: "9" } }),
  });
  const events = new MemoryEventTarget();
  const store = new StateStore({
    storage,
    key: "pitchiq_integrated_v1",
    version: 1,
    defaults: { profile: { name: "", number: "1" }, firstRun: { currentStep: "landing" } },
    normalize: state => ({
      ...state,
      profile: { name: "", number: "1", ...(state.profile || {}) },
      firstRun: { currentStep: "landing", ...(state.firstRun || {}) },
    }),
    eventTarget: events,
  });

  const loaded = store.load();
  assert.equal(loaded.profile.name, "Alex");
  assert.equal(loaded.profile.number, "9");
  assert.equal(loaded.firstRun.currentStep, "landing");

  store.replace(loaded, { source: "migration-proof" });
  const persisted = JSON.parse(storage.getItem("pitchiq_integrated_v1"));
  assert.equal(persisted.version, 1);
  assert.equal(persisted.data.profile.name, "Alex");
  assert.equal(events.events.length, 1);
  assert.equal(events.events[0].detail.source, "migration-proof");
});

test("StateStore snapshots are immutable and updates emit one state event", () => {
  const storage = new MemoryStorage();
  const events = new MemoryEventTarget();
  const store = new StateStore({
    storage,
    key: "state",
    version: 1,
    defaults: { game: { xp: 0 }, notifications: { items: [] } },
    normalize: value => value,
    eventTarget: events,
  });

  const initial = store.load();
  assert.ok(Object.isFrozen(initial));
  assert.ok(Object.isFrozen(initial.game));
  assert.throws(() => { initial.game.xp = 100; }, TypeError);

  const updated = store.update(draft => {
    draft.game.xp += 25;
  }, { source: "training-answer" });

  assert.equal(updated.game.xp, 25);
  assert.equal(events.events.length, 1);
  assert.equal(events.events[0].detail.source, "training-answer");
});

test("StateStore reset removes persisted state and restores defaults", () => {
  const storage = new MemoryStorage({ state: JSON.stringify({ version: 1, data: { profile: { name: "Sam" } } }) });
  const events = new MemoryEventTarget();
  const store = new StateStore({
    storage,
    key: "state",
    version: 1,
    defaults: { profile: { name: "" }, firstRun: { currentStep: "landing" } },
    normalize: value => value,
    eventTarget: events,
  });

  assert.equal(store.load().profile.name, "Sam");
  const reset = store.reset({ source: "player-reset" });
  assert.equal(reset.profile.name, "");
  assert.equal(reset.firstRun.currentStep, "landing");
  assert.equal(storage.getItem("state"), null);
  assert.equal(events.events.length, 1);
});
