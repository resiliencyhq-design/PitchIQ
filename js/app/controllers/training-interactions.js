/** Owns all training action dispatch and keeps listeners out of application composition. */
export function bindTrainingInteractions(root, controller, { position }) {
  root.querySelectorAll("[data-action]").forEach((button) =>
    button.addEventListener("click", () => {
      switch (button.dataset.action) {
        case "start-mission-training": controller.start(position()); break;
        case "training-setup-continue": controller.beginLive(); break;
        case "training-setup-cancel": controller.cancel(); break;
        case "correct": controller.answer(true); break;
        case "wrong": controller.answer(false); break;
        case "live-rep-exit": controller.exitPrompt(); break;
        case "continue-live-rep": controller.continue(); break;
        case "end-live-rep": controller.cancel(); break;
        case "training-home": controller.home(); break;
        default: break;
      }
    }),
  );
}
