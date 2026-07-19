const CONSTRUCTS = [
  ["awareness", "Awareness"],
  ["gameReading", "Game Reading"],
  ["decisionQuality", "Decision Quality"],
  ["adaptability", "Adaptability"],
  ["useOfSpace", "Use of Space"],
];

function dateValue(profile) {
  return Date.parse(profile?.assessmentDate || profile?.generatedAt || profile?.assessedAt || 0) || 0;
}

function scoreFor(profile, id) {
  const value = profile?.constructs?.[id]?.score;
  return Number.isFinite(value) ? value : null;
}

export function sortFootballIQHistory(profiles = []) {
  return [...profiles].filter(Boolean).sort((a, b) => dateValue(b) - dateValue(a));
}

export function compareFootballIQProfiles(current, previous) {
  return CONSTRUCTS.map(([id, label]) => {
    const currentScore = scoreFor(current, id);
    const previousScore = scoreFor(previous, id);
    return {
      id,
      label,
      currentScore,
      previousScore,
      delta: currentScore != null && previousScore != null ? currentScore - previousScore : null,
    };
  });
}

export function evidenceConfidence(readiness) {
  if (readiness?.ready) return { id: "ready", label: "Assessment Ready" };
  const quality = Number(readiness?.summary?.evidenceQuality) || 0;
  if (quality >= 0.72) return { id: "high", label: "High" };
  if (quality >= 0.42) return { id: "moderate", label: "Moderate" };
  return { id: "building", label: "Building" };
}

export function buildFootballIQProgress({ profiles = [], readiness = null } = {}) {
  const history = sortFootballIQHistory(profiles);
  const current = history[0] || null;
  const previous = history[1] || null;
  return {
    current,
    previous,
    history,
    changes: compareFootballIQProfiles(current, previous),
    confidence: evidenceConfidence(readiness),
    readiness,
  };
}

export { CONSTRUCTS as FOOTBALL_IQ_PROGRESS_CONSTRUCTS };
