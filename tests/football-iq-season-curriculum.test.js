import test from "node:test";
import assert from "node:assert/strict";
import { FOOTBALL_IQ_CURRICULUM, footballIqSeason, curriculumModuleState } from "../js/app/football-iq-curriculum-s21-3.js";

const blankProgress = { totalXp:0, level:1, completedMissionIds:[], missions:{} };

function completedProgress(score=80){
  return {
    totalXp:200,
    level:3,
    completedMissionIds:[
      "scan-before-receive","predict-next-play","find-third-player","play-forward-or-secure","move-before-pass","read-the-trigger","early-information",
    ],
    missions:Object.fromEntries([
      "scan-before-receive","predict-next-play","find-third-player","play-forward-or-secure","move-before-pass","read-the-trigger","early-information",
    ].map(id => [id,{ completed:true, attempts:1, personalBest:score, lastPlayed:"2026-07-19T10:00:00.000Z" }]))
  };
}

test("curriculum defines a complete 12-week four-phase pathway", () => {
  assert.equal(FOOTBALL_IQ_CURRICULUM.length, 4);
  assert.deepEqual(FOOTBALL_IQ_CURRICULUM.map(phase => phase.weeks), ["Weeks 1–3","Weeks 4–6","Weeks 7–9","Weeks 10–12"]);
  const modules = FOOTBALL_IQ_CURRICULUM.flatMap(phase => phase.modules);
  assert.deepEqual(modules, ["awareness","scanning","vision","anticipation","decision","positioning","communication"]);
});

test("new players begin in the Foundation phase", () => {
  const season = footballIqSeason(blankProgress);
  assert.equal(season.activePhase.id, "foundation");
  assert.equal(season.completedPhases, 0);
  assert.equal(season.percent, 0);
});

test("completed performance advances the season and reaches 100 percent", () => {
  const season = footballIqSeason(completedProgress());
  assert.equal(season.completedPhases, 4);
  assert.equal(season.percent, 100);
  assert.ok(season.phases.every(phase => phase.status === "complete"));
});

test("module state resolves its curriculum phase and live mastery", () => {
  const state = curriculumModuleState("decision", completedProgress(75));
  assert.equal(state.phase.id, "act-early");
  assert.equal(state.phaseIndex, 2);
  assert.equal(state.moduleProgress.mastery, "Strong");
});
