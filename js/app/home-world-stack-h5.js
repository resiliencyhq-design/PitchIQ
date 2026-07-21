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

function createWorldCard(actions, { world, route, icon, title, description, after }) {
  let card = actions.querySelector(`[data-home-world="${world}"]`);
  if (card) return card;
  card = document.createElement("button");
  card.type = "button";
  card.className = "home-action-card home-world-card";
  card.dataset.homeWorld = world;
  card.dataset.homeWorldRoute = route;
  card.innerHTML = `<b>${icon}</b><span>${title}</span><small>${description}</small>`;
  if (after) after.insertAdjacentElement("afterend", card); else actions.prepend(card);
  return card;
}

export function applyHomeWorldStack(root = document) {
  const home = root.querySelector?.(HOME_SELECTOR);
  const actions = home?.querySelector?.(ACTIONS_SELECTOR);
  if (!home || !actions) return false;

  actions.classList.add("home-world-stack");
  actions.setAttribute("aria-label", "PitchIQ Academy development worlds");
  ensureWorldsHeading(actions);

  const academy = createWorldCard(actions, { world:"academy", route:"academy-world", icon:"◆", title:"Academy Journey", description:"Pathways, weekly plans and unlocks" });
  const footballIq = createWorldCard(actions, { world:"football-iq", route:"football-iq-library", icon:"◉", title:"Football IQ", description:"See, scan and decide earlier", after:academy });
  const reflect = createWorldCard(actions, { world:"reflect", route:"reflect-world", icon:"◎", title:"Reflect", description:"Turn every session into learning", after:footballIq });
  const mindIq = createWorldCard(actions, { world:"mindiq", route:"mindiq-world", icon:"◇", title:"MindIQ", description:"Build confidence, focus and resilience", after:reflect });
  const coach = createWorldCard(actions, { world:"coach", route:"coach-world", icon:"✦", title:"Coach Intelligence", description:"Your next best action, explained", after:mindIq });
  const training = actions.querySelector('[data-route="training"]');
  const results = actions.querySelector('[data-route="results"]');
  const player = actions.querySelector('[data-route="player"], [data-home-world="lab"]');

  setCopy(academy, "◆", "Academy Journey", "Pathways, weekly plans and unlocks", "academy");
  setCopy(footballIq, "◉", "Football IQ", "See, scan and decide earlier", "football-iq");
  setCopy(reflect, "◎", "Reflect", "Turn every session into learning", "reflect");
  setCopy(mindIq, "◇", "MindIQ", "Build confidence, focus and resilience", "mindiq");
  setCopy(coach, "✦", "Coach Intelligence", "Your next best action, explained", "coach");
  setCopy(training, "⚽", "Technical Training", "Build touch, control and ball mastery", "technical-training");
  setCopy(results, "▮▮▮", "Progress", "Track development and review your latest rep", "progress");

  if (player) {
    player.removeAttribute("data-route");
    player.dataset.homeLabRoute = "lab-juggling";
    setCopy(player, "⚗", "PitchIQ Lab", "Explore experimental tools and camera features", "lab");
  }

  home.dataset.homeWorlds = "h13-academy-mission-system";
  return true;
}

function refreshWorldStack() { applyHomeWorldStack(document); }

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const world = event.target.closest?.("[data-home-world-route]");
    if (world) { event.preventDefault(); window.location.hash = world.dataset.homeWorldRoute; return; }
    const lab = event.target.closest?.('[data-home-lab-route="lab-juggling"]');
    if (!lab) return;
    event.preventDefault();
    window.location.hash = "lab-juggling";
  });
  window.addEventListener("pageshow", refreshWorldStack);
  refreshWorldStack();
}