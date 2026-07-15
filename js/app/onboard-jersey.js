const JERSEY_ASSET_VERSION = "sprint-8-4-number-flow-fix-20260710";
const REDUCED_MOTION = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const PLAYER_NAME_KEY = "pitchiqPlayerName";
const JERSEY_NUMBER_KEY = "pitchiqJerseyNumber";
const jerseyIdleTimers = new WeakMap();

function normaliseJerseyName(value = "") {
  return value.trim().toUpperCase().slice(0, 18) || "NAME";
}

function normaliseJerseyNumber(value = 1) {
  return String(Math.min(99, Math.max(1, Number.parseInt(value, 10) || 1)));
}

function restartClass(element, className) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function playJerseyEntrance(preview) {
  if (!preview) return;

  const existingTimer = jerseyIdleTimers.get(preview);
  if (existingTimer) window.clearTimeout(existingTimer);

  preview.classList.remove("is-entering", "is-idle");

  if (REDUCED_MOTION) {
    preview.classList.add("is-idle");
    return;
  }

  void preview.offsetWidth;
  preview.classList.add("is-entering");

  const idleTimer = window.setTimeout(() => {
    preview.classList.remove("is-entering");
    preview.classList.add("is-idle");
    jerseyIdleTimers.delete(preview);
  }, 1050);

  jerseyIdleTimers.set(preview, idleTimer);
}

function mountJerseyComponent(preview) {
  if (!preview || preview.dataset.jerseyComponentMounted === "true") return false;

  const panel = preview.closest('.onboard-step');
  const isNumberPhase = panel?.dataset.onboardPhase === "number";

  preview.dataset.jerseyComponentMounted = "true";
  preview.classList.add("onboard-jersey-stage");
  preview.setAttribute("aria-label", isNumberPhase ? "Academy jersey name and number preview" : "Academy jersey name preview");

  preview.innerHTML = `
    <div class="onboard-jersey-visual">
      <img
        class="onboard-jersey-glow"
        src="assets/onboarding/jersey-glow.png?v=${JERSEY_ASSET_VERSION}"
        alt=""
        aria-hidden="true"
      >
      <img
        class="onboard-jersey-shadow"
        src="assets/onboarding/jersey-shadow.png?v=${JERSEY_ASSET_VERSION}"
        alt=""
        aria-hidden="true"
      >
      <img
        class="onboard-jersey-image"
        src="assets/onboarding/jersey-back.png?v=${JERSEY_ASSET_VERSION}"
        alt="Blank black and yellow academy jersey"
      >
      <div class="onboard-jersey-identity" aria-hidden="true">
        <span class="onboard-jersey-name">NAME</span>
        ${isNumberPhase ? '<span class="onboard-jersey-number">1</span>' : ''}
        <span class="onboard-jersey-shine"></span>
      </div>
    </div>
  `;

  const input = panel?.querySelector("#nameInput") || document.getElementById("nameInput");
  const namePreview = preview.querySelector(".onboard-jersey-name");
  const numberPreview = preview.querySelector(".onboard-jersey-number");
  const identity = preview.querySelector(".onboard-jersey-identity");
  let numberGlowPlayed = false;
  let shineTimer = 0;

  playJerseyEntrance(preview);

  const syncIdentity = event => {
    const rawValue = input?.value || localStorage.getItem(PLAYER_NAME_KEY) || "";
    const hasName = Boolean(rawValue.trim());

    if (namePreview) {
      namePreview.textContent = normaliseJerseyName(rawValue);
      restartClass(namePreview, "is-updating");
    }

    if (numberPreview) {
      const eventNumber = event?.detail?.number;
      numberPreview.textContent = normaliseJerseyNumber(eventNumber || localStorage.getItem(JERSEY_NUMBER_KEY) || 1);
    }

    if (numberPreview && hasName && !numberGlowPlayed) {
      numberGlowPlayed = true;
      restartClass(numberPreview, "is-confirmed");
    }

    window.clearTimeout(shineTimer);
    if (hasName) {
      shineTimer = window.setTimeout(() => restartClass(identity, "is-shining"), 500);
    }
  };

  if (input) input.addEventListener("input", syncIdentity);
  window.addEventListener("pitchiq:jersey-number-change", syncIdentity);
  syncIdentity();
  return true;
}

function mountAllJerseyComponents() {
  document.querySelectorAll(
    '.onboard-step[data-onboard-step="1"] .onboard-jersey-preview'
  ).forEach(preview => {
    const panel = preview.closest('.onboard-step');
    const isNumberPhase = panel?.dataset.onboardPhase === "number";
    const isVisible = isNumberPhase && !panel.hidden;
    const wasVisible = preview.dataset.jerseyPhaseVisible === "true";
    const newlyMounted = mountJerseyComponent(preview);

    if (isNumberPhase && !newlyMounted && isVisible && !wasVisible) {
      playJerseyEntrance(preview);
    }

    if (isNumberPhase) {
      preview.dataset.jerseyPhaseVisible = String(isVisible);
    }
  });
}

function initialiseJerseyComponent() {
  mountAllJerseyComponents();

  const app = document.getElementById("app");
  if (!app) return;

  const observer = new MutationObserver(mountAllJerseyComponents);
  observer.observe(app, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden"]
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseJerseyComponent, { once: true });
} else {
  initialiseJerseyComponent();
}
