export const TEAM_INTELLIGENCE_VERSION = "1.0.0";

const CONSTRUCTS = Object.freeze([
  "scanning",
  "decisionMaking",
  "positioning",
  "supportPlay",
  "defensiveAwareness",
  "communication"
]);

const LABELS = Object.freeze({
  scanning: "Scanning",
  decisionMaking: "Decision making",
  positioning: "Positioning",
  supportPlay: "Support play",
  defensiveAwareness: "Defensive awareness",
  communication: "Communication"
});

function boundedPlayers(players = []) {
  return Array.isArray(players) ? players.filter(Boolean).slice(0, 40) : [];
}

function normaliseTags(tags = []) {
  return [...new Set((Array.isArray(tags) ? tags : []).filter(tag => CONSTRUCTS.includes(tag)))];
}

export function buildSquadSnapshot(players = []) {
  const squad = boundedPlayers(players);
  return squad.map(player => ({
    id: player.id || null,
    name: String(player.name || "Player").slice(0, 60),
    trainingEvidenceCount: Math.max(0, Number(player.trainingEvidenceCount) || 0),
    matchEvidenceCount: Math.max(0, Number(player.matchEvidenceCount) || 0),
    readiness: Math.max(0, Math.min(1, Number(player.readiness) || 0)),
    lastReassessmentAt: player.lastReassessmentAt || null,
    priorityTags: normaliseTags(player.priorityTags),
    footballIQ: player.footballIQ || null
  }));
}

export function aggregateTeamEvidence(players = []) {
  const squad = buildSquadSnapshot(players);
  const counts = Object.fromEntries(CONSTRUCTS.map(key => [key, 0]));
  squad.forEach(player => player.priorityTags.forEach(tag => { counts[tag] += 1; }));
  const priorities = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([construct, playerCount]) => ({ construct, label: LABELS[construct], playerCount }));
  return {
    version: TEAM_INTELLIGENCE_VERSION,
    playerCount: squad.length,
    trainingEvidenceCount: squad.reduce((sum, player) => sum + player.trainingEvidenceCount, 0),
    matchEvidenceCount: squad.reduce((sum, player) => sum + player.matchEvidenceCount, 0),
    reassessmentReadyCount: squad.filter(player => player.readiness >= 0.8).length,
    priorities,
    updatesFootballIQ: false,
    ranksPlayers: false
  };
}

export function createSessionPlan(players = []) {
  const evidence = aggregateTeamEvidence(players);
  const primary = evidence.priorities[0] || { construct: "scanning", label: "Scanning", playerCount: 0 };
  const secondary = evidence.priorities[1] || primary;
  return {
    title: `${primary.label} team session`,
    primaryFocus: primary.construct,
    secondaryFocus: secondary.construct,
    objective: `Build ${primary.label.toLowerCase()} through representative decisions and guided reflection.`,
    smallGroupSuggestion: primary.playerCount > 1
      ? `Use a small group for ${primary.playerCount} players sharing this development priority.`
      : "Use whole-squad activities while preserving each player's individual focus.",
    reassessmentReadyCount: evidence.reassessmentReadyCount,
    updatesFootballIQ: false
  };
}
