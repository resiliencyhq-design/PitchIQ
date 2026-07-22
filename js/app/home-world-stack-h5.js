import "../lab/native-haptics-bridge.js";
import "../lab/vibro-focus.js";
import { HOME_WORLDS, findHomeWorld } from "./home-worlds-data.js";
import { handleWorldRoute } from "./home-world-screen.js";

const HOME_SELECTOR = "#home";
const ACTIONS_SELECTOR = ".home-actions-grid";
const WORLDS_HEADING_CLASS = "home-academy-worlds-heading";
const WORLD_ROUTE_PREFIX = "world-";
const DEFAULT_WORLD_ID = "academy";
let selectedHomeWorldId = DEFAULT_WORLD_ID;

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
  heading.innerHTML = "<span>Explore</span><small>Preview each destination before you enter</small>";
  return heading;
}

function worldSelectorMarkup(world, selectedWorldId) {
  const selected = world.id === selectedWorldId;
  return `<button type="button" class="home-world-carousel-item${selected ? " is-selected" : ""}" data-home-world-select="${escapeHtml(world.id)}" aria-pressed="${selected}" aria-label="Preview ${escapeHtml(world.title)}">
    <span class="home-world-carousel-icon" aria-hidden="true">${escapeHtml(world.icon)}</span>
    <strong>${escapeHtml(world.title)}</strong>
  </button>`;
}

function previewModuleMarkup(module) {
  return `<span class="home-world-preview-module"><b aria-hidden="true">${escapeHtml(module.icon)}</b><span>${escapeHtml(module.title)}</span></span>`;
}

function destinationRoute(item) {
  return item.route || `${WORLD_ROUTE_PREFIX}${item.id}`;
}

function worldPreviewMarkup(world) {
  const route = destinationRoute(world);
  const ctaLabel = world.id === "rewards" ? "Open Rewards" : `Enter ${world.title}`;
  return `<article class="home-world-preview" data-home-world-preview="${escapeHtml(world.id)}" aria-live="polite">
    <span class="home-world-preview-art" aria-hidden="true"></span>
    <span class="home-world-preview-shade" aria-hidden="true"></span>
    <header>
      <span>${escapeHtml(world.badge)}</span>
      <b aria-hidden="true">${escapeHtml(world.icon)}</b>
    </header>
    <div class="home-world-preview-copy">
      <h2>${escapeHtml(world.title)}</h2>
      <p>${escapeHtml(world.purpose)}.</p>
    </div>
    <div class="home-world-preview-modules" aria-label="${escapeHtml(world.title)} highlights">
      ${world.modules.slice(0, 3).map(previewModuleMarkup).join("")}
    </div>
    <button type="button" class="primary home-world-preview-enter" data-home-world-enter="${escapeHtml(route)}">${escapeHtml(ctaLabel)} →</button>
  </article>`;
}

function ensurePreview(actions, world) {
  let preview = actions.nextElementSibling;
  if (!preview?.classList?.contains("home-world-preview")) {
    preview = document.createElement("article");
    actions.insertAdjacentElement("afterend", preview);
  }
  preview.outerHTML = worldPreviewMarkup(world);
}

function updateHomeWorldSelection(worldId, root = document) {
  const world = findHomeWorld(worldId) || findHomeWorld(DEFAULT_WORLD_ID);
  const home = root.querySelector?.(HOME_SELECTOR);
  const actions = home?.querySelector?.(ACTIONS_SELECTOR);
  if (!world || !actions) return false;

  selectedHomeWorldId = world.id;
  actions.querySelectorAll("[data-home-world-select]").forEach(button => {
    const selected = button.dataset.homeWorldSelect === selectedHomeWorldId;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
  ensurePreview(actions, world);
  home.dataset.selectedHomeWorld = selectedHomeWorldId;
  return true;
}

export function applyHomeWorldStack(root = document) {
  const home = root.querySelector?.(HOME_SELECTOR);
  const actions = home?.querySelector?.(ACTIONS_SELECTOR);
  if (!home || !actions) return false;

  const selected = findHomeWorld(home.dataset.selectedHomeWorld || selectedHomeWorldId) || HOME_WORLDS[0];
  ensureWorldsHeading(actions);
  actions.className = "home-actions-grid home-world-carousel";
  actions.setAttribute("aria-label", "PitchIQ Home destinations");
  actions.innerHTML = HOME_WORLDS.map(world => worldSelectorMarkup(world, selected.id)).join("");
  ensurePreview(actions, selected);
  selectedHomeWorldId = selected.id;
  home.dataset.selectedHomeWorld = selected.id;
  home.dataset.homeWorlds = "h29-unified-home-hub";
  return true;
}

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const selector = event.target.closest?.("[data-home-world-select]");
    if (selector) {
      event.preventDefault();
      updateHomeWorldSelection(selector.dataset.homeWorldSelect, document);
      return;
    }

    const enter = event.target.closest?.("[data-home-world-enter]");
    if (enter) {
      event.preventDefault();
      location.hash = enter.dataset.homeWorldEnter;
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
