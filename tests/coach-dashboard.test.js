import test from "node:test";
import assert from "node:assert/strict";
import { buildPlayerCoachSummary, buildSquadCoachDashboard } from "../src/coaching/coach-dashboard.js";

const profile = { constructs: { awareness:{score:71}, gameReading:{score:59}, decisionQuality:{score:68}, adaptability:{score:74}, useOfSpace:{score:64} } };

test("coach summary identifies formal strength and development priority", () => {
  const summary = buildPlayerCoachSummary({ playerName:"Alex", profile, evidenceSummary:{sessions:3,activeDays:2,evidenceQuality:.75} });
  assert.equal(summary.playerName,"Alex");
  assert.equal(summary.priority.id,"gameReading");
  assert.equal(summary.strength.id,"adaptability");
  assert.equal(summary.intervention.title,"Develop Game Reading");
});

test("coach summary reports evidence without recalculating Football IQ", () => {
  const summary = buildPlayerCoachSummary({ profile, evidenceSummary:{sessions:4,activeDays:3,ready:true} });
  assert.equal(summary.reassessmentReady,true);
  assert.equal(summary.engagement.sessions,4);
  assert.equal("footballIQ" in summary,false);
});

test("squad dashboard aggregates player summaries without ranking players", () => {
  const dashboard = buildSquadCoachDashboard([
    { playerId:"1", profile, evidenceSummary:{sessions:4,ready:true} },
    { playerId:"2", profile:{constructs:{awareness:{score:55}}}, evidenceSummary:{sessions:2} },
  ]);
  assert.equal(dashboard.squad.playerCount,2);
  assert.equal(dashboard.squad.reassessmentReady,1);
  assert.equal(dashboard.players.length,2);
  assert.equal("ranking" in dashboard.squad,false);
});
