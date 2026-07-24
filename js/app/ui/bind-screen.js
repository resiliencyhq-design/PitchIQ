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
  const nameNext = root.querySelector('[data-action="onboard-next-name"]');
  if (input) {
    const update = () => {
      if (nameNext) nameNext.disabled = !input.value.trim();
    };
    input.addEventListener("input", update);
    update();
  }

  const numberPanel = root.querySelector(".onboard-number-step");
  const numberNext = root.querySelector('[data-action="onboard-next-number"]');
  if (numberPanel && numberNext) {
    const getNumber = () => {
      const selected = numberPanel.dataset.selectedNumber || localStorage.getItem("pitchiqJerseyNumber") || "1";
      const parsed = Number.parseInt(selected, 10);
      return parsed >= 1 && parsed <= 99 ? String(parsed) : "";
    };
    numberNext.addEventListener("click", () => app.saveIdentityStep("number", getNumber()));
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

  nameNext?.addEventListener("click", () => app.saveIdentityStep("name", input.value.trim()));
  root.querySelector('[data-action="onboard-next-position"]')?.addEventListener("click", () => {
    const existing = app.state.profile?.position || localStorage.getItem("pitchiqSelectedPosition") || "";
    app.saveIdentityStep("position", app.selectedPosition || existing);
  });
  root.querySelector('[data-action="enter-academy"]')?.addEventListener("click", () => app.enterAcademy());
}
