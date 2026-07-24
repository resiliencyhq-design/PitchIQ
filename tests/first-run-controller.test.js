import test from "node:test";
import assert from "node:assert/strict";
import { FirstRunController, FIRST_RUN_STEPS } from "../js/app/controllers/first-run-controller.js";

class MemoryStorage {
  constructor(entries = {}) { this.values = new Map(Object.entries(entries)); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

function playerService(player = {}) {
  return { getPlayer: () => ({ ...player }) };
}

test("first run only advances the current step", () => {
  const controller = new FirstRunController({ storage: new MemoryStorage(), playerService: playerService() });
  controller.completeStep("number");
  assert.equal(controller.getCurrentStep(), "landing");
  controller.completeStep("landing");
  assert.equal(controller.getCurrentStep(), "name");
  controller.completeStep("name");
  assert.equal(controller.getCurrentStep(), "number");
});

test("complete canonical flow reaches Home entry", () => {
  const storage = new MemoryStorage();
  const controller = new FirstRunController({ storage, playerService: playerService() });
  for (const step of FIRST_RUN_STEPS.slice(0, -1)) controller.completeStep(step);
  assert.equal(controller.isComplete(), true);
  assert.equal(controller.getEntryRoute(), "home");
  assert.equal(controller.getCurrentStep(), "complete");
});

test("repair returns to earliest missing completed requirement", () => {
  const storage = new MemoryStorage({
    pitchiqFirstRun: JSON.stringify({
      version: 1,
      status: "in_progress",
      currentStep: "avatar",
      completedSteps: FIRST_RUN_STEPS.slice(0, FIRST_RUN_STEPS.indexOf("avatar")),
      completedAt: null,
    }),
    pitchiqJerseyNumber: "10",
    pitchiqSelectedPosition: "CAM",
  });
  const controller = new FirstRunController({
    storage,
    playerService: playerService({ name: "Alex", number: "10", position: "CAM" }),
  });
  controller.repair();
  assert.equal(controller.getCurrentStep(), "player-contract");
});

test("repair recognises canonical Academy contract, avatar and style keys", () => {
  const storage = new MemoryStorage({
    pitchiqFirstRun: JSON.stringify({
      version: 1,
      status: "complete",
      currentStep: "complete",
      completedSteps: FIRST_RUN_STEPS.slice(0, -1),
      completedAt: "2026-07-24T00:00:00.000Z",
    }),
    pitchiqPlayerContract: JSON.stringify({ accepted: true, version: "2026-07" }),
    pitchiqGuardianEmail: "guardian@example.com",
    pitchiqAcademyAvatar: "captain",
    pitchiqPlayerStyle: "playmaker",
  });
  const controller = new FirstRunController({
    storage,
    playerService: playerService({ name: "Alex", number: "10", position: "CAM" }),
  });
  controller.repair();
  assert.equal(controller.getCurrentStep(), "complete");
  assert.equal(controller.getEntryRoute(), "home");
});

test("reset returns first run to landing", () => {
  const storage = new MemoryStorage();
  const controller = new FirstRunController({ storage, playerService: playerService() });
  controller.completeStep("landing");
  controller.reset();
  assert.equal(controller.getCurrentStep(), "landing");
  assert.equal(controller.getEntryRoute(), "splash");
  assert.equal(storage.getItem("pitchiqFirstRun"), null);
});
