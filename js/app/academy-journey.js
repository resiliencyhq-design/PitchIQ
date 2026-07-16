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

function setTextIfChanged(element, text) {
  if (element && element.textContent !== text) element.textContent = text;
}

function syncIdentitySummary(welcomePanel) {
  if (!welcomePanel) return;
  const player = identity();
  setTextIfChanged(welcomePanel.querySelector("[data-identity-player]"), player.name.toUpperCase());
  setTextIfChanged(welcomePanel.querySelector("[data-identity-number]"), `#${player.number}`);
  setTextIfChanged(welcomePanel.querySelector("[data-identity-position]"), player.position.toUpperCase());
}

function alignOnboardingLabels() {
  const numberPanel = document.querySelector(".onboard-number-step");
  if (numberPanel) {
    setTextIfChanged(numberPanel.querySelector(".position-title"), "Step 2 of 3");
    const progress = numberPanel.querySelector(".academy-progress");
    if (progress?.getAttribute("aria-label") !== "Step 2 of 3") {
      progress?.setAttribute("aria-label", "Step 2 of 3");
    }
    const dots = numberPanel.querySelectorAll(".academy-progress span");
    dots.forEach((dot, index) => {
      const shouldBeActive = index <= 1;
      if (dot.classList.contains("active") !== shouldBeActive) {
        dot.classList.toggle("active", shouldBeActive);
      }
    });
  }

  const positionPanel = document.querySelector('.onboard-step[data-onboard-step="2"]');
  if (positionPanel) {
    setTextIfChanged(positionPanel.querySelector(".position-title"), "Step 3 of 3");
    const progress = positionPanel.querySelector(".academy-progress");
    if (progress?.getAttribute("aria-label") !== "Step 3 of 3") {
      progress?.setAttribute("aria-label", "Step 3 of 3");
    }
    positionPanel.querySelectorAll(".academy-progress span").forEach(dot => {
      if (!dot.classList.contains("active")) dot.classList.add("active");
    });
    const heading = positionPanel.querySelector(".onboard-position-heading");
    setTextIfChanged(heading, "CHOOSE YOUR POSITION");
    positionPanel.querySelector(".academy-journey-position-copy")?.remove();
  }

  const welcomePanel = document.querySelector('.onboard-step[data-onboard-step="3"]');
  if (!welcomePanel) return;

  if (welcomePanel.dataset.academyWelcome !== "true") {
    welcomePanel.dataset.academyWelcome = "true";
    welcomePanel.classList.add("academy-welcome-step");
    const player = identity();
    welcomePanel.innerHTML = `
      <div class="academy-welcome-glow" aria-hidden="true"></div>
      <header class="academy-welcome-header">
        <div class="academy-welcome-kicker"><span aria-hidden="true">✓</span> Identity complete</div>
        <button class="academy-info-button" type="button" data-academy-info aria-expanded="false" aria-controls="academyInfoPanel" aria-label="About your first assessment">ⓘ</button>
      </header>
      <div class="academy-welcome-title">
        <span class="academy-title-eyebrow">WELCOME TO</span>
        <h1><span>PITCH</span><em>IQ</em><strong>ACADEMY</strong></h1>
        <div class="academy-title-divider" aria-hidden="true"><i></i><b>★</b><i></i></div>
        <p>Your Academy journey begins now.</p>
      </div>
      <aside class="academy-info-panel" id="academyInfoPanel" hidden>
        <strong>Your first assessment</strong>
        <p>It takes around a minute, establishes your starting point and cannot be failed.</p>
      </aside>
      <div class="academy-welcome-identity" aria-label="Player identity">
        <div><small>Player</small><strong data-identity-player>${player.name.toUpperCase()}</strong></div>
        <div><small>Number</small><strong data-identity-number>#${player.number}</strong></div>
        <div><small>Position</small><strong data-identity-position>${player.position.toUpperCase()}</strong></div>
      </div>
      <p class="academy-challenge-intro">Your first challenge starts now.</p>
      <section class="academy-first-challenge" aria-labelledby="academy-first-challenge-title">
        <div class="academy-challenge-badge" aria-hidden="true">◎</div>
        <h2 id="academy-first-challenge-title"><i></i><span>Your first challenge</span><i></i></h2>
        <div class="academy-challenge-grid">
          <div class="academy-challenge-fact">
            <svg class="academy-challenge-icon" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 12v13h11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
            <div><strong>Short assessment</strong><small>30–90 seconds</small></div>
          </div>
          <div class="academy-challenge-fact">
            <svg class="academy-challenge-icon academy-brain-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="M21 39c-5 0-8-3-8-7-4-1-6-4-6-8 0-3 2-6 5-7-1-5 3-9 8-9 2 0 4 1 5 3 1-2 3-3 6-3 5 0 8 4 8 9 3 1 5 4 5 7 0 4-2 7-6 8 0 4-3 7-8 7-3 0-5-2-5-5v-21m-4 6c-3 0-5 2-5 5m5 1c-3 0-5 2-5 5m9-10c3 0 5 2 5 5m-5 1c3 0 5 2 5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <div><strong>Football IQ</strong><small>Decisions, vision and awareness</small></div>
          </div>
        </div>
        <p>A quick challenge that adapts to you.</p>
      </section>
      <div class="onboard-step-footer academy-welcome-footer">
        <button class="primary mega splash-cta-v1 onboard-cta-v1" data-action="save-profile"><span>START ASSESSMENT</span><b aria-hidden="true">→</b></button>
      </div>
      <p class="academy-welcome-reassurance"><span aria-hidden="true">✓</span> Every academy player completes one assessment before training begins.</p>`;
  }

  syncIdentitySummary(welcomePanel);
}

function toggleAcademyInfo(event) {
  const button = event.target.closest?.("[data-academy-info]");
  if (!button) return;
  const panel = document.getElementById(button.getAttribute("aria-controls"));
  if (!panel) return;
  const willOpen = panel.hidden;
  panel.hidden = !willOpen;
  button.setAttribute("aria-expanded", String(willOpen));
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
  window.location.hash = "academy-trials";
}

function initialise() {
  alignOnboardingLabels();
  document.addEventListener("click", toggleAcademyInfo, true);
  document.addEventListener("click", beginFirstAssessment, true);
  const app = document.getElementById("app");
  if (app) new MutationObserver(alignOnboardingLabels).observe(app, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
else initialise();

import("./landing-swipe-iphone-hotfix.js?v=landing-swipe-hotfix-20260714").catch(error => {
  console.warn("[PitchIQ] Landing swipe fallback failed to load", error);
});