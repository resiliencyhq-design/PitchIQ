const STORAGE_KEY = "welltrackiqStudioSprint2Layout";
const TEMPLATE_KEY = "welltrackiq.studio.templates";
const OVERRIDE_KEY = "welltrackiq.studio.typographyOverrides";

const FONTS = ["Inter", "Oswald"];
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 32, 48];
const FONT_WEIGHTS = [300, 400, 500, 600, 700, 800];
const COLORS = [
  ["Primary Lime", "#D7FF2E"],
  ["Primary Green", "#31F79A"],
  ["White", "#F6FFF7"],
  ["Slate", "#A7B0AA"],
  ["Blue", "#8AB4FF"],
  ["Amber", "#FFC96B"],
  ["Red", "#FF8A8A"]
];
const ALIGNMENTS = ["left", "center", "right"];

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "") || fallback; }
  catch { return fallback; }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value, null, 2));
}

function overrides() {
  return readJson(OVERRIDE_KEY, {});
}

function saveOverrides(value) {
  writeJson(OVERRIDE_KEY, value);
}

function activeLayer() {
  return document.querySelector(".canvas-layer.selected[data-component-id]");
}

function activeId() {
  return activeLayer()?.dataset?.componentId || null;
}

function styleFor(id) {
  return overrides()[id] || {};
}

function selectedTextComponent() {
  const layer = activeLayer();
  if (!layer) return false;
  const content = layer.querySelector("h1,p,button,.input-mock,.studio-progress b,.studio-image span");
  return Boolean(content);
}

function applyLayerStyles() {
  const data = overrides();
  document.querySelectorAll(".canvas-layer[data-component-id]").forEach(layer => {
    const style = data[layer.dataset.componentId] || {};
    if (style.fontFamily) layer.style.fontFamily = style.fontFamily;
    if (style.fontSize) layer.style.fontSize = `${style.fontSize}px`;
    if (style.fontWeight) layer.style.fontWeight = String(style.fontWeight);
    if (style.textColor) layer.style.color = style.textColor;
    if (style.align) layer.style.textAlign = style.align;
    layer.style.fontStyle = style.italic ? "italic" : "normal";
  });
}

function mergeComponent(component) {
  const style = styleFor(component.id);
  if (!Object.keys(style).length) return component;
  return {
    ...component,
    font: style.fontFamily || component.font || "Inter",
    fontFamily: style.fontFamily || component.fontFamily || component.font || "Inter",
    fontSize: style.fontSize ?? component.fontSize,
    fontWeight: style.fontWeight ?? component.fontWeight,
    textColor: style.textColor || component.textColor,
    align: style.align || component.align,
    bold: !!style.bold,
    italic: !!style.italic,
    fontStyle: style.italic ? "italic" : component.fontStyle
  };
}

function mergeLayout(layout) {
  if (!layout || !Array.isArray(layout.components)) return layout;
  return { ...layout, components: layout.components.map(mergeComponent) };
}

function mergeTemplateStore(store) {
  if (!store || !Array.isArray(store.templates)) return store;
  return {
    ...store,
    templates: store.templates.map(template => ({
      ...template,
      data: mergeLayout(template.data)
    }))
  };
}

function patchPersistence() {
  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (key, value) => {
    try {
      if (key === STORAGE_KEY) value = JSON.stringify(mergeLayout(JSON.parse(value)), null, 2);
      if (key === TEMPLATE_KEY) value = JSON.stringify(mergeTemplateStore(JSON.parse(value)), null, 2);
    } catch {}
    return originalSetItem(key, value);
  };

  if (navigator.clipboard?.writeText) {
    const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = text => {
      try {
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.components)) text = JSON.stringify(mergeLayout(parsed), null, 2);
        if (parsed?.currentLayout) text = JSON.stringify({ ...parsed, currentLayout: mergeLayout(parsed.currentLayout) }, null, 2);
      } catch {}
      return originalWriteText(text);
    };
  }
}

function select(name, value, options, onChange) {
  const label = document.createElement("label");
  label.textContent = name;
  const input = document.createElement("select");
  options.forEach(option => {
    const opt = document.createElement("option");
    if (Array.isArray(option)) {
      opt.textContent = option[0];
      opt.value = option[1];
    } else {
      opt.textContent = option;
      opt.value = option;
    }
    input.appendChild(opt);
  });
  input.value = value;
  input.addEventListener("change", event => onChange(event.target.value));
  label.appendChild(input);
  return label;
}

function toggle(name, checked, onChange) {
  const label = document.createElement("label");
  label.className = "typography-toggle";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.addEventListener("change", event => onChange(event.target.checked));
  label.append(input, document.createTextNode(` ${name}`));
  return label;
}

function updateActive(patch) {
  const id = activeId();
  if (!id) return;
  const data = overrides();
  const next = { ...(data[id] || {}), ...patch };
  if (patch.bold === true) next.fontWeight = 700;
  if (patch.bold === false && next.fontWeight === 700) next.fontWeight = 400;
  data[id] = next;
  saveOverrides(data);
  applyLayerStyles();
  renderPanel();
}

function renderPanel() {
  const inspector = document.querySelector("aside.inspector");
  if (!inspector) return;
  inspector.querySelector(".typography-panel")?.remove();
  if (!selectedTextComponent()) return;

  const id = activeId();
  const layer = activeLayer();
  const style = {
    fontFamily: layer.style.fontFamily?.replaceAll('"', "") || styleFor(id).fontFamily || "Inter",
    fontSize: Number.parseInt(layer.style.fontSize, 10) || styleFor(id).fontSize || 16,
    fontWeight: Number.parseInt(layer.style.fontWeight, 10) || styleFor(id).fontWeight || 400,
    textColor: styleFor(id).textColor || "#F6FFF7",
    align: layer.style.textAlign || styleFor(id).align || "left",
    bold: !!styleFor(id).bold,
    italic: layer.style.fontStyle === "italic" || !!styleFor(id).italic
  };

  const panel = document.createElement("section");
  panel.className = "typography-panel";
  const title = document.createElement("h3");
  title.textContent = "Typography";
  panel.appendChild(title);
  panel.appendChild(select("Font Family", style.fontFamily, FONTS, fontFamily => updateActive({ fontFamily })));
  panel.appendChild(select("Font Size", String(style.fontSize), FONT_SIZES, fontSize => updateActive({ fontSize: Number(fontSize) })));
  panel.appendChild(select("Font Weight", String(style.fontWeight), FONT_WEIGHTS, fontWeight => updateActive({ fontWeight: Number(fontWeight), bold: Number(fontWeight) >= 700 })));
  panel.appendChild(select("Text Color", style.textColor, COLORS, textColor => updateActive({ textColor })));
  panel.appendChild(select("Alignment", style.align, ALIGNMENTS, align => updateActive({ align })));
  panel.appendChild(toggle("Bold", style.bold || style.fontWeight >= 700, bold => updateActive({ bold })));
  panel.appendChild(toggle("Italic", style.italic, italic => updateActive({ italic })));
  inspector.appendChild(panel);
}

function tick() {
  applyLayerStyles();
  renderPanel();
}

patchPersistence();
window.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(tick);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "data-component-id"] });
  tick();
});
