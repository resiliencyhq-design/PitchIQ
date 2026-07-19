import test from "node:test";
import assert from "node:assert/strict";
import { buildPostTrainingReflection } from "../js/app/post-training-coach-reflection.js";

test("reflection matches persisted mission", () => {
  const reflection = buildPostTrainingReflection({ mission: { id: "scan-1", title: "Scan First", drillId: "scanning" } });
  assert.equal(reflection.missionId, "scan-1");
  assert.equal(reflection.missionTitle, "Scan First");
  assert.match(reflection.prompt, /Scan First/);
});

test("reflection remains non-evaluative", () => {
  const reflection = buildPostTrainingReflection({ mission: { title: "Quick Decision" } });
  assert.deepEqual(reflection.options.map(option => option.id), ["noticed", "sometimes", "learning"]);
  assert.ok(reflection.options.every(option => !/score|ability|better player/i.test(option.response)));
});

test("reflection has a safe fallback", () => {
  const reflection = buildPostTrainingReflection(null);
  assert.equal(reflection.missionId, null);
  assert.equal(reflection.missionTitle, "today’s mission");
});
