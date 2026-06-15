const DEV_MODE = new URLSearchParams(location.search).has("dev");
const STORE_KEY = "pitchiqDevVisualLayoutStudio";
const SETTINGS_KEY = "pitchiqDevVisualLayoutStudioSettings";
const GRID = 8;
const DEFAULT_SETTINGS = { studio:false, grid:true, safe:false, names:true, spacing:false };
let settings = { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_KEY, {}) };
let layouts = readJson(STORE_KEY, {});
let selected = null;
let drag = null;
let resize = null;
let panel = null;
let badge = null;
let observer = null;

function readJson(key, fallback){ try { return JSON.parse(localStorage.getItem(key) || ""); } catch { return fallback; } }
function writeJson(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function routeKey(){
  const step = document.querySelector("[data-onboard-step]:not([hidden])")?.dataset?.onboardStep;
  if (document.getElementById("onboard") && step === "1") return "onboardingStep1";
  if (document.getElementById("onboard") && step === "2") return "onboardingStep2";
  if (document.getElementById("onboard") && step === "3") return "confirm";
  if (document.getElementById("splash")) return "splash";
  if (document.getElementById("home")) return "home";
  if (document.getElementById("training")) return "training";
  if (document.getElementById("results")) return "results";
  if (document.getElementById("player")) return "player";
  return "unknown";
}
function targetsForCurrentRoute(){
  const map = [
    ["splash", [["logo",".splash-logo-v1"],["headline",".splash-title-v1"],["cta",".splash-cta-v1"],["hero",".AcademyHeroPanel"],["copy",".splash-academy-copy"]]],
    ["onboardingStep1", [["logo",".onboard-logo-v1"],["progress",".onboard-progress"],["step",".position-title"],["heading","h1"],["input","#nameInput"],["cta",".onboard-cta-v1"]]],
    ["onboardingStep2", [["logo",".onboard-logo-v1"],["progress",".onboard-progress"],["step",".position-title"],["heading","h1"],["selector",".academy-pitch"],["confirm",".position-confirm"],["cta",".onboard-cta-v1"]]],
    ["confirm", [["logo",".onboard-logo-v1"],["progress",".onboard-progress"],["step",".position-title"],["heading","h1"],["card",".onboard-confirm-card"],["cta",".onboard-cta-v1"]]],
    ["home", [["header","header,.home-streak,.home-greeting"],["player-card",".home-hero-card"],["training-cards",".home-actions-grid,.home-mock-mission"],["navigation","#nav"]]],
    ["training", [["header",".reactive-top,header"],["main",".reactive-core"],["actions",".reactive-actions,.reactive-start"],["navigation","#nav"]]],
    ["results", [["header","header"],["result-card",".glass.tile"],["stats",".stats"],["actions",".actions"],["navigation","#nav"]]]
  ];
  return (map.find(([key]) => key === routeKey())?.[1] || []).map(([name, selector]) => {
    const el = document.querySelector(selector);
    return el ? { name, el } : null;
  }).filter(Boolean);
}
function frame(){ return document.querySelector(".DeveloperIPhoneFrame") || document.querySelector(".app-shell"); }
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
function snap(n){ return settings.grid ? Math.round(n / GRID) * GRID : Math.round(n); }
function ensurePanel(){
  if (panel || !DEV_MODE) return;
  panel = document.createElement("section");
  panel.className = "vls-panel";
  panel.innerHTML = `<strong>Visual Layout Studio</strong>
    <button data-vls-toggle="studio">Visual Layout Studio: <span></span></button>
    <button data-vls-toggle="grid">Snap to Grid: <span></span></button>
    <button data-vls-toggle="safe">Show Safe Areas: <span></span></button>
    <button data-vls-toggle="names">Show Component Names: <span></span></button>
    <button data-vls-toggle="spacing">Show Spacing: <span></span></button>
    <div class="vls-row"><button data-vls-action="save">Save Layout</button><button data-vls-action="reset">Reset Layout</button></div>
    <button data-vls-action="export">Export Layout CSS</button>
    <textarea id="vlsExport" readonly placeholder="Export appears here"></textarea>`;
  document.body.appendChild(panel);
  panel.querySelectorAll("[data-vls-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const key = btn.dataset.vlsToggle;
    settings[key] = !settings[key];
    writeJson(SETTINGS_KEY, settings);
    refresh();
  }));
  panel.querySelector('[data-vls-action="save"]').addEventListener("click", saveCurrentLayout);
  panel.querySelector('[data-vls-action="reset"]').addEventListener("click", resetLayout);
  panel.querySelector('[data-vls-action="export"]').addEventListener("click", exportLayout);
}
function updatePanel(){
  if (!panel) return;
  panel.querySelectorAll("[data-vls-toggle]").forEach(btn => {
    const key = btn.dataset.vlsToggle;
    btn.dataset.on = settings[key] ? "true" : "false";
    btn.querySelector("span").textContent = settings[key] ? "ON" : "OFF";
  });
}
function clearTargets(){
  document.querySelectorAll(".vls-target").forEach(el => {
    el.classList.remove("vls-target", "vls-selected");
    el.removeAttribute("data-vls-name");
    el.querySelectorAll(":scope > .vls-resize").forEach(h => h.remove());
  });
  document.querySelectorAll(".vls-badge,.vls-spacing-line").forEach(el => el.remove());
}
function makeTarget({name, el}){
  el.classList.add("vls-target");
  el.dataset.vlsName = name;
  if (!el.querySelector(":scope > .vls-resize")) {
    const handle = document.createElement("i");
    handle.className = "vls-resize";
    el.appendChild(handle);
    handle.addEventListener("pointerdown", e => startResize(e, el, name));
  }
  el.addEventListener("pointerdown", e => startDrag(e, el, name));
}
function applyStoredLayout(){
  if (!DEV_MODE || !settings.studio) return;
  const key = routeKey();
  const frameRect = frame()?.getBoundingClientRect();
  if (!frameRect) return;
  const screenLayout = layouts[key] || {};
  targetsForCurrentRoute().forEach(({name, el}) => {
    const rule = screenLayout[name];
    if (!rule) return;
    el.style.position = "absolute";
    el.style.left = `${rule.x}px`;
    el.style.top = `${rule.y}px`;
    if (rule.w) el.style.width = `${rule.w}px`;
    if (rule.h) el.style.height = `${rule.h}px`;
    el.style.zIndex = rule.z || 20;
  });
}
function refresh(){
  document.body.classList.toggle("vls-active", DEV_MODE && settings.studio);
  document.body.classList.toggle("vls-grid", DEV_MODE && settings.studio && settings.grid);
  document.body.classList.toggle("vls-safe", DEV_MODE && settings.studio && settings.safe);
  document.body.classList.toggle("vls-names", DEV_MODE && settings.studio && settings.names);
  document.body.classList.toggle("vls-spacing", DEV_MODE && settings.studio && settings.spacing);
  updatePanel();
  clearTargets();
  if (!DEV_MODE || !settings.studio) return;
  applyStoredLayout();
  targetsForCurrentRoute().forEach(makeTarget);
  drawSpacing();
}
function startDrag(e, el, name){
  if (!settings.studio || e.target.classList.contains("vls-resize")) return;
  e.preventDefault(); e.stopPropagation();
  selected?.classList.remove("vls-selected"); selected = el; el.classList.add("vls-selected");
  const r = el.getBoundingClientRect(), fr = frame().getBoundingClientRect();
  drag = { el, name, dx:e.clientX-r.left, dy:e.clientY-r.top, fr };
  document.addEventListener("pointermove", onDrag);
  document.addEventListener("pointerup", stopMove, { once:true });
  showBadge(el);
}
function onDrag(e){
  if (!drag) return;
  const { el, fr, dx, dy } = drag;
  const r = el.getBoundingClientRect();
  const minTouch = el.matches("button,.primary,.splash-cta-v1,.onboard-cta-v1") ? 56 : 12;
  const x = snap(clamp(e.clientX - fr.left - dx, 0, fr.width - r.width));
  const y = snap(clamp(e.clientY - fr.top - dy, 0, fr.height - Math.max(r.height, minTouch)));
  el.style.position = "absolute"; el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.zIndex = 30;
  showBadge(el); drawSpacing();
}
function startResize(e, el, name){
  e.preventDefault(); e.stopPropagation();
  const r = el.getBoundingClientRect(), fr = frame().getBoundingClientRect();
  resize = { el, name, startX:e.clientX, startY:e.clientY, w:r.width, h:r.height, fr, left:r.left-fr.left, top:r.top-fr.top };
  selected?.classList.remove("vls-selected"); selected = el; el.classList.add("vls-selected");
  document.addEventListener("pointermove", onResize);
  document.addEventListener("pointerup", stopMove, { once:true });
  showBadge(el);
}
function onResize(e){
  if (!resize) return;
  const { el, fr, left, top } = resize;
  const minW = el.matches("button,.primary,.splash-cta-v1,.onboard-cta-v1") ? 120 : 32;
  const minH = el.matches("button,.primary,.splash-cta-v1,.onboard-cta-v1") ? 56 : 24;
  const w = snap(clamp(resize.w + e.clientX - resize.startX, minW, fr.width - left));
  const h = snap(clamp(resize.h + e.clientY - resize.startY, minH, fr.height - top));
  el.style.width = `${w}px`; el.style.height = `${h}px`;
  showBadge(el); drawSpacing();
}
function stopMove(){ document.removeEventListener("pointermove", onDrag); document.removeEventListener("pointermove", onResize); drag = null; resize = null; saveCurrentLayout(false); }
function showBadge(el){
  if (!badge) { badge = document.createElement("div"); badge.className = "vls-badge"; document.body.appendChild(badge); }
  const r = el.getBoundingClientRect(), fr = frame().getBoundingClientRect();
  badge.style.left = `${r.left}px`; badge.style.top = `${Math.max(0, r.top - 24)}px`;
  badge.textContent = `x:${Math.round(r.left-fr.left)} y:${Math.round(r.top-fr.top)} w:${Math.round(r.width)} h:${Math.round(r.height)}`;
}
function drawSpacing(){
  document.querySelectorAll(".vls-spacing-line").forEach(el => el.remove());
  if (!settings.spacing || !settings.studio) return;
  const items = targetsForCurrentRoute().map(t => t.el.getBoundingClientRect()).sort((a,b)=>a.top-b.top);
  for (let i=1;i<items.length;i++) {
    const gap = Math.round(items[i].top - items[i-1].bottom);
    if (gap < 0) continue;
    const line = document.createElement("div"); line.className = "vls-spacing-line";
    line.style.left = `${items[i].left}px`; line.style.top = `${items[i-1].bottom + gap/2}px`; line.style.width = `${items[i].width}px`;
    line.textContent = `${gap}px`; document.body.appendChild(line);
  }
}
function saveCurrentLayout(showToast=true){
  if (!settings.studio) return;
  const key = routeKey(), fr = frame()?.getBoundingClientRect(); if (!fr) return;
  layouts[key] ||= {};
  targetsForCurrentRoute().forEach(({name, el}) => {
    const r = el.getBoundingClientRect();
    layouts[key][name] = { x:Math.round(r.left-fr.left), y:Math.round(r.top-fr.top), w:Math.round(r.width), h:Math.round(r.height) };
  });
  writeJson(STORE_KEY, layouts);
  if (showToast) exportLayout();
}
function resetLayout(){
  delete layouts[routeKey()]; writeJson(STORE_KEY, layouts);
  targetsForCurrentRoute().forEach(({el}) => { el.removeAttribute("style"); });
  refresh(); exportLayout();
}
function exportLayout(){
  const key = routeKey();
  const data = layouts[key] || {};
  const css = Object.entries(data).flatMap(([name, v]) => [`--${key}-${name}-x:${v.x}px;`, `--${key}-${name}-y:${v.y}px;`, `--${key}-${name}-w:${v.w}px;`, `--${key}-${name}-h:${v.h}px;`]).join("\n");
  const out = panel?.querySelector("#vlsExport"); if (out) out.value = css + "\n\n" + JSON.stringify({ [key]:data }, null, 2);
}
function init(){
  if (!DEV_MODE) return;
  ensurePanel(); refresh();
  observer = new MutationObserver(() => requestAnimationFrame(refresh));
  observer.observe(document.getElementById("app"), { childList:true, subtree:true, attributes:true, attributeFilter:["hidden","class"] });
}
window.addEventListener("DOMContentLoaded", () => setTimeout(init, 400));
