import { capabilityDefinition, CAPABILITY_STATUS } from "./capability-registry.js";
import { getMissionModule, validateMissionModule } from "./mission-module-registry.js";

export const MISSION_RUNTIME_VERSION = "1.0.0";

export function resolveMissionRuntime(missionId, options = {}) {
  const module = getMissionModule(missionId);
  if (!module) {
    throw new Error(`No mission module registered for: ${missionId}`);
  }

  const validation = validateMissionModule(module);
  if (!validation.valid) {
    throw new Error(`Invalid mission module ${missionId}: ${validation.errors.join(", ")}`);
  }

  const allowInterfaceOnly = options.allowInterfaceOnly !== false;
  const enabled = [];
  const dormant = [];

  for (const capabilityId of module.capabilities) {
    const definition = capabilityDefinition(capabilityId);
    const canActivate = definition.status === CAPABILITY_STATUS.ACTIVE
      || (allowInterfaceOnly && definition.status === CAPABILITY_STATUS.INTERFACE_ONLY);

    (canActivate ? enabled : dormant).push({
      id: capabilityId,
      status: definition.status,
      category: definition.category,
    });
  }

  return {
    runtimeVersion: MISSION_RUNTIME_VERSION,
    missionId,
    moduleId: module.moduleId,
    constructId: module.constructId,
    moduleStatus: module.status,
    enabledCapabilities: enabled,
    dormantCapabilities: dormant,
  };
}

export function capabilityIsEnabled(runtime, capabilityId) {
  return Boolean(runtime?.enabledCapabilities?.some((capability) => capability.id === capabilityId));
}
