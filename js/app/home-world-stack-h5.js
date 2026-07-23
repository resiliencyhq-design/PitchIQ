import "../lab/native-haptics-bridge.js";
import "../lab/vibro-focus.js";
import { HOME_WORLDS, findHomeWorld } from "./home-worlds-data.js";
import { handleWorldRoute } from "./home-world-screen.js";

const HOME_SELECTOR = "#home";
const ACTIONS_SELECTOR = ".home-actions-grid";
const EXPLORE_CARD_CLASS = "home-explore-card";
const WORLDS_HEADING_CLASS = "home-academy-worlds-heading";
const PAGINATION_CLASS = "home-world-carousel-pagination";
const WORLD_ROUTE_PREFIX = "world-";
const DEFAULT_WORLD_ID = "academy";
let focusedWorldId = DEFAULT_WORLD_ID;
let expandedWorldId = null;
let carouselScrollTimer = null;
let arrowPulseTimer = null;
let programmaticScrollUntil = 0;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;",
  })[character]);
}

function ensureExploreCard(actions) {
  const shell = actions.closest(".home-world-carousel-shell") || actions;
  let card = shell.closest(`.${EXPLORE_CARD_CLASS}`);
  if (!card) {
    card = document.createElement("section");
    card.className = EXPLORE_CARD_CLASS;
    card.setAttribute("aria-label", "Explore PitchIQ destinations");
    shell.replaceWith(card);
    card.appendChild(shell);
  }
  return card;
}

function ensureWorldsHeading(actions) {
  const card = ensureExploreCard(actions);
  let heading = card.querySelector(`:scope > .${WORLDS_HEADING_CLASS}`);
  if (!heading) {
    heading = document.createElement("header");
    heading.className = WORLDS_HEADING_CLASS;
  }
  heading.innerHTML = "<span>Explore</span><small>Tap to preview • swipe or use arrows to browse</small>";
  const shell = card.querySelector(":scope > .home-world-carousel-shell");
  if (shell) card.insertBefore(heading, shell);
  else card.prepend(heading);
  return heading;
}

function ensurePagination(actions) {
  const card = ensureExploreCard(actions);
  let pagination = card.querySelector(`:scope > .${PAGINATION_CLASS}`);
  if (!pagination) {
    pagination = document.createElement("div");
    pagination.className = PAGINATION_CLASS;
    pagination.setAttribute("aria-label", "Explore destination position");
  }
  pagination.innerHTML = HOME_WORLDS.map(world => `<span class="home-world-carousel-dot" data-home-world-dot="${escapeHtml(world.id)}" aria-hidden="true"></span>`).join("");
  card.append(pagination);
  return pagination;
}

function worldSelectorMarkup(world, expandedId) {
  const expanded = world.id === expandedId;
  return `<button type="button" class="home-world-carousel-item${expanded ? " is-selected" : ""}" data-home-world-select="${escapeHtml(world.id)}" aria-pressed="${expanded}" aria-expanded="${expanded}" aria-label="${expanded ? "Close" : "Preview"} ${escapeHtml(world.title)}">
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
  return `<article class="home-world-preview is-opening" data-home-world-preview="${escapeHtml(world.id)}" aria-live="polite">
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

function previewElement(actions) {
  const card = actions.closest(`.${EXPLORE_CARD_CLASS}`);
  const candidate = card?.nextElementSibling;
  return candidate?.classList?.contains("home-world-preview") ? candidate : null;
}

function removePreview(actions) {
  const preview = previewElement(actions);
  if (!preview) return;
  preview.classList.add("is-closing");
  window.setTimeout(() => preview.remove(), 180);
}

function ensurePreview(actions, world) {
  const card = actions.closest(`.${EXPLORE_CARD_CLASS}`) || actions.closest(".home-world-carousel-shell") || actions;
  const existing = previewElement(actions);
  const markup = worldPreviewMarkup(world);
  if (existing) existing.outerHTML = markup;
  else card.insertAdjacentHTML("afterend", markup);
}

function ensureCarouselShell(actions) {
  let shell = actions.parentElement;
  if (!shell?.classList?.contains("home-world-carousel-shell")) {
    shell = document.createElement("div");
    shell.className = "home-world-carousel-shell";
    actions.replaceWith(shell);
    shell.appendChild(actions);
  }
  let previous = shell.querySelector('[data-home-world-arrow="previous"]');
  let next = shell.querySelector('[data-home-world-arrow="next"]');
  if (!previous) {
    previous = document.createElement("button");
    previous.type = "button";
    previous.className = "home-world-carousel-arrow home-world-carousel-arrow-previous";
    previous.dataset.homeWorldArrow = "previous";
    previous.setAttribute("aria-label", "Previous destination");
    previous.innerHTML = "‹";
    shell.prepend(previous);
  }
  if (!next) {
    next = document.createElement("button");
    next.type = "button";
    next.className = "home-world-carousel-arrow home-world-carousel-arrow-next";
    next.dataset.homeWorldArrow = "next";
    next.setAttribute("aria-label", "Next destination");
    next.innerHTML = "›";
    shell.append(next);
  }
  ensureExploreCard(actions);
  return shell;
}

function circularDistance(index, focusIndex, length) {
  const direct = Math.abs(index - focusIndex);
  return Math.min(direct, length - direct);
}

function setFocusState(actions, worldId) {
  const focusIndex = Math.max(0, HOME_WORLDS.findIndex(world => world.id === worldId));
  actions.querySelectorAll("[data-home-world-select]").forEach((button, index) => {
    const distance = circularDistance(index, focusIndex, HOME_WORLDS.length);
    button.classList.toggle("is-focused", distance === 0);
    button.classList.toggle("is-near", distance === 1);
    button.classList.toggle("is-far", distance > 1);
    button.dataset.focusDistance = String(distance);
  });
  const card = actions.closest(`.${EXPLORE_CARD_CLASS}`);
  card?.querySelectorAll("[data-home-world-dot]").forEach(dot => {
    dot.classList.toggle("is-active", dot.dataset.homeWorldDot === worldId);
  });
}

function setExpandedState(actions, worldId) {
  actions.querySelectorAll("[data-home-world-select]").forEach(button => {
    const expanded = Boolean(worldId) && button.dataset.homeWorldSelect === worldId;
    button.classList.toggle("is-selected", expanded);
    button.setAttribute("aria-pressed", expanded ? "true" : "false");
    button.setAttribute("aria-expanded", expanded ? "true" : "false");
    const world = findHomeWorld(button.dataset.homeWorldSelect);
    button.setAttribute("aria-label", `${expanded ? "Close" : "Preview"} ${world?.title || "destination"}`);
  });
}

function centreCarouselItem(actions, button, behavior = "smooth") {
  if (!button) return;
  const target = button.offsetLeft + button.offsetWidth / 2 - actions.clientWidth / 2;
  const maxScroll = Math.max(0, actions.scrollWidth - actions.clientWidth);
  const left = Math.min(maxScroll, Math.max(0, target));
  programmaticScrollUntil = performance.now() + (behavior === "smooth" ? 420 : 80);
  actions.scrollTo({ left, behavior });
}

function focusWorld(worldId, root = document, { openPreview = false, scroll = true } = {}) {
  const world = findHomeWorld(worldId) || findHomeWorld(DEFAULT_WORLD_ID);
  const home = root.querySelector?.(HOME_SELECTOR);
  const actions = home?.querySelector?.(ACTIONS_SELECTOR);
  if (!world || !actions) return false;

  focusedWorldId = world.id;
  expandedWorldId = openPreview ? (expandedWorldId === world.id ? null : world.id) : null;

  setFocusState(actions, focusedWorldId);
  setExpandedState(actions, expandedWorldId);
  if (expandedWorldId) ensurePreview(actions, world);
  else removePreview(actions);

  home.dataset.focusedHomeWorld = focusedWorldId;
  if (expandedWorldId) home.dataset.expandedHomeWorld = expandedWorldId;
  else delete home.dataset.expandedHomeWorld;

  if (scroll) {
    const button = actions.querySelector(`[data-home-world-select="${CSS.escape(focusedWorldId)}"]`);
    centreCarouselItem(actions, button);
  }
  return true;
}

function pulseArrow(arrow) {
  window.clearTimeout(arrowPulseTimer);
  document.querySelectorAll(".home-world-carousel-arrow.is-pulsing").forEach(button => button.classList.remove("is-pulsing"));
  arrow.classList.add("is-pulsing");
  arrowPulseTimer = window.setTimeout(() => arrow.classList.remove("is-pulsing"), 180);
}

function stepWorld(direction, root = document) {
  const currentIndex = Math.max(0, HOME_WORLDS.findIndex(world => world.id === focusedWorldId));
  const nextIndex = (currentIndex + direction + HOME_WORLDS.length) % HOME_WORLDS.length;
  focusWorld(HOME_WORLDS[nextIndex].id, root, { openPreview: false, scroll: true });
}

function updateFocusFromScroll(actions) {
  const centre = actions.getBoundingClientRect().left + actions.clientWidth / 2;
  const buttons = [...actions.querySelectorAll("[data-home-world-select]")];
  if (!buttons.length) return;
  const nearest = buttons.reduce((best, button) => {
    const rect = button.getBoundingClientRect();
    const distance = Math.abs(rect.left + rect.width / 2 - centre);
    return !best || distance < best.distance ? { button, distance } : best;
  }, null);
  if (nearest?.button?.dataset.homeWorldSelect) {
    focusedWorldId = nearest.button.dataset.homeWorldSelect;
    const home = actions.closest(HOME_SELECTOR);
    if (home) home.dataset.focusedHomeWorld = focusedWorldId;
    expandedWorldId = null;
    setFocusState(actions, focusedWorldId);
    setExpandedState(actions, null);
    removePreview(actions);
    centreCarouselItem(actions, nearest.button);
  }
}

function bindCarouselScroll(actions) {
  if (actions.dataset.homeWorldScrollBound === "true") return;
  actions.dataset.homeWorldScrollBound = "true";
  actions.addEventListener("scroll", () => {
    window.clearTimeout(carouselScrollTimer);
    if (performance.now() < programmaticScrollUntil) return;
    carouselScrollTimer = window.setTimeout(() => updateFocusFromScroll(actions), 140);
  }, { passive: true });
}

export function applyHomeWorldStack(root = document) {
  const home = root.querySelector?.(HOME_SELECTOR);
  const actions = home?.querySelector?.(ACTIONS_SELECTOR);
  if (!home || !actions) return false;

  focusedWorldId = DEFAULT_WORLD_ID;
  expandedWorldId = null;
  actions.className = "home-actions-grid home-world-carousel";
  actions.setAttribute("aria-label", "PitchIQ Home destinations");
  actions.innerHTML = HOME_WORLDS.map(world => worldSelectorMarkup(world, null)).join("");
  ensureCarouselShell(actions);
  ensureWorldsHeading(actions);
  ensurePagination(actions);
  setFocusState(actions, focusedWorldId);
  removePreview(actions);
  bindCarouselScroll(actions);
  requestAnimationFrame(() => {
    const button = actions.querySelector(`[data-home-world-select="${CSS.escape(focusedWorldId)}"]`);
    centreCarouselItem(actions, button, "auto");
  });
  home.dataset.focusedHomeWorld = focusedWorldId;
  delete home.dataset.expandedHomeWorld;
  home.dataset.homeWorlds = "h34-carousel-edge-safe-centering";
  return true;
}

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const selector = event.target.closest?.("[data-home-world-select]");
    if (selector) {
      event.preventDefault();
      focusWorld(selector.dataset.homeWorldSelect, document, { openPreview: true, scroll: true });
      return;
    }

    const arrow = event.target.closest?.("[data-home-world-arrow]");
    if (arrow) {
      event.preventDefault();
      pulseArrow(arrow);
      stepWorld(arrow.dataset.homeWorldArrow === "previous" ? -1 : 1, document);
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
