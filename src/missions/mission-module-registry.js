import { validateCapabilities } from "./capability-registry.js";

const SHARED = Object.freeze([
  "lifecycle",
  "aiCoachBrief",
  "countdown",
  "timer",
  "exitConfirmation",
  "rewards",
  "evidence",
]);

export const MISSION_MODULES = Object.freeze({
  "scan-first": {
    moduleId: "scan-first",
    constructId: "awareness",
    status: "ready_for_runtime_adapter",
    capabilities: [...SHARED, "colourCue", "directionCue", "screenTap", "accuracyScoring", "reactionTimeScoring"],
  },
  "spot-the-cue": {
    moduleId: "spot-the-cue",
    constructId: "awareness",
    status: "planned",
    capabilities: [...SHARED, "patternCue", "sequenceCue", "screenTap", "accuracyScoring", "reactionTimeScoring"],
  },
  "scan-before-receive": {
    moduleId: "scan-before-receive",
    constructId: "awareness",
    status: "content_ready_generic_runtime",
    capabilities: [...SHARED, "directionCue", "screenTap", "accuracyScoring", "reactionTimeScoring"],
  },
  "scan-while-moving": {
    moduleId: "scan-while-moving",
    constructId: "awareness",
    status: "content_ready_generic_runtime",
    capabilities: [...SHARED, "sequenceCue", "dualTaskCue", "directionalButtons", "accuracyScoring", "reactionTimeScoring", "consistencyScoring"],
  },
  "transition-scan": {
    moduleId: "transition-scan",
    constructId: "awareness",
    status: "ready_for_runtime_adapter",
    capabilities: [...SHARED, "sequenceCue", "dualTaskCue", "directionalButtons", "accuracyScoring", "reactionTimeScoring", "decisionQualityScoring"],
  },
  "find-third-player": {
    moduleId: "find-third-player",
    constructId: "awareness",
    status: "ready_for_runtime_adapter",
    capabilities: [...SHARED, "sequenceCue", "directionalButtons", "accuracyScoring", "reactionTimeScoring"],
  },
  "see-beyond-ball": {
    moduleId: "see-beyond-ball",
    constructId: "awareness",
    status: "content_ready_generic_runtime",
    capabilities: [...SHARED, "patternCue", "sequenceCue", "screenTap", "accuracyScoring", "reactionTimeScoring"],
  },
  "track-three-players": {
    moduleId: "track-three-players",
    constructId: "awareness",
    status: "content_ready_generic_runtime",
    capabilities: [...SHARED, "sequenceCue", "dualTaskCue", "directionalButtons", "accuracyScoring", "reactionTimeScoring", "consistencyScoring"],
  },
  "predict-next-play": {
    moduleId: "predict-next-play",
    constructId: "gameReading",
    status: "content_ready_generic_runtime",
    capabilities: [...SHARED, "patternCue", "sequenceCue", "screenTap", "predictionQualityScoring", "reactionTimeScoring"],
  },
  "see-weak-side": {
    moduleId: "see-weak-side",
    constructId: "gameReading",
    status: "content_ready_generic_runtime",
    capabilities: [...SHARED, "tacticalBoard", "patternCue", "directionalButtons", "predictionQualityScoring", "reactionTimeScoring"],
  },
  "spot-overload": {
    moduleId: "spot-overload",
    constructId: "gameReading",
    status: "content_ready_generic_runtime",
    capabilities: [...SHARED, "tacticalBoard", "animatedPlayers", "directionalButtons", "predictionQualityScoring", "reactionTimeScoring", "consistencyScoring"],
  },
  "predict-next": {
    moduleId: "predict-next",
    constructId: "gameReading",
    status: "planned",
    capabilities: [...SHARED, "videoScenario", "tacticalBoard", "screenTap", "predictionQualityScoring"],
  },
  "read-pressure": {
    moduleId: "read-pressure",
    constructId: "gameReading",
    status: "planned",
    capabilities: [...SHARED, "dualTaskCue", "tacticalBoard", "directionalButtons", "predictionQualityScoring", "reactionTimeScoring"],
  },
  "best-option": {
    moduleId: "best-option",
    constructId: "decisionQuality",
    status: "planned",
    capabilities: [...SHARED, "videoScenario", "tacticalBoard", "directionalButtons", "decisionQualityScoring", "reactionTimeScoring"],
  },
  "fast-choice": {
    moduleId: "fast-choice",
    constructId: "decisionQuality",
    status: "planned",
    capabilities: [...SHARED, "directionCue", "patternCue", "directionalButtons", "decisionQualityScoring", "reactionTimeScoring"],
  },
  "change-the-plan": {
    moduleId: "change-the-plan",
    constructId: "adaptability",
    status: "planned",
    capabilities: [...SHARED, "dualTaskCue", "sequenceCue", "directionalButtons", "decisionQualityScoring", "consistencyScoring"],
  },
  "new-picture": {
    moduleId: "new-picture",
    constructId: "adaptability",
    status: "planned",
    capabilities: [...SHARED, "patternCue", "sequenceCue", "screenTap", "decisionQualityScoring", "consistencyScoring"],
  },
  "find-space": {
    moduleId: "find-space",
    constructId: "useOfSpace",
    status: "planned",
    capabilities: [...SHARED, "tacticalBoard", "swipe", "positionQualityScoring"],
  },
  "create-space": {
    moduleId: "create-space",
    constructId: "useOfSpace",
    status: "planned",
    capabilities: [...SHARED, "tacticalBoard", "animatedPlayers", "swipe", "positionQualityScoring"],
  },
});

export function getMissionModule(missionId) {
  const module = MISSION_MODULES[missionId];
  if (!module) return null;
  return {
    ...module,
    capabilities: [...module.capabilities],
  };
}

export function validateMissionModule(module) {
  if (!module?.moduleId || !module?.constructId) {
    return { valid: false, errors: ["moduleId and constructId are required"] };
  }

  const capabilityValidation = validateCapabilities(module.capabilities);
  return {
    valid: capabilityValidation.valid,
    errors: capabilityValidation.unknown.map((id) => `Unknown capability: ${id}`),
  };
}

export function validateMissionRegistry() {
  return Object.values(MISSION_MODULES).map((module) => ({
    moduleId: module.moduleId,
    ...validateMissionModule(module),
  }));
}
