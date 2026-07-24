import {
  createSession as createGameSession,
  nextCue,
  adaptiveDifficulty
} from "../game/session.js";

const DEFAULT_RUNTIME = Object.freeze({
  stage: "home",
  selectedDrillId: null,
  difficulty: "medium",
  responseMode: "coach",
  countdown: null,
  pausedAt: null,
  finishedAt: null,
  summary: null
});

let session = null;
let runtime = { ...DEFAULT_RUNTIME };

function clone(value) {
  if (value == null) return value;
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

function emit(type, detail = {}) {
  window.dispatchEvent(new CustomEvent(type, {
    detail: {
      session: getSession(),
      runtime: getRuntime(),
      ...clone(detail)
    }
  }));
}

function normalizeRuntime(patch = {}) {
  return {
    ...runtime,
    ...patch,
    stage: String(patch.stage ?? runtime.stage ?? "home"),
    selectedDrillId: patch.selectedDrillId ?? runtime.selectedDrillId ?? null,
    difficulty: String(patch.difficulty ?? runtime.difficulty ?? "medium"),
    responseMode: String(patch.responseMode ?? runtime.responseMode ?? "coach"),
    countdown: patch.countdown ?? runtime.countdown ?? null,
    pausedAt: patch.pausedAt ?? runtime.pausedAt ?? null,
    finishedAt: patch.finishedAt ?? runtime.finishedAt ?? null,
    summary: patch.summary ?? runtime.summary ?? null
  };
}

function getSession() {
  return clone(session);
}

function getRuntime() {
  return clone(runtime);
}

function getSummary() {
  return clone(runtime.summary);
}

function createSession(options = {}) {
  session = createGameSession(options);
  runtime = normalizeRuntime({
    ...DEFAULT_RUNTIME,
    stage: options.stage || "setup",
    selectedDrillId: options.drillId || session.drill?.id || null,
    difficulty: options.difficulty || "medium",
    responseMode: options.responseMode || "coach"
  });
  emit("pitchiq:session-created");
  return getSession();
}

function startSession(patch = {}) {
  if (!session) createSession(patch);
  session.startedAt ||= Date.now();
  runtime = normalizeRuntime({ ...patch, stage: patch.stage || "live", pausedAt: null });
  emit("pitchiq:session-started");
  return getSession();
}

function updateSession(patch = {}, runtimePatch = {}) {
  if (!session) return null;
  session = { ...session, ...patch };
  runtime = normalizeRuntime(runtimePatch);
  emit("pitchiq:session-updated");
  return getSession();
}

function setStage(stage) {
  runtime = normalizeRuntime({ stage });
  emit("pitchiq:session-updated", { reason: "stage" });
  return getRuntime();
}

function setCountdown(countdown) {
  runtime = normalizeRuntime({ countdown });
  emit("pitchiq:session-updated", { reason: "countdown" });
  return getRuntime();
}

function recordResult(result = {}) {
  if (!session) return null;
  const entry = { ...result, recordedAt: result.recordedAt ?? Date.now() };
  const results = [...(session.results || []), entry];
  const score = Number(result.score ?? session.score ?? 0);
  const combo = Number(result.combo ?? session.combo ?? 0);
  session = {
    ...session,
    results,
    score,
    combo,
    bestCombo: Math.max(Number(session.bestCombo || 0), combo)
  };
  emit("pitchiq:session-updated", { reason: "result", result: entry });
  return getSession();
}

function advanceCue() {
  if (!session?.drill) return null;
  session = { ...session, currentCue: nextCue(session.drill) };
  emit("pitchiq:session-updated", { reason: "cue" });
  return clone(session.currentCue);
}

function pauseSession() {
  if (!session) return null;
  runtime = normalizeRuntime({ stage: "paused", pausedAt: Date.now() });
  emit("pitchiq:session-updated", { reason: "paused" });
  return getSession();
}

function resumeSession() {
  if (!session) return null;
  runtime = normalizeRuntime({ stage: "live", pausedAt: null });
  emit("pitchiq:session-updated", { reason: "resumed" });
  return getSession();
}

function buildSummary(overrides = {}) {
  if (!session) return null;
  const results = session.results || [];
  const correct = results.filter(result => result.correct).length;
  const attempts = results.length;
  return {
    sessionId: session.id,
    missionId: session.missionId || null,
    drillId: session.drill?.id || runtime.selectedDrillId || null,
    score: Number(session.score || 0),
    combo: Number(session.combo || 0),
    bestCombo: Number(session.bestCombo || 0),
    attempts,
    correct,
    accuracy: attempts ? correct / attempts : 0,
    adaptiveDifficulty: adaptiveDifficulty(session),
    startedAt: session.startedAt || null,
    finishedAt: Date.now(),
    ...overrides
  };
}

function finishSession(summaryPatch = {}) {
  if (!session) return null;
  const summary = buildSummary(summaryPatch);
  runtime = normalizeRuntime({ stage: "results", finishedAt: summary.finishedAt, summary });
  session = { ...session, finishedAt: summary.finishedAt };
  emit("pitchiq:session-finished", { summary });
  return clone(summary);
}

function resetSession() {
  session = null;
  runtime = { ...DEFAULT_RUNTIME };
  emit("pitchiq:session-reset");
  return getRuntime();
}

export const SessionService = Object.freeze({
  createSession,
  startSession,
  updateSession,
  setStage,
  setCountdown,
  recordResult,
  advanceCue,
  pauseSession,
  resumeSession,
  finishSession,
  resetSession,
  getSession,
  getRuntime,
  getSummary
});

export {
  createSession,
  startSession,
  updateSession,
  setStage,
  setCountdown,
  recordResult,
  advanceCue,
  pauseSession,
  resumeSession,
  finishSession,
  resetSession,
  getSession,
  getRuntime,
  getSummary
};
