const PLAYER_NAME_KEY = "pitchiqPlayerName";
const SELECTED_POSITION_KEY = "pitchiqSelectedPosition";
const ONBOARDING_COMPLETE_KEY = "pitchiqOnboardingComplete";
const JERSEY_NUMBER_KEY = "pitchiqJerseyNumber";
const JERSEY_NUMBER_CONFIRMED_KEY = "pitchiqJerseyNumberConfirmed";
const DEFAULT_NUMBER = "1";

function showNumberPhase() {
  const namePanel = document.querySelector('.onboard-step[data-onboard-step="1"]:not([data-onboard-phase="number"])');
  const numberPanel = document.querySelector('.onboard-number-step');
  const positionPanel = document.querySelector('.onboard-step[data-onboard-step="2"]');
  const confirmPanel = document.querySelector('.onboard-step[data-onboard-step="3"]');
  if (!namePanel || !numberPanel) return false;

  namePanel.hidden = true;
  numberPanel.hidden = false;
  if (positionPanel) positionPanel.hidden = true;
  if (confirmPanel) confirmPanel.hidden = true;
  window.dispatchEvent(new CustomEvent("pitchiq:onboarding-phase-change", { detail: { phase: "number" } }));
  return true;
}

function resetNumberState() {
  localStorage.removeItem(JERSEY_NUMBER_CONFIRMED_KEY);
  localStorage.setItem(JERSEY_NUMBER_KEY, DEFAULT_NUMBER);
}

function bindNameToNumberRepair() {
  document.addEventListener("click", event => {
    const button = event.target.closest?.('[data-action="onboard-next-name"]');
    if (!button) return;

    const name = document.getElementById("nameInput")?.value?.trim();
    if (!name) return;

    const numberPanel = document.querySelector(".onboard-number-step");
    if (!numberPanel) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    localStorage.setItem(PLAYER_NAME_KEY, name);
    localStorage.removeItem(JERSEY_NUMBER_CONFIRMED_KEY);
    showNumberPhase();
  }, true);
}

function bindResetRepair() {
  document.addEventListener("click", event => {
    const resetControl = event.target.closest?.('[data-action="reset"], [data-dev-reset-onboarding]');
    if (!resetControl) return;

    setTimeout(() => {
      const resetCompleted = !localStorage.getItem(ONBOARDING_COMPLETE_KEY)
        && !localStorage.getItem(PLAYER_NAME_KEY)
        && !localStorage.getItem(SELECTED_POSITION_KEY);
      if (resetCompleted) resetNumberState();
    }, 0);
  });
}

function normaliseFreshOnboarding() {
  const hasIdentity = localStorage.getItem(PLAYER_NAME_KEY) || localStorage.getItem(SELECTED_POSITION_KEY);
  const complete = localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
  if (!hasIdentity && !complete) resetNumberState();
}

function initialise() {
  normaliseFreshOnboarding();
  bindNameToNumberRepair();
  bindResetRepair();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialise, { once: true });
} else {
  initialise();
}
