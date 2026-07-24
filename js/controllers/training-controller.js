import { SessionService } from "../services/session-service.js";

let timerHandle = null;
let countdownHandle = null;

function clearTimer() {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = null;
}

function clearCountdown() {
  if (countdownHandle) clearInterval(countdownHandle);
  countdownHandle = null;
}

function emit(type, detail = {}) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

function create(options = {}) {
  clearTimer();
  clearCountdown();
  const session = SessionService.createSession(options);
  emit("pitchiq:training-created", { session });
  return session;
}

function beginCountdown(seconds = 3, onComplete) {
  clearCountdown();
  let remaining = Number(seconds);
  SessionService.setStage("countdown");
  SessionService.setCountdown(remaining);
  emit("pitchiq:training-countdown", { remaining });

  countdownHandle = setInterval(() => {
    remaining -= 1;
    SessionService.setCountdown(Math.max(0, remaining));
    emit("pitchiq:training-countdown", { remaining: Math.max(0, remaining) });

    if (remaining <= 0) {
      clearCountdown();
      SessionService.setCountdown(null);
      start();
      onComplete?.();
    }
  }, 1000);
}

function start({ tickMs = 1000, onTick, onFinish } = {}) {
  clearTimer();
  const session = SessionService.startSession({ stage: "live" });
  emit("pitchiq:training-started", { session });

  timerHandle = setInterval(() => {
    const current = SessionService.getSession();
    if (!current) return;
    const timeLeft = Math.max(0, Number(current.timeLeft || 0) - 1);
    const updated = SessionService.updateSession({ timeLeft });
    emit("pitchiq:training-tick", { session: updated, timeLeft });
    onTick?.(updated);

    if (timeLeft <= 0) {
      finish({}, onFinish);
    }
  }, tickMs);

  return session;
}

function recordResult(result = {}) {
  const session = SessionService.recordResult(result);
  emit("pitchiq:training-result", { session, result });
  return session;
}

function advanceCue() {
  const cue = SessionService.advanceCue();
  emit("pitchiq:training-cue", { cue });
  return cue;
}

function pause() {
  clearTimer();
  const session = SessionService.pauseSession();
  emit("pitchiq:training-paused", { session });
  return session;
}

function resume(options = {}) {
  SessionService.resumeSession();
  return start(options);
}

function finish(summaryPatch = {}, onFinish) {
  clearTimer();
  clearCountdown();
  const summary = SessionService.finishSession(summaryPatch);
  emit("pitchiq:training-finished", { summary });
  onFinish?.(summary);
  return summary;
}

function reset() {
  clearTimer();
  clearCountdown();
  const runtime = SessionService.resetSession();
  emit("pitchiq:training-reset", { runtime });
  return runtime;
}

function destroy() {
  clearTimer();
  clearCountdown();
}

export const TrainingController = Object.freeze({
  create,
  beginCountdown,
  start,
  recordResult,
  advanceCue,
  pause,
  resume,
  finish,
  reset,
  destroy
});

export {
  create,
  beginCountdown,
  start,
  recordResult,
  advanceCue,
  pause,
  resume,
  finish,
  reset,
  destroy
};
