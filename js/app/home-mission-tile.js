import { MISSION_LIFECYCLE, MISSION_TYPES } from "../../src/missions/mission-contract.js";
import { assignMission, readCurrentMission } from "../../src/missions/mission-store.js";

const HOME_MISSION_ID = "daily-football-iq";

export function createDefaultHomeMission(state = {}) {
  const level = Number(state.game?.level) || 1;
  const comboTarget = level <= 1 ? 3 : level === 2 ? 5 : level === 3 ? 7 : level === 4 ? 10 : level === 5 ? 12 : 15;
  return {
    id: HOME_MISSION_ID,
    type: MISSION_TYPES.FOOTBALL_IQ,
    title: "Beat yesterday. Think faster.",
    category: "Daily Football IQ",
    purpose: "Complete today’s universal football-intelligence mission.",
    artwork: "assets/Home/mission-reward-elite-boots.png",
    lifecycle: MISSION_LIFECYCLE.ASSIGNED,
    activity: {
      adapterId: "generic-football-iq-v1",
      route: "training",
      moduleId: "canonical-training",
      payload: { difficulty: "medium" },
    },
    objectives: [
      { id: "training-time", label: "Train for 5 minutes", target: 300, unit: "seconds" },
      { id: "combo", label: `Get a combo of ${comboTarget}`, target: comboTarget, unit: "combo" },
      { id: "scan-cues", label: "Scan 50 cues", target: 50, unit: "cues" },
    ],
    reward: { xp: 120, rewardId: "academy-boots", label: "Elite Boots" },
    metadata: { source: "home", tileVersion: 1 },
  };
}

export function resolveHomeMission(state = {}, storage = globalThis.localStorage) {
  const current = readCurrentMission(storage);
  if (current && ![MISSION_LIFECYCLE.COMPLETED, MISSION_LIFECYCLE.ABANDONED].includes(current.lifecycle)) return current;
  return assignMission(createDefaultHomeMission(state), storage);
}

export function missionTileAttributes(mission) {
  return `data-mission-id="${mission.id}" data-mission-type="${mission.type}" data-mission-lifecycle="${mission.lifecycle}"`;
}

export { HOME_MISSION_ID };
