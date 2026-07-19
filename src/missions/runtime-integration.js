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
