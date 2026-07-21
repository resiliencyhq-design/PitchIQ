import { applyHomeWorldStack } from "./home-world-stack-h5.js?v=sprint-h7-development-worlds-20260721";
import { applyHomeWorldPolish } from "./home-world-polish-h6.js?v=sprint-h6-world-card-polish-20260719";

const HOME_SELECTOR = "#home";
const GRID_SELECTOR = ".home-v7-grid";
const HERO_SELECTOR = ".home-hero-card";
const STACK_CLASS = "home-content-stack";
const STYLE_ID = "pitchiq-home-content-stack-css";
const MISSION_STYLE_ID = "pitchiq-home-todays-mission-h3-css";
const FOOTBALL_IQ_STYLE_ID = "pitchiq-home-football-iq-h4-css";
const WORLD_STACK_STYLE_ID = "pitchiq-home-world-stack-h5-css";
const WORLD_POLISH_STYLE_ID = "pitchiq-home-world-polish-h6-css";

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
}

function assignSlot(element, slot) {
  if (element && element.dataset.homeSlot !== slot) element.dataset.homeSlot = slot;
}

export function applyHomeContentComposition(root = document) {
  const home = root.querySelector?.(HOME_SELECTOR);
  const grid = home?.querySelector?.(GRID_SELECTOR);
  if (!home || !grid) return false;

  ensureStylesheet();

  const hero = grid.querySelector(`:scope > ${HERO_SELECTOR}`);
  if (!hero) return false;

  hero.dataset.homeRegion = "hero-locked";
  assignSlot(grid.querySelector(":scope > .home-mock-mission, :scope > .home-content-stack > .home-mock-mission"), "todays-mission");
  assignSlot(grid.querySelector(":scope > .home-actions-grid, :scope > .home-content-stack > .home-actions-grid"), "academy-worlds");
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

  applyHomeWorldStack(root);
  applyHomeWorldPolish(root);
  home.dataset.homeComposition = "h7";
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
