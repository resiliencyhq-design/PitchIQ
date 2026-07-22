import { findHomeWorld } from "./home-worlds-data.js";

const WORLD_ROUTE_PREFIX = "world-";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;",
  })[character]);
}

function moduleMarkup(module) {
  return `<button type="button" class="world-module-card" data-world-module-route="${escapeHtml(module.route)}">
    <span aria-hidden="true">${escapeHtml(module.icon)}</span>
    <span><strong>${escapeHtml(module.title)}</strong><small>${escapeHtml(module.description)}</small></span>
    <b aria-hidden="true">›</b>
  </button>`;
}

export function renderDevelopmentWorld(worldId, root = document) {
  const world = findHomeWorld(worldId);
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

export function currentWorldId(locationObject = location) {
  const route = locationObject.hash.replace(/^#/, "").split("/")[0];
  return route.startsWith(WORLD_ROUTE_PREFIX) ? route.slice(WORLD_ROUTE_PREFIX.length) : "";
}

export function handleWorldRoute(root = document, locationObject = location) {
  const worldId = currentWorldId(locationObject);
  if (worldId) queueMicrotask(() => renderDevelopmentWorld(worldId, root));
}
