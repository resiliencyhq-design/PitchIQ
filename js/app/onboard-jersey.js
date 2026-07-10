const JERSEY_ASSET_VERSION = "sprint-8-0b-20260710";

function normaliseJerseyName(value = "") {
  return value.trim().toUpperCase().slice(0, 18) || "NAME";
}

function mountJerseyComponent() {
  const preview = document.querySelector(
    '.onboard-step[data-onboard-step="1"] .onboard-jersey-preview'
  );

  if (!preview || preview.dataset.jerseyComponentMounted === "true") return;

  preview.dataset.jerseyComponentMounted = "true";
  preview.classList.add("onboard-jersey-stage");
  preview.setAttribute("aria-label", "Academy jersey preview");

  preview.innerHTML = `
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
    </div>
  `;

  const input = document.getElementById("nameInput");
  const namePreview = preview.querySelector("#jerseyNamePreview");

  const syncName = () => {
    if (namePreview) namePreview.textContent = normaliseJerseyName(input?.value);
  };

  if (input) {
    input.addEventListener("input", syncName);
    syncName();
  }
}

function initialiseJerseyComponent() {
  mountJerseyComponent();

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
