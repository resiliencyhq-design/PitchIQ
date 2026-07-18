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

let identityScene = null;
let identitySource = null;
let identityObserver = null;

function positionLabel(value) {
  return POSITION_LABELS[value] || value || "—";
}

function identity() {
  const positionCode = localStorage.getItem(SELECTED_POSITION_KEY) || "—";
  return {
    name: localStorage.getItem(PLAYER_NAME_KEY) || "PLAYER",
    number: localStorage.getItem(JERSEY_NUMBER_KEY) || "1",
    positionCode,
    position: positionLabel(positionCode)
  };
}

function setTextIfChanged(element, text) {
  if (element && element.textContent !== text) element.textContent = text;
}

function identityMarkup() {
  return `
    <header class="academy-welcome-header">
      <div class="academy-welcome-kicker"><span aria-hidden="true">✓</span> Identity complete</div>
    </header>
    <div class="academy-discover-spacer" aria-label="Tactical awareness scene">
      <div class="academy-tactical-overlay" aria-hidden="true">
        <span class="academy-player-ring academy-player-ring--self"></span>
        <span class="academy-player-ring academy-player-ring--teammate"></span>
        <span class="academy-player-ring academy-player-ring--space"></span>
        <span class="academy-pass-line academy-pass-line--solid"></span>
        <span class="academy-pass-line academy-pass-line--dashed"></span>
        <span class="academy-overlay-label academy-overlay-label--teammate">Teammate</span>
        <span class="academy-overlay-label academy-overlay-label--space">Open space</span>
        <span class="academy-overlay-label academy-overlay-label--lane">Passing lane</span>
      </div>
    </div>
    <div class="academy-discover-title">
      <div class="academy-elastic-band" aria-hidden="true"></div>
      <h1><span>Discover</span><strong>Your Strengths</strong></h1>
    </div>
    <p class="academy-discover-message">See the game. Stay <strong>calm.</strong> Make an impact.<br>Let’s unlock what makes you stand out.</p>
    <div class="onboard-step-footer academy-welcome-footer">
      <button class="primary mega splash-cta-v1 onboard-cta-v1" data-action="save-profile"><span>CONTINUE</span><b aria-hidden="true">→</b></button>
    </div>`;
}

function configureIdentitySource(welcomePanel) {
  if (!welcomePanel || welcomePanel.dataset.academyWelcome === "true") return;
  welcomePanel.dataset.academyWelcome = "true";
  welcomePanel.classList.add("academy-welcome-step", "academy-discover-strengths", "academy-pitch-first");
  welcomePanel.innerHTML = identityMarkup();
}

function unlockDocumentScroll() {
  document.documentElement.classList.remove("identity-scene-active");
  document.body.classList.remove("identity-scene-active");
}

function removeIdentityScene({ restoreSource = true } = {}) {
  identityScene?.remove();
  identityScene = null;

  if (identitySource && restoreSource) {
    identitySource.classList.remove("identity-scene-source");
    identitySource.removeAttribute("aria-hidden");
  }

  identitySource = null;
  unlockDocumentScroll();
}

function mountIdentityScene(source) {
  if (!source || source.hidden || !source.isConnected) return;
  if (identityScene && identitySource === source) return;

  removeIdentityScene();
  identitySource = source;
  source.classList.add("identity-scene-source");
  source.setAttribute("aria-hidden", "true");

  const scene = document.createElement("section");
  scene.id = "identity-complete-scene";
  scene.className = "academy-welcome-step academy-discover-strengths academy-pitch-first identity-scene-isolated";
  scene.setAttribute("role", "dialog");
  scene.setAttribute("aria-modal", "true");
  scene.setAttribute("aria-label", "Identity complete");
  scene.innerHTML = identityMarkup();

  document.body.appendChild(scene);
  identityScene = scene;
  document.documentElement.classList.add("identity-scene-active");
  document.body.classList.add("identity-scene-active");
  window.scrollTo(0, 0);
}

function syncIdentityScene() {
  const source = document.querySelector('.onboard-step[data-onboard-step="3"].academy-discover-strengths');
  const onboardExists = Boolean(document.getElementById("onboard"));

  if (!onboardExists || !source) {
    if (identityScene) removeIdentityScene({ restoreSource: false });
    return;
  }

  if (!source.hidden) mountIdentityScene(source);
  else if (identityScene) removeIdentityScene();
}

function alignOnboardingLabels() {
  const numberPanel = document.querySelector(".onboard-number-step");
  if (numberPanel) {
    setTextIfChanged(numberPanel.querySelector(".position-title"), "Step 2 of 3");
    const progress = numberPanel.querySelector(".academy-progress");
    if (progress?.getAttribute("aria-label") !== "Step 2 of 3") progress?.setAttribute("aria-label", "Step 2 of 3");
    numberPanel.querySelectorAll(".academy-progress span").forEach((dot, index) => {
      const shouldBeActive = index <= 1;
      if (dot.classList.contains("active") !== shouldBeActive) dot.classList.toggle("active", shouldBeActive);
    });
  }

  const positionPanel = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if (positionPanel) {
    setTextIfChanged(positionPanel.querySelector(".position-title"), "Step 3 of 3");
    const progress = positionPanel.querySelector(".academy-progress");
    if (progress?.getAttribute("aria-label") !== "Step 3 of 3") progress?.setAttribute("aria-label", "Step 3 of 3");
    positionPanel.querySelectorAll(".academy-progress span").forEach(dot => {
      if (!dot.classList.contains("active")) dot.classList.add("active");
    });
    setTextIfChanged(positionPanel.querySelector(".onboard-position-heading"), "CHOOSE YOUR POSITION");
    positionPanel.querySelector(".academy-journey-position-copy")?.remove();
  }

  const welcomePanel = document.querySelector('.onboard-step[data-onboard-step="3"]');
  configureIdentitySource(welcomePanel);
  syncIdentityScene();
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
  removeIdentityScene({ restoreSource: false });
  window.location.hash = "academy-trials";
}

function initialise() {
  alignOnboardingLabels();
  document.addEventListener("click", beginFirstAssessment, true);
  identityObserver = new MutationObserver(() => alignOnboardingLabels());
  identityObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden", "class", "style", "aria-hidden"]
  });
  window.addEventListener("pagehide", () => removeIdentityScene({ restoreSource: false }), { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
else initialise();

import("./landing-swipe-iphone-hotfix.js?v=landing-swipe-hotfix-20260714").catch(error => {
  console.warn("[PitchIQ] Landing swipe fallback failed to load", error);
});