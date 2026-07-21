import "../lab/native-haptics-bridge.js";
import "../lab/vibro-focus.js";

const HOME_SELECTOR = "#home";
const ACTIONS_SELECTOR = ".home-actions-grid";
const WORLDS_HEADING_CLASS = "home-academy-worlds-heading";
const WORLD_ROUTE_PREFIX = "world-";

export const HOME_WORLDS = Object.freeze([
  {
    id: "academy",
    title: "Academy",
    purpose: "Your pathway and today's plan",
    icon: "✦",
    badge: "Your journey",
    modules: [
      { id:"academy-journey", title:"Academy Journey", description:"Pathways, weekly plans and unlocks", icon:"◆", route:"academy-world" },
      { id:"coach-intelligence", title:"Coach Intelligence", description:"Your next best action, explained", icon:"✦", route:"coach-world" },
    ],
  },
  {
    id: "train",
    title: "Train",
    purpose: "Build your football skills and IQ",
    icon: "⚽",
    badge: "3 training areas",
    modules: [
      { id:"football-iq", title:"Football IQ", description:"See, scan and decide earlier", icon:"◉", route:"football-iq-library" },
      { id:"technical-training", title:"Technical Training", description:"Build touch, control and ball mastery", icon:"⚽", route:"training" },
      { id:"mindiq", title:"MindIQ", description:"Build confidence, focus and resilience", icon:"◇", route:"mindiq-world" },
    ],
  },
  {
    id: "review",
    title: "Review",
    purpose: "See progress and learn from every session",
    icon: "▮▮▮",
    badge: "Development insights",
    modules: [
      { id:"player-twin", title:"Player Twin", description:"See how your development is changing", icon:"◈", route:"player-twin" },
      { id:"reflect", title:"Reflect", description:"Turn every session into learning", icon:"◎", route:"reflect-world" },
      { id:"progress", title:"Progress", description:"Track development and milestones", icon:"↗", route:"results" },
      { id:"training-stats", title:"Training Stats", description:"Review your detailed training data", icon:"⌁", route:"results" },
    ],
  },
  {
    id: "lab",
    title: "Lab",
    purpose: "Explore new tools and early access",
    icon: "⚗",
    badge: "Experimental",
    modules: [
      { id:"pitchiq-lab", title:"PitchIQ Lab", description:"Experimental tools and camera features", icon:"⚗", route:"lab-juggling" },
      { id:"calmsense", title:"CalmSense", description:"Measure breathing rhythm with your phone", icon:"◌", route:"lab-calmsense" },
      { id:"vibro-focus", title:"Vibro Focus", description:"Test calm, focus and recovery vibration patterns", icon:"≋", route:"lab-vibro-focus" },
    ],
  },
]);

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

function moduleMarkup(module) {
  return `<button type="button" class="world-module-card" data-world-module-route="${escapeHtml(module.route)}">
    <span aria-hidden="true">${escapeHtml(module.icon)}</span>
    <span><strong>${escapeHtml(module.title)}</strong><small>${escapeHtml(module.description)}</small></span>
    <b aria-hidden="true">›</b>
  </button>`;
}

export function renderDevelopmentWorld(worldId, root = document) {
  const world = HOME_WORLDS.find(item => item.id === worldId);
  const app = root.querySelector?.("#app");
  if (!world || !app) return false;

  document.body.classList.remove("pitchiq-splash-active", "pitchiq-immersive-active");
  document.getElementById("nav")?.classList.add("visible");
  app.innerHTML = `<section class="development-world-screen" data-development-world="${escapeHtml(world.id)}">
    <header class="development-world-topbar">
      <button type="button" data-world-back aria-label="Back to Home">‹</button>
      <div><span>PitchIQ</span><strong>${escapeHtml(world.title)}</strong></div>
      <em>${escapeHtml(world.badge)}</em>
    </header>
    <main class="development-world-content">
      <section class="development-world-hero">
        <span class="development-world-hero-art" aria-hidden="true"></span>
        <span class="development-world-hero-shade" aria-hidden="true"></span>
        <div><span>${escapeHtml(world.title)} World</span><h1>${escapeHtml(world.title)}</h1><p>${escapeHtml(world.purpose)}.</p></div>
        <b aria-hidden="true">${escapeHtml(world.icon)}</b>
      </section>
      <section class="development-world-modules">
        <header><span>Choose an area</span><small>${world.modules.length} ${world.modules.length === 1 ? "destination" : "destinations"}</small></header>
        ${world.modules.map(moduleMarkup).join("")}
      </section>
    </main>
  </section>`;
  return true;
}

function currentWorldId() {
  const route = location.hash.replace(/^#/, "").split("/")[0];
  return route.startsWith(WORLD_ROUTE_PREFIX) ? route.slice(WORLD_ROUTE_PREFIX.length) : "";
}

function handleWorldRoute() {
  const worldId = currentWorldId();
  if (worldId) queueMicrotask(() => renderDevelopmentWorld(worldId));
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

  window.addEventListener("hashchange", handleWorldRoute);
  window.addEventListener("pageshow", handleWorldRoute);
  handleWorldRoute();
}
