import test from "node:test";
import assert from "node:assert/strict";

const store = new Map();
globalThis.localStorage = {
  getItem:key => store.get(key) || null,
  setItem:(key,value) => store.set(key,value),
};
globalThis.sessionStorage = {
  getItem:key => store.get(`session:${key}`) || null,
  setItem:(key,value) => store.set(`session:${key}`,value),
  removeItem:key => store.delete(`session:${key}`),
};
globalThis.CustomEvent = class CustomEvent { constructor(type, init={}){ this.type=type; this.detail=init.detail; } };
globalThis.window = { addEventListener(){}, dispatchEvent(){} };

const { adaptiveFootballIqPlan, footballIqRecommendations } = await import("../js/app/football-iq-recommendations-w1-5.js?test=s21-2");

test("adaptive plan returns a focused ordered training sequence", () => {
  const progress = { totalXp:0, level:1, completedMissionIds:[], missions:{} };
  const plan = adaptiveFootballIqPlan(progress, 3);
  assert.ok(plan.focus);
  assert.ok(plan.focusLabel);
  assert.equal(plan.missions.length, 3);
  assert.equal(plan.totalMinutes, plan.missions.reduce((sum, mission) => sum + mission.minutes, 0));
  assert.match(plan.rationale, /priority|trained|opportunity|least-developed/i);
});

test("low personal-best performance is prioritised for improvement", () => {
  const progress = {
    totalXp:30,
    level:1,
    completedMissionIds:["predict-next-play"],
    missions:{
      "predict-next-play":{ completed:true, attempts:2, personalBest:42, lastPlayed:"2026-07-18T10:00:00.000Z" },
    },
  };
  const recommendations = footballIqRecommendations(3, progress);
  assert.equal(recommendations[0].id, "predict-next-play");
  assert.match(recommendations[0].recommendationReason, /42% personal best/i);
});

test("locked missions are excluded until the player reaches their level", () => {
  const levelOne = { totalXp:0, level:1, completedMissionIds:[], missions:{} };
  const ids = footballIqRecommendations(20, levelOne).map(mission => mission.id);
  assert.equal(ids.includes("read-the-trigger"), false);
  assert.equal(ids.includes("early-information"), false);
});