import { CONSTRUCT_IDS, SCORING_VERSION } from "./contracts.js";
import { scoreConstruct } from "./constructs.js";
import { calculateIntegratedFIQ, evaluateMatchChallenge } from "./integration.js";
import { inferMatchMentality } from "./mentality.js";

export function scorePlayerProfile({ observations = [], matchChallengeObservations = [], now = new Date() }) {
  const constructs = Object.fromEntries(
    CONSTRUCT_IDS.map((constructId) => [
      constructId,
      scoreConstruct(constructId, observations, { now }),
    ]),
  );

  return {
    constructs,
    integratedFIQ: calculateIntegratedFIQ(constructs),
    matchChallenge: evaluateMatchChallenge(matchChallengeObservations, constructs),
    matchMentality: inferMatchMentality([...observations, ...matchChallengeObservations]),
    scoringVersion: SCORING_VERSION,
  };
}

export {
  calculateItemEvidence,
  calculateEfficiency,
} from "./item-evidence.js";
export { scoreConstruct, evaluateEvidenceThreshold } from "./constructs.js";
export { calculateIntegratedFIQ, evaluateMatchChallenge } from "./integration.js";
export { inferMatchMentality } from "./mentality.js";
export * from "./contracts.js";
