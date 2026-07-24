import { bindTrainingInteractions } from "../controllers/training-interactions.js";

export function bindScreen(root, app) {
  root.querySelectorAll("[data-route]").forEach((button) =>
    button.addEventListener("click", () => app.goto(button.dataset.route)),
  );
  bindTrainingInteractions(root, app.training, { position: () => app.state.profile.position || "Winger" });
  bindOnboarding(root, app);
}

function bindOnboarding(root, app) {
  const input = root.querySelector("#nameInput");
  const next = root.querySelector('[data-action="onboard-next-name"]');
  if (input) {
    const update = () => {
      const preview = root.querySelector("#jerseyNamePreview");
      if (preview) preview.textContent = (input.value.trim() || "NAME").toUpperCase();
      if (next) next.disabled = !input.value.trim();
    };
    input.addEventListener("input", update);
    update();
  }
  root.querySelectorAll("[data-pos]").forEach((button) =>
    button.addEventListener("click", () => {
      app.selectedPosition = button.dataset.pos;
      root.querySelectorAll("[data-pos]").forEach((item) => item.classList.toggle("selected", item === button));
      const confirmation = root.querySelector("#positionConfirm b");
      if (confirmation) confirmation.textContent = app.selectedPosition;
      const positionNext = root.querySelector('[data-action="onboard-next-position"]');
      if (positionNext) positionNext.disabled = false;
    }),
  );
  next?.addEventListener("click", () => app.setOnboardStep(2));
  root.querySelector('[data-action="onboard-next-position"]')?.addEventListener("click", () => app.setOnboardStep(3));
  root.querySelector('[data-action="save-profile"]')?.addEventListener("click", () => {
    app.completeOnboarding(
      input?.value?.trim() || "Player",
      app.selectedPosition,
      localStorage.getItem("pitchiqJerseyNumber") || app.state.profile.number,
    );
    app.goto("home");
  });
}
