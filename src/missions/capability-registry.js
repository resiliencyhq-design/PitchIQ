export const CAPABILITY_STATUS = Object.freeze({
  ACTIVE: "active",
  INTERFACE_ONLY: "interface_only",
  FUTURE: "future",
});

export const MISSION_CAPABILITIES = Object.freeze({
  lifecycle: { status: CAPABILITY_STATUS.ACTIVE, category: "core" },
  aiCoachBrief: { status: CAPABILITY_STATUS.ACTIVE, category: "core" },
  countdown: { status: CAPABILITY_STATUS.ACTIVE, category: "core" },
  timer: { status: CAPABILITY_STATUS.ACTIVE, category: "core" },
  pauseResume: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "core" },
  retry: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "core" },
  exitConfirmation: { status: CAPABILITY_STATUS.ACTIVE, category: "core" },
  rewards: { status: CAPABILITY_STATUS.ACTIVE, category: "core" },
  evidence: { status: CAPABILITY_STATUS.ACTIVE, category: "core" },
  analytics: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "core" },

  colourCue: { status: CAPABILITY_STATUS.ACTIVE, category: "cue" },
  directionCue: { status: CAPABILITY_STATUS.ACTIVE, category: "cue" },
  numberCue: { status: CAPABILITY_STATUS.ACTIVE, category: "cue" },
  patternCue: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "cue" },
  sequenceCue: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "cue" },
  dualTaskCue: { status: CAPABILITY_STATUS.ACTIVE, category: "cue" },
  videoScenario: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "scenario" },
  tacticalBoard: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "scenario" },
  animatedPlayers: { status: CAPABILITY_STATUS.FUTURE, category: "scenario" },

  screenTap: { status: CAPABILITY_STATUS.ACTIVE, category: "input" },
  directionalButtons: { status: CAPABILITY_STATUS.ACTIVE, category: "input" },
  swipe: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "input" },
  voice: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "input" },
  orientation: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "input" },
  cameraTracking: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "input" },
  externalController: { status: CAPABILITY_STATUS.FUTURE, category: "input" },
  wearable: { status: CAPABILITY_STATUS.FUTURE, category: "input" },

  accuracyScoring: { status: CAPABILITY_STATUS.ACTIVE, category: "scoring" },
  reactionTimeScoring: { status: CAPABILITY_STATUS.ACTIVE, category: "scoring" },
  decisionQualityScoring: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "scoring" },
  predictionQualityScoring: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "scoring" },
  positionQualityScoring: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "scoring" },
  consistencyScoring: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "scoring" },

  lidar: { status: CAPABILITY_STATUS.FUTURE, category: "sensor" },
  eyeTracking: { status: CAPABILITY_STATUS.FUTURE, category: "sensor" },
  ballTracking: { status: CAPABILITY_STATUS.INTERFACE_ONLY, category: "sensor" },
  poseEstimation: { status: CAPABILITY_STATUS.FUTURE, category: "sensor" },
  gps: { status: CAPABILITY_STATUS.FUTURE, category: "sensor" },
  heartRate: { status: CAPABILITY_STATUS.FUTURE, category: "sensor" },
  vr: { status: CAPABILITY_STATUS.FUTURE, category: "delivery" },
  arOverlay: { status: CAPABILITY_STATUS.FUTURE, category: "delivery" },
  multiplayer: { status: CAPABILITY_STATUS.FUTURE, category: "delivery" },
  remoteCoach: { status: CAPABILITY_STATUS.FUTURE, category: "delivery" },
  teamSync: { status: CAPABILITY_STATUS.FUTURE, category: "delivery" },
});

export function capabilityDefinition(capabilityId) {
  return MISSION_CAPABILITIES[capabilityId] || null;
}

export function validateCapabilities(capabilityIds = []) {
  const requested = [...new Set(capabilityIds)];
  const unknown = requested.filter((id) => !capabilityDefinition(id));
  return {
    valid: unknown.length === 0,
    requested,
    unknown,
  };
}
