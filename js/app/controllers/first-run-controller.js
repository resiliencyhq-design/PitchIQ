const FIRST_RUN_VERSION = 1;
const STORAGE_KEY = "pitchiqFirstRun";

export const FIRST_RUN_STEPS = Object.freeze([
  "landing",
  "name",
  "number",
  "position",
  "know-your-strengths",
  "academy-induction",
  "meet-your-coach",
  "meet-the-camera",
  "practice",
  "player-contract",
  "avatar",
  "player-style",
  "complete",
]);

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function defaultState() {
  return {
    version: FIRST_RUN_VERSION,
    status: "not_started",
    currentStep: "landing",
    completedSteps: [],
    completedAt: null,
  };
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export class FirstRunController {
  constructor({ storage = window.localStorage, playerService, onChange = () => {} } = {}) {
    this.storage = storage;
    this.playerService = playerService;
    this.onChange = onChange;
    this.state = this.#load();
  }

  getState() {
    return { ...this.state, completedSteps: [...this.state.completedSteps] };
  }

  getCurrentStep() {
    return this.state.currentStep;
  }

  isComplete() {
    return this.state.status === "complete";
  }

  getEntryRoute() {
    return this.isComplete() ? "home" : this.state.currentStep === "landing" ? "splash" : "onboard";
  }

  canEnter(step) {
    const requestedIndex = FIRST_RUN_STEPS.indexOf(step);
    const currentIndex = FIRST_RUN_STEPS.indexOf(this.state.currentStep);
    return requestedIndex >= 0 && requestedIndex <= Math.max(currentIndex, 0);
  }

  completeStep(step) {
    const index = FIRST_RUN_STEPS.indexOf(step);
    if (index < 0 || step === "complete" || step !== this.state.currentStep) return this.getState();

    const completedSteps = new Set(this.state.completedSteps);
    completedSteps.add(step);
    const nextStep = FIRST_RUN_STEPS[index + 1] || "complete";
    this.state = {
      ...this.state,
      status: nextStep === "complete" ? "complete" : "in_progress",
      currentStep: nextStep,
      completedSteps: [...completedSteps],
      completedAt: nextStep === "complete" ? new Date().toISOString() : null,
    };
    this.#save();
    return this.getState();
  }

  setCurrentStep(step) {
    if (!FIRST_RUN_STEPS.includes(step)) return this.getState();
    this.state = {
      ...this.state,
      status: step === "landing" ? "not_started" : step === "complete" ? "complete" : "in_progress",
      currentStep: step,
      completedAt: step === "complete" ? this.state.completedAt || new Date().toISOString() : null,
    };
    this.#save();
    return this.getState();
  }

  reset() {
    this.state = defaultState();
    this.storage.removeItem(STORAGE_KEY);
    this.onChange(this.getState());
    return this.getState();
  }

  repair() {
    const player = this.playerService?.getPlayer?.() || {};
    const contract = safeParse(this.storage.getItem("pitchiqPlayerContract")) || {};
    const requirements = [
      ["name", player.name],
      ["number", player.number || this.storage.getItem("pitchiqJerseyNumber")],
      ["position", player.position || this.storage.getItem("pitchiqSelectedPosition")],
      ["player-contract", contract.accepted && contract.guardianEmail],
      ["avatar", player.avatar || this.storage.getItem("pitchiqAvatar")],
      ["player-style", player.playerStyle || this.storage.getItem("pitchiqPlayerStyle")],
    ];

    const currentIndex = FIRST_RUN_STEPS.indexOf(this.state.currentStep);
    const firstMissing = requirements.find(([step, value]) => {
      const stepIndex = FIRST_RUN_STEPS.indexOf(step);
      return stepIndex <= currentIndex && !hasValue(value);
    })?.[0];

    if (firstMissing) return this.setCurrentStep(firstMissing);
    return this.getState();
  }

  #load() {
    const stored = safeParse(this.storage.getItem(STORAGE_KEY));
    if (!stored || stored.version !== FIRST_RUN_VERSION || !FIRST_RUN_STEPS.includes(stored.currentStep)) {
      return defaultState();
    }
    return {
      ...defaultState(),
      ...stored,
      completedSteps: Array.isArray(stored.completedSteps)
        ? stored.completedSteps.filter((step) => FIRST_RUN_STEPS.includes(step))
        : [],
    };
  }

  #save() {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.onChange(this.getState());
  }
}
