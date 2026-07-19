import "./home-content-composition.js?v=sprint-h2-home-content-wrapper-20260719";

const ADAPTIVE_CURRENT_KEY = "pitchiq.adaptiveTraining.current.v1";
const CARD_SELECTOR = "[data-home-adaptive-recommendation]";
const TRAINING_ROUTE_SELECTOR = `${CARD_SELECTOR} [data-route="training"]`;
const DRILL_LABELS = Object.freeze({
  scanning: "Scanning",
  vision: "Vision",
  decision: "Decision",
  reaction: "Reaction",
  dual: "Dual Task",
  position: "Positioning",
});

export function readHomeAdaptiveRecommendation(storage = globalThis.localStorage) {
  try {
    const value = JSON.parse(storage?.getItem?.(ADAPTIVE_CURRENT_KEY) || "null");
    return value?.mission ? value : null;
  } catch {
    return null;
  }
}

export function homeRecommendationView(selection) {
  const mission = selection?.mission;
  if (!mission) {
    return {
      mode: "empty",
      eyebrow: "Football IQ training",
      title: "Start your first Football IQ mission",
      description: "Enter Training to build your first personalised development focus.",
      focus: "Ready when you are",
    };
  }

  return {
    mode: selection.mode || "balanced_evidence_building",
    eyebrow: selection.mode === "personalised" ? "Your priority" : "Today's focus",
    title: mission.title || "Football IQ Mission",
    description: mission.description || "Complete a short Football IQ training rep.",
    focus: `${DRILL_LABELS[mission.drillId] || "Football IQ"} mission`,
  };
}

export function renderHomeAdaptiveRecommendation(home, selection) {
  if (!home) return false;
  const view = homeRecommendationView(selection);
  const signature = JSON.stringify(view);
  let card = home.querySelector(CARD_SELECTOR);

  if (!card) {
    card = document.createElement("article");
    card.className = "home-adaptive-recommendation";
    card.dataset.homeAdaptiveRecommendation = "true";
    const mission = home.querySelector(".home-mock-mission");
    if (mission) mission.insertAdjacentElement("afterend", card);
    else home.querySelector(".home-v7-grid")?.prepend(card);
  }

  if (!card || card.dataset.signature === signature) return Boolean(card);
  card.dataset.signature = signature;
  card.dataset.recommendationMode = view.mode;
  card.innerHTML = `<div class="home-adaptive-copy"><span>${view.eyebrow}</span><small>${view.focus}</small><h2>${view.title}</h2><p>${view.description}</p></div><button type="button" data-route="training">Continue Training →</button>`;
  return true;
}

export function routeAdaptiveTrainingClick(event, root = document) {
  const trigger = event?.target?.closest?.(TRAINING_ROUTE_SELECTOR);
  if (!trigger) return false;

  const canonicalTrainingButton = root.querySelector?.('#nav [data-route="training"]');
  if (!canonicalTrainingButton || canonicalTrainingButton === trigger) return false;

  event.preventDefault?.();
  event.stopImmediatePropagation?.();
  canonicalTrainingButton.click();
  return true;
}

function refreshHomeRecommendation() {
  const home = document.querySelector("#home.active, #home");
  if (!home) return;
  renderHomeAdaptiveRecommendation(home, readHomeAdaptiveRecommendation());
}

if (typeof document !== "undefined") {
  const app = document.getElementById("app");
  if (app) {
    new MutationObserver(() => queueMicrotask(refreshHomeRecommendation)).observe(app, {
      childList: true,
    });
  }
  document.addEventListener("click", (event) => {
    if (routeAdaptiveTrainingClick(event)) return;
    if (event.target.closest?.('[data-route="home"]')) setTimeout(refreshHomeRecommendation, 0);
  }, true);
  window.addEventListener("pageshow", refreshHomeRecommendation);
  refreshHomeRecommendation();
}

export { ADAPTIVE_CURRENT_KEY, TRAINING_ROUTE_SELECTOR };
