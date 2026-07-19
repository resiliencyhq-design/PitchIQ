import { resolveMissionRuntime } from "./mission-runtime.js";

export const RUNTIME_ADAPTER_STATUS = Object.freeze({
  NATIVE: "native",
  GENERIC_FALLBACK: "generic_fallback",
});

const NATIVE_ADAPTERS = Object.freeze({
  "scan-first": Object.freeze({
    adapterId: "scan-first-v1",
    cueProfile: "scan-colour-direction",
    scoringProfile: "accuracy-reaction",
  }),
  "spot-the-cue": Object.freeze({
    adapterId: "spot-the-cue-v1",
    cueProfile: "pattern-recognition",
    scoringProfile: "accuracy-reaction-sequence",
  }),
  "predict-next": Object.freeze({
    adapterId: "predict-next-v1",
    cueProfile: "pattern-anticipation",
    scoringProfile: "prediction-accuracy-reaction-confidence",
  }),
  "read-pressure": Object.freeze({
    adapterId: "read-pressure-v1",
    cueProfile: "pressure-source-intensity-direction",
    scoringProfile: "pressure-recognition-decision-reaction",
  }),
  "find-third-player": Object.freeze({
    adapterId: "find-third-player-v1",
    cueProfile: "third-player-lane-recognition",
    scoringProfile: "third-player-identification-scanning-reaction",
  }),
});

export function resolveMissionIntegration(selection, options = {}) {
  const missionId = selection?.mission?.id;
  if (!missionId) {
    throw new Error("Adaptive mission selection is missing a mission id");
  }

  const runtime = resolveMissionRuntime(missionId, options);
  const adapter = NATIVE_ADAPTERS[missionId] || null;

  return Object.freeze({
    missionId,
    missionTitle: selection.mission.title || missionId,
    constructId: runtime.constructId,
    runtime,
    adapterStatus: adapter ? RUNTIME_ADAPTER_STATUS.NATIVE : RUNTIME_ADAPTER_STATUS.GENERIC_FALLBACK,
    adapter,
    fallbackReason: adapter ? null : "Mission-specific live runtime is not implemented yet.",
  });
}

export function integrationUsesCapability(integration, capabilityId) {
  return Boolean(integration?.runtime?.enabledCapabilities?.some((item) => item.id === capabilityId));
}

export function missionHasNativeAdapter(missionId) {
  return Boolean(NATIVE_ADAPTERS[missionId]);
}
