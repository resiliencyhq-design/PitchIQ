import { applyHomeWorldStack } from "./home-world-stack-h5.js?v=sprint-h19-home-intelligence-polish-20260723";
import { applyHomeWorldPolish } from "./home-world-polish-h6.js?v=sprint-h6-world-card-polish-20260719";
import { applyHomeAdaptiveMission } from "./home-adaptive-mission-h8.js?v=sprint-h8-adaptive-mission-hub-20260721";

const HOME_SELECTOR = "#home";
const GRID_SELECTOR = ".home-v7-grid";
const HERO_SELECTOR = ".home-hero-card";
const STACK_CLASS = "home-content-stack";
const STYLE_ID = "pitchiq-home-content-stack-css";
const MISSION_STYLE_ID = "pitchiq-home-todays-mission-h3-css";
const FOOTBALL_IQ_STYLE_ID = "pitchiq-home-football-iq-h4-css";
const WORLD_STACK_STYLE_ID = "pitchiq-home-world-stack-h5-css";
const WORLD_POLISH_STYLE_ID = "pitchiq-home-world-polish-h6-css";
const FOUR_WORLDS_STYLE_ID = "pitchiq-home-four-worlds-h16-css";
const H13_STYLE_ID = "pitchiq-home-information-architecture-h13-css";
const H17_STYLE_ID = "pitchiq-home-compact-mission-h17-css";

const COMPACT_POSITION_CODES = {
  Goalkeeper: "GK",
  "Centre Back": "CB",
  "Left Back": "LB",
  "Right Back": "RB",
  "Defensive Midfielder": "CDM",
  "Central Midfielder": "CM",
  "Attacking Midfielder": "CAM",
  "Left Wing": "LW",
  "Right Wing": "RW",
  Winger: "WG",
  Striker: "ST",
  "Full Back": "FB"
};

function appendStylesheet(id, href) {
  let link = document.getElementById(id);
  if (link) {
    if (link.getAttribute("href") !== href) link.setAttribute("href", href);
    return;
  }
  link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function ensureStylesheet() {
  appendStylesheet(STYLE_ID, "css/home-content-stack.css?v=sprint-h2-home-content-wrapper-20260719");
  appendStylesheet(MISSION_STYLE_ID, "css/home-todays-mission-h3.css?v=sprint-h3-todays-mission-recomposition-20260719");
  appendStylesheet(FOOTBALL_IQ_STYLE_ID, "css/home-football-iq-h4.css?v=sprint-h4-football-iq-world-card-20260719");
  appendStylesheet(WORLD_STACK_STYLE_ID, "css/home-world-stack-h5.css?v=sprint-h7-development-worlds-20260721");
  appendStylesheet(WORLD_POLISH_STYLE_ID, "css/home-world-polish-h6.css?v=sprint-h6-world-card-polish-20260719");
  appendStylesheet(FOUR_WORLDS_STYLE_ID, "css/home-four-worlds-h16.css?v=sprint-h19-home-intelligence-polish-20260723");
  appendStylesheet(H13_STYLE_ID, "css/home-information-architecture-h13.css?v=refactor-explore-layout-ownership-20260723");
  appendStylesheet(H17_STYLE_ID, "css/home-compact-mission-h17.css?v=sprint-h17-compact-mission-hero-20260722");
}

function assignSlot(element, slot) {
  if (element && element.dataset.homeSlot !== slot) element.dataset.homeSlot = slot;
}

function applyCompactPlayerLabels(home) {
  const positionValue = home.querySelector(".home-profile-position-value");
  const styleLabel = home.querySelector(".home-profile-style-label");

  if (positionValue) {
    const fullPosition = positionValue.getAttribute("aria-label") || positionValue.textContent.trim();
    const compactCode = COMPACT_POSITION_CODES[fullPosition] || fullPosition.toUpperCase().slice(0, 3);
    positionValue.setAttribute("aria-label", fullPosition);
    if (positionValue.textContent !== compactCode) positionValue.textContent = compactCode;
  }

  if (styleLabel && styleLabel.textContent.trim() !== "Style") {
    styleLabel.textContent = "Style";
  }
}

function applyHomeInformationArchitecture(home, stack) {
  const mission = stack.querySelector(".home-mock-mission");
  const worlds = stack.querySelector(".home-actions-grid.home-world-carousel, .home-actions-grid.home-world-quad-grid");
  const exploreCard = worlds?.closest?.(".home-explore-card");
  const worldsBlock = exploreCard || worlds?.closest?.(".home-world-carousel-shell") || worlds;
  const worldsPreview = worldsBlock?.nextElementSibling?.classList?.contains("home-world-preview")
    ? worldsBlock.nextElementSibling
    : null;
  const supporting = stack.querySelector(".home-secondary-row");
  const stats = supporting?.querySelector(".home-training-stats") || stack.querySelector(":scope > .home-training-stats");
  const rewards = supporting?.querySelector(".home-pack-card") || stack.querySelector(".home-rewards-card");

  if (stats) stats.remove();

  if (worldsBlock) {
    stack.prepend(worldsBlock);
    if (worldsPreview) worldsBlock.after(worldsPreview);
  }

  if (mission) {
    mission.dataset.homeSlot = "todays-mission";
    worldsPreview ? worldsPreview.after(mission) : worldsBlock ? worldsBlock.after(mission) : stack.prepend(mission);
  }

  if (rewards) rewards.remove();
  if (supporting && !supporting.children.length) supporting.remove();

  home.dataset.homeComposition = "h19-home-intelligence-polish";
}

export function applyHomeContentComposition(root = document) {
  const home = root.querySelector?.(HOME_SELECTOR);
  const grid = home?.querySelector?.(GRID_SELECTOR);
  if (!home || !grid) return false;

  ensureStylesheet();

  const hero = grid.querySelector(`:scope > ${HERO_SELECTOR}`);
  if (!hero) return false;

  hero.dataset.homeRegion = "hero-locked";
  applyCompactPlayerLabels(home);
  assignSlot(grid.querySelector(":scope > .home-mock-mission, :scope > .home-content-stack > .home-mock-mission"), "todays-mission");
  assignSlot(grid.querySelector(":scope > .home-actions-grid, :scope > .home-content-stack > .home-actions-grid"), "home-hub");
  assignSlot(grid.querySelector(":scope > .home-secondary-row, :scope > .home-content-stack > .home-secondary-row"), "supporting-content");
  assignSlot(grid.querySelector(".home-adaptive-recommendation"), "football-iq-training");

  let stack = grid.querySelector(`:scope > .${STACK_CLASS}`);
  if (!stack) {
    stack = document.createElement("section");
    stack.className = STACK_CLASS;
    stack.dataset.homeRegion = "content-below-hero";
    stack.setAttribute("aria-label", "Home player development content");

    const movable = [...grid.children].filter(child => child !== hero);
    hero.insertAdjacentElement("afterend", stack);
    movable.forEach(child => stack.appendChild(child));
  }

  applyHomeAdaptiveMission(root);
  applyHomeWorldStack(root);
  applyHomeWorldPolish(root);
  applyHomeInformationArchitecture(home, stack);
  return true;
}

function refreshHomeComposition() {
  applyHomeContentComposition(document);
}

if (typeof document !== "undefined") {
  const app = document.getElementById("app");
  if (app) {
    new MutationObserver(() => queueMicrotask(refreshHomeComposition)).observe(app, {
      childList: true,
      subtree: false,
    });
  }
  window.addEventListener("pageshow", refreshHomeComposition);
  refreshHomeComposition();
}
