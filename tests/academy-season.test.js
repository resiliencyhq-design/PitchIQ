import test from "node:test";
import assert from "node:assert/strict";
import { academyLevel, buildAcademySeason, buildSeasonTimeline, buildWeeklyPlan } from "../src/season/academy-season.js";

const profile = {
  assessmentDate: "2026-07-01T00:00:00.000Z",
  constructs: {
    awareness: { score: 72 },
    gameReading: { score: 61 },
    decisionQuality: { score: 68 },
    adaptability: { score: 75 },
    useOfSpace: { score: 66 },
  },
};

test("weekly plan prioritises the two lowest formal construct scores", () => {
  const plan = buildWeeklyPlan({ profile, evidenceSummary: { sessions: 2 } });
  assert.equal(plan.primary.id, "gameReading");
  assert.equal(plan.secondary.id, "useOfSpace");
  assert.deepEqual(plan.progress, { completedSessions: 2, targetSessions: 4 });
});

test("academy levels reward engagement without reading Football IQ", () => {
  assert.equal(academyLevel({ sessions: 0, activeDays: 0 }).id, 1);
  assert.equal(academyLevel({ sessions: 8, activeDays: 2 }).id, 2);
  assert.equal(academyLevel({ sessions: 18, activeDays: 5, weeklyReviews: 1 }).id, 3);
});

test("season timeline orders academy milestones chronologically", () => {
  const timeline = buildSeasonTimeline({
    joinedAt: "2026-06-01T00:00:00.000Z",
    profiles: [profile, { assessmentDate: "2026-07-15T00:00:00.000Z" }],
    weeklyReviews: [{ createdAt: "2026-07-08T00:00:00.000Z" }],
  });
  assert.equal(timeline[0].type, "joined");
  assert.equal(timeline.at(-1).type, "reassessment");
});

test("season output does not modify or calculate Football IQ scores", () => {
  const season = buildAcademySeason({ profile, profiles: [profile], evidenceSummary: { sessions: 3, activeDays: 2, evidenceQuality: 0.6 } });
  assert.equal("footballIQ" in season, false);
  assert.equal(season.report.sessions, 3);
  assert.equal(season.plan.primary.id, "gameReading");
});
