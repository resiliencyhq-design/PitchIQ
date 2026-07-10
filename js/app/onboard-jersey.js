const JERSEY_ASSET_VERSION = "sprint-8-2-animation-20260710";
const REDUCED_MOTION = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

function normaliseJerseyName(value = "") {
  return value.trim().toUpperCase().slice(0, 18) || "NAME";
}

function restartClass(element, className) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function mountJerseyComponent() {
  const preview = document.querySelector(
    '.onboard-step[data-onboard-step="1"] .onboard-jersey-preview'
  );

  if (!preview || preview.dataset.jerseyComponentMounted === "true") return;

  preview.dataset.jerseyComponentMounted = "true";
  preview.classList.add("onboard-jersey-stage", "is-entering");
  preview.setAttribute("aria-label", "Academy jersey preview");

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
        <span id="jerseyNamePreview" class="onboard-jersey-name">NAME</span>
        <span class="onboard-jersey-number">10</span>
        <span class="onboard-jersey-shine"></span>
      </div>
    </div>
  `;

  const input = document.getElementById("nameInput");
  const namePreview = preview.querySelector("#jerseyNamePreview");
  const numberPreview = preview.querySelector(".onboard-jersey-number");
  const identity = preview.querySelector(".onboard-jersey-identity");
  let numberGlowPlayed = false;
  let shineTimer = 0;

  const beginIdle = () => {
    preview.classList.remove("is-entering");
    preview.classList.add("is-idle");
  };

  if (REDUCED_MOTION) beginIdle();
  else window.setTimeout(beginIdle, 1050);

  const syncName = () => {
    const rawValue = input?.value || "";
    const hasName = Boolean(rawValue.trim());

    if (namePreview) {
      namePreview.textContent = normaliseJerseyName(rawValue);
      restartClass(namePreview, "is-updating");
    }

    if (hasName && !numberGlowPlayed) {
      numberGlowPlayed = true;
      restartClass(numberPreview, "is-confirmed");
    }

    window.clearTimeout(shineTimer);
    if (hasName) {
      shineTimer = window.setTimeout(() => restartClass(identity, "is-shining"), 500);
    }
  };

  if (input) {
    input.addEventListener("input", syncName);
    syncName();
  }
}

async function playJerseyExit(button) {
  const preview = document.querySelector(
    '.onboard-step[data-onboard-step="1"] .onboard-jersey-stage'
  );

  if (!preview || REDUCED_MOTION) return;

  button?.setAttribute("disabled", "true");
  preview.classList.remove("is-idle", "is-entering");
  preview.classList.add("is-exiting");
  document.body.classList.add("jersey-marker-handoff");

  await new Promise(resolve => window.setTimeout(resolve, 560));
}

function bindJerseyContinueTransition() {
  document.addEventListener(
    "click",
    async event => {
      const button = event.target.closest?.('[data-action="onboard-next-name"]');
      if (!button || button.dataset.jerseyTransitionBypass === "true") return;

      const input = document.getElementById("nameInput");
      if (!input?.value?.trim()) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      button.dataset.jerseyTransitionBypass = "true";
      await playJerseyExit(button);
      button.removeAttribute("disabled");
      button.click();

      window.setTimeout(() => {
        delete button.dataset.jerseyTransitionBypass;
        document.body.classList.remove("jersey-marker-handoff");
      }, 420);
    },
    true
  );
}

function initialiseJerseyComponent() {
  mountJerseyComponent();
  bindJerseyContinueTransition();

  const app = document.getElementById("app");
  if (!app) return;

  const observer = new MutationObserver(() => mountJerseyComponent());
  observer.observe(app, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseJerseyComponent, { once: true });
} else {
  initialiseJerseyComponent();
}
