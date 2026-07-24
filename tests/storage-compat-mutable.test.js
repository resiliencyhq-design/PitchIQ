import test from "node:test";
import assert from "node:assert/strict";

class MemoryStorage {
  constructor(seed = {}) {
    this.values = new Map(Object.entries(seed));
  }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

if (typeof globalThis.window === "undefined") globalThis.window = {};
if (typeof globalThis.CustomEvent === "undefined") {
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
    }
  };
}

globalThis.localStorage = new MemoryStorage();
globalThis.window.localStorage = globalThis.localStorage;
globalThis.window.dispatchEvent = () => true;

const { loadState, saveState } = await import("../js/services/storage.js");

test("loadState returns a mutable detached compatibility state", () => {
  const state = loadState();

  assert.equal(Object.isFrozen(state), false);
  assert.equal(Object.isFrozen(state.profile), false);
  assert.doesNotThrow(() => {
    state.profile.name = "Alex";
    state.game.xp += 25;
    state.firstRun.currentStep = "name";
  });

  saveState(state);
  const persisted = JSON.parse(localStorage.getItem("pitchiq_integrated_v1"));
  assert.equal(persisted.data.profile.name, "Alex");
  assert.equal(persisted.data.game.xp, 25);
  assert.equal(persisted.data.firstRun.currentStep, "name");
});
