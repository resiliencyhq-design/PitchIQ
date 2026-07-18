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
  if (!welcomePanel || welcomePanel.dataset.academyWelcome === "true") return;

  welcomePanel.dataset.academyWelcome = "true";
  welcomePanel.classList.add("academy-welcome-step", "academy-discover-strengths");
  welcomePanel.innerHTML = `
    <div class="academy-tactical-overlay" aria-hidden="true">
      <svg viewBox="0 0 853 1844" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <filter id="academy-overlay-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="academy-vision-cone" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="#d7ff2e" stop-opacity=".25"/>
            <stop offset="1" stop-color="#d7ff2e" stop-opacity=".02"/>
          </linearGradient>
        </defs>
        <path class="academy-overlay-cone" d="M433 694 L355 548 L507 548 Z"/>
        <path class="academy-overlay-pass" d="M433 694 C380 682 320 650 254 625"/>
        <circle class="academy-overlay-ring academy-overlay-ring--player" cx="433" cy="694" r="38"/>
        <circle class="academy-overlay-ring academy-overlay-ring--target" cx="254" cy="625" r="34"/>
        <circle class="academy-overlay-pulse" cx="254" cy="625" r="18"/>
        <path class="academy-overlay-arrow" d="M287 641 L258 626 L277 604"/>
      </svg>
    </div>
    <header class="academy-welcome-header">
      <div class="academy-welcome-kicker"><span aria-hidden="true">✓</span> Identity complete</div>
    </header>
    <div class="academy-discover-title">
      <h1><span>Discover</span><strong>Your Strengths</strong></h1>
    </div>
    <div class="academy-discover-spacer" aria-hidden="true"></div>
    <div class="academy-strength-pathway" aria-label="See, calm, improve">
      <div class="academy-strength-item">
        <svg class="academy-strength-icon" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M4 24s7-11 20-11 20 11 20 11-7 11-20 11S4 24 4 24Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
          <circle cx="24" cy="24" r="5.5" fill="none" stroke="currentColor" stroke-width="2.8"/>
        </svg>
        <span>See</span>
      </div>
      <span class="academy-strength-arrow" aria-hidden="true">→</span>
      <div class="academy-strength-item">
        <svg class="academy-strength-icon" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M24 5 39 11v11c0 10-6 17-15 21C15 39 9 32 9 22V11L24 5Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
          <path d="M17 25c2 3 4 4 7 4s5-1 7-4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        </svg>
        <span>Calm</span>
      </div>
      <span class="academy-strength-arrow" aria-hidden="true">→</span>
      <div class="academy-strength-item">
        <svg class="academy-strength-icon" viewBox="0 0 48 48" aria-hidden="true">
          <path d="m24 5 5.7 11.6 12.8 1.9-9.2 9 2.2 12.7L24 34.2l-11.5 6 2.2-12.7-9.2-9 12.8-1.9L24 5Z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
        </svg>
        <span>Improve</span>
      </div>
    </div>
    <p class="academy-discover-message">Complete a few quick activities<br>to <strong>discover your strengths.</strong></p>
    <div class="onboard-step-footer academy-welcome-footer">
      <button class="primary mega splash-cta-v1 onboard-cta-v1" data-action="save-profile"><span>CONTINUE</span><b aria-hidden="true">→</b></button>
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
  window.location.hash = "academy-trials";
}

function initialise() {
  alignOnboardingLabels();
  document.addEventListener("click", beginFirstAssessment, true);
  const app = document.getElementById("app");
  if (app) new MutationObserver(alignOnboardingLabels).observe(app, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
else initialise();

import("./landing-swipe-iphone-hotfix.js?v=landing-swipe-hotfix-20260714").catch(error => {
  console.warn("[PitchIQ] Landing swipe fallback failed to load", error);
});