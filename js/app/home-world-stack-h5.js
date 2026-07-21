const HOME_SELECTOR = "#home";
const ACTIONS_SELECTOR = ".home-actions-grid";
const WORLDS_HEADING_CLASS = "home-academy-worlds-heading";

function setCopy(button, icon, title, description, world) {
  if (!button) return;
  button.classList.add("home-world-card");
  button.dataset.homeWorld = world;
  const iconNode = button.querySelector("b");
  const titleNode = button.querySelector("span");
  const descriptionNode = button.querySelector("small");
  if (iconNode) iconNode.textContent = icon;
  if (titleNode) titleNode.textContent = title;
  if (descriptionNode) descriptionNode.textContent = description;
}

function ensureWorldsHeading(actions) {
  let heading = actions.previousElementSibling;
  if (!heading?.classList?.contains(WORLDS_HEADING_CLASS)) {
    heading = document.createElement("header");
    heading.className = WORLDS_HEADING_CLASS;
    heading.innerHTML = "<span>Your Academy</span><small>Choose how you want to develop today</small>";
    actions.insertAdjacentElement("beforebegin", heading);
  }
  return heading;
}

function createFootballIqCard(actions) {
  let card = actions.querySelector('[data-home-world="football-iq"]');
  if (card) return card;
  card = document.createElement("button");
  card.type = "button";
  card.className = "home-action-card home-world-card";
  card.dataset.homeWorld = "football-iq";
  card.dataset.homeFootballIqRoute = "football-iq-library";
  card.innerHTML = "<b>◉</b><span>Football IQ</span><small>See, scan and decide earlier</small>";
  actions.prepend(card);
  return card;
}

function createReflectCard(actions, footballIq) {
  let card = actions.querySelector('[data-home-world="reflect"]');
  if (card) return card;
  card = document.createElement("button");
  card.type = "button";
  card.className = "home-action-card home-world-card";
  card.dataset.homeWorld = "reflect";
  card.dataset.homeReflectRoute = "reflect-world";
  card.innerHTML = "<b>◎</b><span>Reflect</span><small>Turn every session into learning</small>";
  footballIq?.insertAdjacentElement("afterend", card);
  return card;
}

export function applyHomeWorldStack(root = document) {
  const home = root.querySelector?.(HOME_SELECTOR);
  const actions = home?.querySelector?.(ACTIONS_SELECTOR);
  if (!home || !actions) return false;

  actions.classList.add("home-world-stack");
  actions.setAttribute("aria-label", "PitchIQ Academy development worlds");
  ensureWorldsHeading(actions);

  const footballIq = createFootballIqCard(actions);
  const reflect = createReflectCard(actions, footballIq);
  const training = actions.querySelector('[data-route="training"]');
  const results = actions.querySelector('[data-route="results"]');
  const player = actions.querySelector('[data-route="player"], [data-home-world="lab"]');

  setCopy(footballIq, "◉", "Football IQ", "See, scan and decide earlier", "football-iq");
  setCopy(reflect, "◎", "Reflect", "Turn every session into learning", "reflect");
  setCopy(training, "⚽", "Technical Training", "Build touch, control and ball mastery", "technical-training");
  setCopy(results, "▮▮▮", "Progress", "Track development and review your latest rep", "progress");

  if (player) {
    player.removeAttribute("data-route");
    player.dataset.homeLabRoute = "lab-juggling";
    setCopy(player, "⚗", "PitchIQ Lab", "Explore experimental tools and camera features", "lab");
  }

  home.dataset.homeWorlds = "h10-reflect-world";
  return true;
}

function refreshWorldStack() { applyHomeWorldStack(document); }

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const footballIq = event.target.closest?.('[data-home-football-iq-route="football-iq-library"]');
    if (footballIq) { event.preventDefault(); window.location.hash = "football-iq-library"; return; }

    const reflect = event.target.closest?.('[data-home-reflect-route="reflect-world"]');
    if (reflect) { event.preventDefault(); window.location.hash = "reflect-world"; return; }

    const lab = event.target.closest?.('[data-home-lab-route="lab-juggling"]');
    if (!lab) return;
    event.preventDefault();
    window.location.hash = "lab-juggling";
  });
  window.addEventListener("pageshow", refreshWorldStack);
  refreshWorldStack();
}
