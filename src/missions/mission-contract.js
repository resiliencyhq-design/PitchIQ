export const MISSION_LIFECYCLE = Object.freeze({
  ASSIGNED: "assigned",
  BRIEFED: "briefed",
  ACTIVE: "active",
  RESULTS_READY: "results_ready",
  COMPLETED: "completed",
  ABANDONED: "abandoned",
});

export const MISSION_TYPES = Object.freeze({
  FOOTBALL_IQ: "football_iq",
  MIND_IQ: "mind_iq",
  CALM_SENSE: "calm_sense",
  REFLECTION: "reflection",
  ACADEMY: "academy",
  LAB: "lab",
});

export const MISSION_CONTRACT_VERSION = 1;

const VALID_TYPES = new Set(Object.values(MISSION_TYPES));
const VALID_STATES = new Set(Object.values(MISSION_LIFECYCLE));

function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`Mission ${field} must be a non-empty string`);
  }
  return value.trim();
}

function normalizeObjectives(objectives = []) {
  if (!Array.isArray(objectives)) throw new TypeError("Mission objectives must be an array");
  return objectives.map((objective, index) => ({
    id: assertNonEmptyString(objective?.id || `objective-${index + 1}`, "objective id"),
    label: assertNonEmptyString(objective?.label, "objective label"),
    target: Number.isFinite(objective?.target) ? objective.target : 1,
    unit: typeof objective?.unit === "string" ? objective.unit : "count",
  }));
}

export function createMissionContract(input = {}) {
  const type = assertNonEmptyString(input.type, "type");
  if (!VALID_TYPES.has(type)) throw new TypeError(`Unsupported mission type: ${type}`);

  const lifecycle = input.lifecycle || MISSION_LIFECYCLE.ASSIGNED;
  if (!VALID_STATES.has(lifecycle)) throw new TypeError(`Unsupported mission lifecycle: ${lifecycle}`);

  return Object.freeze({
    contractVersion: MISSION_CONTRACT_VERSION,
    id: assertNonEmptyString(input.id, "id"),
    type,
    title: assertNonEmptyString(input.title, "title"),
    category: assertNonEmptyString(input.category || type, "category"),
    purpose: typeof input.purpose === "string" ? input.purpose.trim() : "",
    artwork: typeof input.artwork === "string" ? input.artwork : "",
    lifecycle,
    activity: Object.freeze({
      adapterId: assertNonEmptyString(input.activity?.adapterId, "activity adapterId"),
      route: assertNonEmptyString(input.activity?.route || "training", "activity route"),
      moduleId: typeof input.activity?.moduleId === "string" ? input.activity.moduleId : null,
      payload: input.activity?.payload && typeof input.activity.payload === "object"
        ? Object.freeze({ ...input.activity.payload })
        : Object.freeze({}),
    }),
    objectives: Object.freeze(normalizeObjectives(input.objectives)),
    reward: Object.freeze({
      xp: Number.isFinite(input.reward?.xp) ? Math.max(0, input.reward.xp) : 0,
      rewardId: typeof input.reward?.rewardId === "string" ? input.reward.rewardId : null,
      label: typeof input.reward?.label === "string" ? input.reward.label : "",
    }),
    metadata: Object.freeze(input.metadata && typeof input.metadata === "object" ? { ...input.metadata } : {}),
    assignedAt: Number.isFinite(input.assignedAt) ? input.assignedAt : Date.now(),
    updatedAt: Number.isFinite(input.updatedAt) ? input.updatedAt : Date.now(),
  });
}

export function isMissionContract(value) {
  try {
    const normalized = createMissionContract(value);
    return normalized.id === value.id;
  } catch {
    return false;
  }
}
