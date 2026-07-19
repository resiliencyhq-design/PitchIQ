export const COACH_DASHBOARD_VERSION = "1.0.0";

const CONSTRUCTS = [
  ["awareness", "Awareness"],
  ["gameReading", "Game Reading"],
  ["decisionQuality", "Decision Quality"],
  ["adaptability", "Adaptability"],
  ["useOfSpace", "Use of Space"],
];

function constructRows(profile = {}) {
  return CONSTRUCTS.map(([id, label]) => {
    const score = profile?.constructs?.[id]?.score;
    return { id, label, score: Number.isFinite(score) ? score : null };
  });
}

export function buildPlayerCoachSummary({ playerId = "current-player", playerName = "Player", profile = null, evidenceSummary = {}, season = null } = {}) {
  const constructs = constructRows(profile);
  const scored = constructs.filter(item => item.score !== null).sort((a, b) => a.score - b.score);
  const priority = scored[0] || { id: "awareness", label: "Awareness", score: null };
  const strength = scored.at(-1) || { id: "awareness", label: "Awareness", score: null };
  const sessions = Number(evidenceSummary.sessions) || 0;
  const activeDays = Number(evidenceSummary.activeDays) || 0;
  const evidenceQuality = Number(evidenceSummary.evidenceQuality) || 0;
  const readiness = evidenceSummary.ready === true || evidenceSummary.status === "ready";
  return {
    version: COACH_DASHBOARD_VERSION,
    playerId,
    playerName,
    priority,
    strength,
    constructs,
    engagement: { sessions, activeDays, evidenceQuality },
    academyLevel: season?.level?.label || "Academy Level 1",
    reassessmentReady: readiness,
    intervention: {
      title: `Develop ${priority.label}`,
      rationale: priority.score === null ? "Build baseline evidence before setting a scored priority." : `${priority.label} is currently the lowest formal Football IQ construct.`,
      action: sessions < 2 ? "Complete two focused training sessions." : `Use the next mission to target ${priority.label}.`,
    },
  };
}

export function buildSquadCoachDashboard(players = []) {
  const summaries = players.map(buildPlayerCoachSummary);
  const readyCount = summaries.filter(player => player.reassessmentReady).length;
  const priorityCounts = summaries.reduce((acc, player) => {
    acc[player.priority.id] = (acc[player.priority.id] || 0) + 1;
    return acc;
  }, {});
  const commonPriorityId = Object.entries(priorityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const commonPriority = CONSTRUCTS.find(([id]) => id === commonPriorityId)?.[1] || "No shared priority yet";
  return {
    version: COACH_DASHBOARD_VERSION,
    players: summaries,
    squad: {
      playerCount: summaries.length,
      reassessmentReady: readyCount,
      commonPriority,
      averageSessions: summaries.length ? summaries.reduce((sum, player) => sum + player.engagement.sessions, 0) / summaries.length : 0,
    },
  };
}
