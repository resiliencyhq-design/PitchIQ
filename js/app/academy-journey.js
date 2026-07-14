const PLAYER_NAME_KEY = "pitchiqPlayerName";
const JERSEY_NUMBER_KEY = "pitchiqJerseyNumber";
const SELECTED_POSITION_KEY = "pitchiqSelectedPosition";
const ONBOARDING_COMPLETE_KEY = "pitchiqOnboardingComplete";
const ACADEMY_ACCEPTED_KEY = "pitchiqAcademyAccepted";

const POSITION_LABELS = {
  LW: "Left Wing", ST: "Striker", RW: "Right Wing", CAM: "Central Attacking Midfielder",
  CM: "Central Midfielder", CDM: "Defensive Midfielder", LB: "Left Back",
  CB: "Centre Back", RB: "Right Back", GK: "Goalkeeper"
};

function positionLabel(value) {
  return POSITION_LABELS[value] || value || "—";
}

function identity() {
  return {
    name: localStorage.getItem(PLAYER_NAME_KEY) || "PLAYER",
    number: localStorage.getItem(JERSEY_NUMBER_KEY) || "1",
    position: positionLabel(localStorage.getItem(SELECTED_POSITION_KEY))
  };
}

function alignOnboardingLabels() {
  const numberPanel = document.querySelector(".onboard-number-step");
  if (numberPanel) {
    numberPanel.querySelector(".position-title")?.replaceChildren(document.createTextNode("Step 2 of 3"));
    numberPanel.querySelector(".academy-progress")?.setAttribute("aria-label", "Step 2 of 3");
    const dots = numberPanel.querySelectorAll(".academy-progress span");
    dots.forEach((dot, index) => dot.classList.toggle("active", index <= 1));
  }

  const positionPanel = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if (positionPanel) {
    positionPanel.querySelector(".position-title")?.replaceChildren(document.createTextNode("Step 3 of 3"));
    const heading = positionPanel.querySelector(".onboard-position-heading");
    if (heading) heading.textContent = "CHOOSE YOUR POSITION";
    if (!positionPanel.querySelector(".academy-journey-position-copy")) {
      heading?.insertAdjacentHTML("afterend", '<p class="academy-journey-position-copy">Select where you play best.</p>');
    }
  }

  const welcomePanel = document.querySelector('.onboard-step[data-onboard-step="3"]');
  if (!welcomePanel || welcomePanel.dataset.academyWelcome === "true") return;
  welcomePanel.dataset.academyWelcome = "true";
  welcomePanel.classList.add("academy-welcome-step");
  const player = identity();
  welcomePanel.innerHTML = `
    <div class="academy-welcome-glow" aria-hidden="true"></div>
    <span class="trial-kicker">Identity complete</span>
    <h1>WELCOME TO<br><em>PITCHIQ ACADEMY</em></h1>
    <div class="academy-welcome-identity" aria-label="Player identity">
      <div><small>Player</small><strong>${player.name.toUpperCase()}</strong></div>
      <div><small>Number</small><strong>#${player.number}</strong></div>
      <div><small>Position</small><strong>${player.position}</strong></div>
    </div>
    <p>Every academy player completes one assessment before training begins.</p>
    <div class="academy-welcome-facts" aria-label="Assessment details">
      <span>30–90 seconds</span><span>Football IQ</span><span>Decisions</span><span>Vision</span><span>Awareness</span>
    </div>
    <div class="onboard-step-footer">
      <button class="primary mega splash-cta-v1 onboard-cta-v1 sticky-cta" data-action="save-profile">BEGIN FIRST ASSESSMENT →</button>
    </div>`;
}

function beginFirstAssessment(event) {
  const button = event.target.closest?.('[data-action="save-profile"]');
  if (!button || !button.closest(".academy-welcome-step")) return;
  event.preventDefault();
  event.stopImmediatePropagation();

  const player = identity();
  localStorage.setItem(PLAYER_NAME_KEY, player.name);
  localStorage.setItem(JERSEY_NUMBER_KEY, player.number);
  localStorage.setItem(SELECTED_POSITION_KEY, localStorage.getItem(SELECTED_POSITION_KEY) || "");
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
  localStorage.removeItem(ACADEMY_ACCEPTED_KEY);
  window.location.hash = "academy-trial";
}

function initialise() {
  alignOnboardingLabels();
  document.addEventListener("click", beginFirstAssessment, true);
  const app = document.getElementById("app");
  if (app) new MutationObserver(alignOnboardingLabels).observe(app, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
else initialise();
