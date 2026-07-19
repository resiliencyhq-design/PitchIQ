export function createFootballIQDeveloperSnapshot({ evidence, scoringResult, profile }) {
  if (!evidence || !scoringResult || !profile) {
    throw new TypeError("Evidence, scoringResult and profile are required.");
  }

  return {
    assessment: {
      assessmentId: evidence.assessmentId,
      playerId: evidence.playerId,
      completedAt: evidence.completedAt,
    },
    evidence: {
      observationCount: evidence.observations.length,
      matchChallengeObservationCount: evidence.matchChallengeObservations.length,
      observations: evidence.observations,
      matchChallengeObservations: evidence.matchChallengeObservations,
    },
    scoring: scoringResult,
    profile: {
      profileVersion: profile.profileVersion,
      scoringVersion: profile.scoringVersion,
      evidenceStatus: profile.evidenceStatus,
      constructs: profile.constructs,
      integratedFIQ: profile.integratedFIQ,
      confidence: profile.confidence,
      matchChallenge: profile.matchChallenge,
      matchMentality: profile.matchMentality,
      generatedAt: profile.generatedAt,
    },
  };
}
