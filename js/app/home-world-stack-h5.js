import "../lab/native-haptics-bridge.js";
import "../lab/vibro-focus.js";
import { HOME_WORLDS } from "./home-worlds-data.js";
import { handleWorldRoute } from "./home-world-screen.js";

const HOME_SELECTOR = "#home";
const ACTIONS_SELECTOR = ".home-actions-grid";
const WORLDS_HEADING_CLASS = "home-academy-worlds-heading";
const WORLD_ROUTE_PREFIX = "world-";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;",
  })[character]);
}

function ensureWorldsHeading(actions) {
  let heading = actions.previousElementSibling;
  if (!heading?.classList?.contains(WORLDS_HEADING_CLASS)) {
    heading = document.createElement("header");
    heading.className = WORLDS_HEADING_CLASS;
    actions.insertAdjacentElement("beforebegin", heading);
  }
  heading.innerHTML = "<span>Your Academy</span><small>Choose where you want to grow today</small>";
  return heading;
}

function worldCardMarkup(world) {
  return `<button type="button" class="home-world-quad-card" data-home-world="${escapeHtml(world.id)}" data-home-world-route="${WORLD_ROUTE_PREFIX}${escapeHtml(world.id)}" aria-label="Open ${escapeHtml(world.title)} world">
    <span class="home-world-art" aria-hidden="true"></span>
    <span class="home-world-shade" aria-hidden="true"></span>
    <span class="home-world-chevron" aria-hidden="true">›</span>
    <span class="home-world-icon" aria-hidden="true">${escapeHtml(world.icon)}</span>
    <strong>${escapeHtml(world.title)}</strong>
    <small>${escapeHtml(world.purpose)}</small>
    <em>${escapeHtml(world.badge)}</em>
  </button>`;
}

export function applyHomeWorldStack(root = document) {
  const home = root.querySelector?.(HOME_SELECTOR);
  const actions = home?.querySelector?.(ACTIONS_SELECTOR);
  if (!home || !actions) return false;

  ensureWorldsHeading(actions);
  actions.className = "home-actions-grid home-world-quad-grid";
  actions.setAttribute("aria-label", "PitchIQ development worlds");
  actions.innerHTML = HOME_WORLDS.map(worldCardMarkup).join("");
  home.dataset.homeWorlds = "h16-four-worlds";
  return true;
}

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const world = event.target.closest?.("[data-home-world-route]");
    if (world) {
      event.preventDefault();
      location.hash = world.dataset.homeWorldRoute;
      return;
    }

    const back = event.target.closest?.("[data-world-back]");
    if (back) {
      event.preventDefault();
      location.hash = "home";
      return;
    }

    const module = event.target.closest?.("[data-world-module-route]");
    if (module) {
      event.preventDefault();
      location.hash = module.dataset.worldModuleRoute;
    }
  }, true);

  window.addEventListener("hashchange", () => handleWorldRoute());
  window.addEventListener("pageshow", () => handleWorldRoute());
  handleWorldRoute();
}

export { HOME_WORLDS } from "./home-worlds-data.js";
export { renderDevelopmentWorld } from "./home-world-screen.js";
