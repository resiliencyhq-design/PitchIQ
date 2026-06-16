const DEV_ENABLED = new URLSearchParams(location.search).has("dev");
const VLS_POS_KEY = "pitchiqDevVisualLayoutStudioPanelPos";
const DEV_POS_KEY = "pitchiqDeveloperPanelPos";
const defaults = {
  vls: { x: 16, y: 16 },
  dev: { x: 16, y: 380 }
};
let active = null;
function readPos(key, fallback) {
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") }; } catch { return fallback; }
}
function writePos(key, pos) { localStorage.setItem(key, JSON.stringify(pos)); }
function clampPanel(panel, x, y) {
  const w = panel.offsetWidth || 220;
  const h = panel.offsetHeight || 120;
  return {
    x: Math.max(0, Math.min(Math.round(x), Math.max(0, window.innerWidth - w - 8))),
    y: Math.max(0, Math.min(Math.round(y), Math.max(0, window.innerHeight - h - 8)))
  };
}
function applyPosition(panel, key, fallback) {
  const p = clampPanel(panel, readPos(key, fallback).x, readPos(key, fallback).y);
  panel.style.position = "fixed";
  panel.style.left = `${p.x}px`;
  panel.style.top = `${p.y}px`;
  panel.style.right = "auto";
  panel.style.bottom = "auto";
}
function startDrag(event, panel, key, fallback) {
  event.preventDefault();
  event.stopPropagation();
  const p = readPos(key, fallback);
  active = { panel, key, fallback, sx: event.clientX, sy: event.clientY, x: p.x, y: p.y };
  panel.classList.add("dev-panel-moving");
  event.currentTarget.setPointerCapture?.(event.pointerId);
  document.addEventListener("pointermove", moveDrag, { passive: false });
  document.addEventListener("pointerup", stopDrag, { once: true });
  document.addEventListener("pointercancel", stopDrag, { once: true });
}
function moveDrag(event) {
  if (!active) return;
  event.preventDefault();
  const next = clampPanel(active.panel, active.x + event.clientX - active.sx, active.y + event.clientY - active.sy);
  writePos(active.key, next);
  applyPosition(active.panel, active.key, active.fallback);
}
function stopDrag() {
  active?.panel?.classList.remove("dev-panel-moving");
  active = null;
  document.removeEventListener("pointermove", moveDrag);
}
function styleHeader(header) {
  header.style.cursor = "grab";
  header.style.userSelect = "none";
  header.style.display = "block";
  header.style.padding = "4px 2px 8px";
}
function ensureDevPanel(panel) {
  if (panel.dataset.floatReady === "true") return;
  panel.dataset.floatReady = "true";
  panel.style.zIndex = "2100";
  const header = panel.querySelector("strong") || panel.firstElementChild;
  if (header) {
    styleHeader(header);
    header.addEventListener("pointerdown", e => startDrag(e, panel, DEV_POS_KEY, defaults.dev));
  }
  applyPosition(panel, DEV_POS_KEY, defaults.dev);
}
function ensureVlsPanel(panel) {
  if (panel.dataset.floatReady === "true") return;
  panel.dataset.floatReady = "true";
  panel.style.zIndex = "2000";
  const header = panel.querySelector("strong") || panel.firstElementChild;
  if (header) {
    styleHeader(header);
    header.addEventListener("pointerdown", e => startDrag(e, panel, VLS_POS_KEY, defaults.vls));
  }
  applyPosition(panel, VLS_POS_KEY, defaults.vls);
}
function ensureVlsTab(tab) {
  if (tab.dataset.floatReady === "true") return;
  tab.dataset.floatReady = "true";
  tab.addEventListener("pointerdown", e => startDrag(e, tab, VLS_POS_KEY, defaults.vls));
  applyPosition(tab, VLS_POS_KEY, defaults.vls);
}
function injectDevButtons(panel) {
  if (!panel || panel.dataset.devButtonsReady === "true" || !panel.textContent.includes("PitchIQ Developer")) return;
  panel.dataset.devButtonsReady = "true";
  const make = (text, bg) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.style.cssText = `display:block;width:100%;margin:3px 0;padding:6px 7px;border:0;border-radius:7px;background:${bg};color:#fff;text-align:left;font:inherit;cursor:pointer`;
    return button;
  };
  const dashboard = make("← Return to Dashboard", "rgba(215,255,46,.18)");
  dashboard.style.color = "#d7ff2e";
  dashboard.addEventListener("click", () => { window.location.href = "tools/pitchiq-hq.html"; });
  const reset = make("Reset Panel Positions", "rgba(138,180,255,.18)");
  reset.addEventListener("click", () => {
    writePos(VLS_POS_KEY, defaults.vls);
    writePos(DEV_POS_KEY, defaults.dev);
    document.querySelectorAll(".vls-panel,.vls-panel-tab,#pitchiq-dev-panel").forEach(el => {
      if (el.classList.contains("vls-panel") || el.classList.contains("vls-panel-tab")) applyPosition(el, VLS_POS_KEY, defaults.vls);
      if (el.id === "pitchiq-dev-panel") applyPosition(el, DEV_POS_KEY, defaults.dev);
    });
  });
  panel.appendChild(document.createElement("hr")).style.cssText = "border:0;border-top:1px solid rgba(255,255,255,.14);margin:8px 0";
  panel.appendChild(dashboard);
  panel.appendChild(reset);
}
function scan() {
  const dev = document.getElementById("pitchiq-dev-panel");
  if (dev) { ensureDevPanel(dev); injectDevButtons(dev); }
  document.querySelectorAll(".vls-panel").forEach(ensureVlsPanel);
  document.querySelectorAll(".vls-panel-tab").forEach(ensureVlsTab);
}
if (DEV_ENABLED) {
  const style = document.createElement("style");
  style.textContent = `.dev-panel-moving{cursor:grabbing!important}.dev-panel-moving *{user-select:none!important}.vls-panel strong,#pitchiq-dev-panel strong{cursor:grab!important}`;
  document.head.appendChild(style);
  const observer = new MutationObserver(scan);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", scan);
  window.addEventListener("DOMContentLoaded", () => setTimeout(scan, 300));
  setInterval(scan, 1000);
}
