/* ==========================================================
   PitchIQ Studio — Device Companion
   Touch-first preview + nudge controls.
   ========================================================== */

const STORAGE_KEY = "welltrackiqStudioSprint2Layout";
const APPROVED_KEY = "welltrackiq.studio.approvedLayouts";
const CANVAS = { w: 390, h: 844 };
const MIN = { w: 32, h: 24 };

const defaultLayout = {
  screen: "onboarding",
  layout: "default",
  components: [
    cmp("Image", 78, 28, 234, 64, { text: "Logo", radius: 16 }),
    cmp("Heading", 34, 114, 322, 86, { text: "Train Smarter.\nPlay Faster.", fontSize: 36 }),
    cmp("Text", 44, 222, 302, 34, { text: "Player Name", fontSize: 16 }),
    cmp("Input", 32, 264, 326, 56, { text: "Player name" }),
    cmp("Text", 44, 340, 302, 34, { text: "Position", fontSize: 16 }),
    cmp("SoccerPitch", 28, 384, 334, 292, { text: "Soccer Pitch" }),
    cmp("Button", 32, 708, 326, 72, { text: "Enter Academy" })
  ]
};

let layout = loadLayout();
let selectedId = layout.components[0]?.id || null;
let nudgeStep = 5;
let guides = true;

const preview = document.getElementById("phone-preview");
const previewLayer = document.getElementById("preview-layer");
const select = document.getElementById("component-select");
const status = document.getElementById("companion-status");
const safeArea = document.getElementById("safe-area");
const importBox = document.getElementById("layout-import");

render();
wireControls();
window.addEventListener("resize", render);
window.addEventListener("storage", event => {
  if (event.key !== STORAGE_KEY) return;
  layout = loadLayout();
  selectedId = layout.components[0]?.id || null;
  setStatus("Reloaded saved Studio layout");
  render();
});

function cmp(type, x, y, w, h, props = {}) {
  return {
    id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    x,
    y,
    w,
    h,
    visible: true,
    locked: false,
    text: type,
    font: "Inter",
    fontSize: type === "Heading" ? 34 : 16,
    align: "center",
    padding: 0,
    radius: type === "Button" ? 24 : 0,
    progress: 33,
    ...props
  };
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function serialize(input) {
  return JSON.parse(JSON.stringify({
    screen: input?.screen || "companion",
    layout: input?.layout || "default",
    components: Array.isArray(input?.components) ? input.components : []
  }));
}

function loadLayout() {
  return serialize(readJson(STORAGE_KEY, defaultLayout));
}

function saveLayout(message = "Saved on device") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(layout), null, 2));
  setStatus(message);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function bound(component, patch = {}) {
  const w = clamp(Math.round(patch.w ?? component.w), MIN.w, CANVAS.w);
  const h = clamp(Math.round(patch.h ?? component.h), MIN.h, CANVAS.h);
  const x = clamp(Math.round(patch.x ?? component.x), 0, CANVAS.w - w);
  const y = clamp(Math.round(patch.y ?? component.y), 0, CANVAS.h - h);
  return { x, y, w, h };
}

function setStatus(message) {
  status.textContent = message;
}

function scaleRatio() {
  return preview.clientWidth / CANVAS.w;
}

function render() {
  const scale = scaleRatio();
  previewLayer.innerHTML = "";
  safeArea.classList.toggle("is-visible", guides);

  layout.components.forEach(component => {
    if (component.visible === false) return;
    const item = document.createElement("button");
    item.type = "button";
    item.className = `preview-component ${component.id === selectedId ? "is-selected" : ""}`;
    item.dataset.componentId = component.id;
    item.style.left = `${component.x * scale}px`;
    item.style.top = `${component.y * scale}px`;
    item.style.width = `${component.w * scale}px`;
    item.style.height = `${component.h * scale}px`;
    item.style.borderRadius = `${(component.radius || 0) * scale}px`;
    item.style.padding = `${(component.padding || 0) * scale}px`;
    item.style.fontSize = `${Math.max(8, (component.fontSize || 14) * scale)}px`;
    item.style.textAlign = component.align || "center";
    item.addEventListener("click", () => {
      selectedId = component.id;
      setStatus(`Selected ${component.type}`);
      render();
    });

    item.appendChild(renderInner(component));
    previewLayer.appendChild(item);
  });

  renderSelect();
}

function renderInner(component) {
  const inner = document.createElement("div");
  inner.className = `preview-inner preview-${component.type.toLowerCase()}`;

  if (component.type === "SoccerPitch") {
    inner.className = "preview-inner preview-pitch";
    ["LW", "ST", "RW", "CM", "CB", "GK"].forEach(label => {
      const span = document.createElement("span");
      span.textContent = label;
      inner.appendChild(span);
    });
    return inner;
  }

  if (component.type === "ProgressCard") {
    inner.className = "preview-inner preview-progress";
    const label = document.createElement("b");
    label.textContent = component.text || "Progress";
    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("i");
    fill.className = "fill";
    fill.style.width = `${clamp(component.progress || 0, 0, 100)}%`;
    bar.appendChild(fill);
    inner.append(label, bar);
    return inner;
  }

  inner.textContent = component.text || component.type;
  return inner;
}

function renderSelect() {
  select.innerHTML = "";
  layout.components.forEach((component, index) => {
    const option = document.createElement("option");
    option.value = component.id;
    option.textContent = `${index + 1}. ${component.type} — ${component.text || component.id}`;
    option.selected = component.id === selectedId;
    select.appendChild(option);
  });
}

function selectedComponent() {
  return layout.components.find(component => component.id === selectedId) || null;
}

function patchSelected(patch) {
  const current = selectedComponent();
  if (!current) return;
  const box = bound(current, patch);
  layout = {
    ...layout,
    components: layout.components.map(component => component.id === current.id ? { ...component, ...box } : component)
  };
  saveLayout(`Nudged ${current.type}: x${box.x}, y${box.y}`);
  render();
}

function wireControls() {
  select.addEventListener("change", event => {
    selectedId = event.target.value;
    render();
  });

  document.querySelectorAll("[data-nudge]").forEach(button => {
    button.addEventListener("click", () => {
      const current = selectedComponent();
      if (!current) return;
      const direction = button.dataset.nudge;
      const delta = {
        up: { y: current.y - nudgeStep },
        down: { y: current.y + nudgeStep },
        left: { x: current.x - nudgeStep },
        right: { x: current.x + nudgeStep }
      }[direction];
      patchSelected(delta);
    });
  });

  document.querySelectorAll("[data-step]").forEach(button => {
    button.addEventListener("click", () => {
      nudgeStep = Number(button.dataset.step) || 5;
      document.querySelectorAll("[data-step]").forEach(item => item.classList.toggle("active", item === button));
      setStatus(`Nudge step: ${nudgeStep}px`);
    });
  });

  document.getElementById("toggle-guides").addEventListener("click", event => {
    guides = !guides;
    event.currentTarget.textContent = guides ? "Guides On" : "Guides Off";
    render();
  });

  document.getElementById("load-saved").addEventListener("click", () => {
    layout = loadLayout();
    selectedId = layout.components[0]?.id || null;
    setStatus("Reloaded saved layout");
    render();
  });

  document.getElementById("approve-device").addEventListener("click", () => {
    localStorage.setItem(APPROVED_KEY, JSON.stringify(serialize(layout), null, 2));
    setStatus("Approved on this device");
  });

  document.getElementById("reset-template").addEventListener("click", () => {
    layout = serialize(defaultLayout);
    selectedId = layout.components[0]?.id || null;
    saveLayout("Reset to companion template");
    render();
  });

  document.getElementById("import-json").addEventListener("click", () => {
    try {
      const data = JSON.parse(importBox.value || "{}");
      layout = serialize(data);
      selectedId = layout.components[0]?.id || null;
      saveLayout("Imported JSON layout");
      render();
    } catch (error) {
      console.error("[Companion import]", error);
      setStatus("Import failed — invalid JSON");
    }
  });

  document.getElementById("export-json").addEventListener("click", async () => {
    const json = JSON.stringify(serialize(layout), null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setStatus("Copied layout JSON");
    } catch {
      importBox.value = json;
      setStatus("JSON placed in import box");
    }
  });
}
