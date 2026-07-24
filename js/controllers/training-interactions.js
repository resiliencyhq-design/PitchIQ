import { TrainingController } from "./training-controller.js";
import { SessionService } from "../services/session-service.js";

function emit(type, detail = {}) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

function bindTrainingInteractions({ root = document, render, onExit, onResults } = {}) {
  const bind = (selector, event, handler) => {
    root.querySelectorAll(selector).forEach(element => {
      element.addEventListener(event, handler);
    });
  };

  bind("[data-training-start]", "click", () => {
    const session = SessionService.getSession();
    if (!session) {
      emit("pitchiq:training-interaction-error", { reason: "missing-session" });
      return;
    }
    TrainingController.beginCountdown(3, () => render?.());
    render?.();
  });

  bind("[data-training-pause]", "click", () => {
    TrainingController.pause();
    render?.();
  });

  bind("[data-training-resume]", "click", () => {
    TrainingController.resume({
      onTick: () => render?.(),
      onFinish: summary => {
        render?.();
        onResults?.(summary);
      }
    });
    render?.();
  });

  bind("[data-training-finish]", "click", () => {
    const summary = TrainingController.finish();
    render?.();
    onResults?.(summary);
  });

  bind("[data-training-reset], [data-training-replay]", "click", () => {
    TrainingController.reset();
    render?.();
  });

  bind("[data-training-exit]", "click", () => {
    TrainingController.destroy();
    onExit?.();
  });

  bind("[data-training-answer]", "click", event => {
    const value = event.currentTarget.dataset.trainingAnswer;
    const correct = event.currentTarget.dataset.correct === "true";
    const session = SessionService.getSession();
    if (!session) return;

    const combo = correct ? Number(session.combo || 0) + 1 : 0;
    const score = Number(session.score || 0) + (correct ? 100 : 0);

    TrainingController.recordResult({
      response: value,
      correct,
      combo,
      score
    });
    TrainingController.advanceCue();
    render?.();
  });

  return () => TrainingController.destroy();
}

export { bindTrainingInteractions };
