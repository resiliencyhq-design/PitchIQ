export function createCoachingIntelligenceDebugSnapshot(output) {
  if (!output || typeof output !== "object") return { valid: false, errors: ["Output is missing."] };

  const errors = [];
  if (!output.coachingVersion) errors.push("coachingVersion is missing.");
  if (!output.playerId) errors.push("playerId is missing.");
  if (!output.sourceAssessmentId) errors.push("sourceAssessmentId is missing.");
  if (!output.evidenceStatus?.state) errors.push("evidenceStatus.state is missing.");

  const ready = output.evidenceStatus?.state === "ready";
  if (ready && !output.strengths?.length) errors.push("Ready output requires an established strength.");
  if (ready && !output.priorities?.length) errors.push("Ready output requires at least one priority.");
  if (!ready && (output.strengths?.length || output.priorities?.length)) {
    errors.push("Insufficient-evidence output must withhold strengths and priorities.");
  }

  return {
    valid: errors.length === 0,
    errors,
    summary: {
      coachingVersion: output.coachingVersion ?? null,
      playerId: output.playerId ?? null,
      sourceAssessmentId: output.sourceAssessmentId ?? null,
      evidenceState: output.evidenceStatus?.state ?? null,
      strengthCount: output.strengths?.length ?? 0,
      priorityCount: output.priorities?.length ?? 0,
      focusAreaCount: output.focusAreas?.length ?? 0,
      nextAssessmentNeeded: Boolean(output.nextAssessmentNeed),
    },
  };
}
