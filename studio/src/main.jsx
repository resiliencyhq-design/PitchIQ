import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./studio.css";

const STORAGE_KEY = "welltrackiqStudioSprint2Layout";
const CANVAS = { w: 390, h: 844 };

const componentDefaults = {
  Heading: { text: "Heading", fontSize: 34, align: "center", padding: 0, radius: 0 },
  Text: { text: "Text", fontSize: 16, align: "center", padding: 0, radius: 0 },
  Button: { text: "Button", fontSize: 24, align: "center", padding: 12, radius: 24 },
  Input: { text: "Player name", fontSize: 18, align: "left", padding: 14, radius: 18 },
  Image: { text: "Image", fontSize: 14, align: "center", padding: 12, radius: 24 },
  SoccerPitch: { text: "Soccer Pitch", fontSize: 14, align: "center", padding: 12, radius: 24, showBall: true, showPositions: true, theme: "neon", editable: true },
  Spacer: { text: "Spacer", fontSize: 12, align: "center", padding: 0, radius: 0 },
  ProgressCard: { text: "Step 1 of 3", fontSize: 14, align: "center", padding: 12, radius: 18, progress: 33 }
};

const templates = {
  Blank: { screen: "blank", layout: "blank", components: [] },
  Splash: { screen: "splash", layout: "default", components: [
    cmp("Heading", 30, 90, 330, 110, { text: "Train Smarter.\nPlay Faster.", fontSize: 42 }),
    cmp("Button", 32, 230, 326, 72, { text: "ENTER THE ACADEMY" }),
    cmp("Image", 32, 326, 326, 250, { text: "Hero Image" }),
    cmp("Text", 50, 604, 290, 72, { text: "Develop scanning, decision speed and football IQ." })
  ] },
  Onboarding: { screen: "onboarding", layout: "default", components: [
    cmp("Image", 78, 28, 234, 64, { text: "Logo", radius: 16 }),
    cmp("Heading", 34, 114, 322, 86, { text: "Train Smarter.\nPlay Faster.", fontSize: 36 }),
    cmp("Text", 44, 222, 302, 34, { text: "Player Name", fontSize: 16 }),
    cmp("Input", 32, 264, 326, 56, { text: "Player name" }),
    cmp("Text", 44, 340, 302, 34, { text: "Position", fontSize: 16 }),
    cmp("SoccerPitch", 28, 384, 334, 292, {}),
    cmp("Button", 32, 708, 326, 72, { text: "Enter Academy" })
  ] },
  Home: { screen: "home", layout: "default", components: [
    cmp("Heading", 28, 42, 334, 70, { text: "Today&apos;s Mission", fontSize: 34 }),
    cmp("ProgressCard", 28, 130, 334, 90, { text: "Level Progress", progress: 72 }),
    cmp("Button", 32, 690, 326, 72, { text: "Start Training" })
  ] },
  Drill: { screen: "drill", layout: "default", components: [
    cmp("Heading", 32, 56, 326, 72, { text: "SCAN FIRST", fontSize: 36 }),
    cmp("SoccerPitch", 28, 176, 334, 360, {}),
    cmp("Button", 32, 680, 326, 72, { text: "START REP" })
  ] },
  Dashboard: { screen: "dashboard", layout: "default", components: [
    cmp("Heading", 28, 40, 334, 70, { text: "Dashboard", fontSize: 34 }),
    cmp("ProgressCard", 28, 130, 334, 90, { text: "MVP Progress", progress: 78 }),
    cmp("Card", 28, 240, 334, 120, { text: "Review notes" })
  ] }
};

function cmp(type, x, y, w, h, props = {}) {
  return { id: `${type}-${Math.random().toString(36).slice(2, 8)}`, type, x, y, w, h, visible: true, locked: false, font: "Inter", ...componentDefaults[type], ...props };
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function loadSaved() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || ""); } catch { return templates.Onboarding; } }

function App() {
  const initial = useMemo(() => loadSaved() || templates.Onboarding, []);
  const [layout, setLayout] = useState(initial);
  const [selectedId, setSelectedId] = useState(initial.components[0]?.id || null);
  const [drag, setDrag] = useState(null);
  const selected = layout.components.find(c => c.id === selectedId);

  function updateComponent(id, patch) {
    setLayout(l => ({ ...l, components: l.components.map(c => c.id === id ? { ...c, ...patch } : c) }));
  }
  function addComponent(type) {
    const next = cmp(type, 40, 80, type === "SoccerPitch" ? 310 : 280, type === "Spacer" ? 36 : type === "Button" ? 68 : 90, {});
    setLayout(l => ({ ...l, components: [...l.components, next] }));
    setSelectedId(next.id);
  }
  function duplicate() {
    if (!selected) return;
    const next = { ...selected, id: `${selected.type}-${Math.random().toString(36).slice(2, 8)}`, x: clamp(selected.x + 16, 0, CANVAS.w - selected.w), y: clamp(selected.y + 16, 0, CANVAS.h - selected.h) };
    setLayout(l => ({ ...l, components: [...l.components, next] }));
    setSelectedId(next.id);
  }
  function remove() {
    if (!selected) return;
    setLayout(l => ({ ...l, components: l.components.filter(c => c.id !== selected.id) }));
    setSelectedId(null);
  }
  function loadTemplate(name) {
    const next = structuredClone(templates[name]);
    setLayout(next);
    setSelectedId(next.components[0]?.id || null);
  }
  function saveLayout() { localStorage.setItem(STORAGE_KEY, JSON.stringify(layout, null, 2)); }
  function saveTemplate() { localStorage.setItem(`${STORAGE_KEY}:${layout.screen}`, JSON.stringify(layout, null, 2)); }
  function exportJson() { navigator.clipboard?.writeText(JSON.stringify(layout, null, 2)); }
  function startMove(e, c, mode) {
    if (c.locked) return;
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setSelectedId(c.id);
    setDrag({ id: c.id, mode, sx: e.clientX, sy: e.clientY, x: c.x, y: c.y, w: c.w, h: c.h });
  }
  function move(e) {
    if (!drag) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    const snap = v => Math.round(v / 8) * 8;
    if (drag.mode === "move") updateComponent(drag.id, { x: snap(clamp(drag.x + dx, 0, CANVAS.w - drag.w)), y: snap(clamp(drag.y + dy, 0, CANVAS.h - drag.h)) });
    if (drag.mode === "resize") updateComponent(drag.id, { w: snap(clamp(drag.w + dx, 32, CANVAS.w - drag.x)), h: snap(clamp(drag.h + dy, 24, CANVAS.h - drag.y)) });
  }

  return <main className="studio-shell" onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
    <header className="studio-topbar"><div><strong>WellTrackIQ Studio — Onboarding Builder</strong><span>Studio only. PitchIQ MVP untouched.</span></div><nav><button onClick={saveLayout}>Save Layout</button><button onClick={saveTemplate}>Save Template</button><button onClick={exportJson}>Export JSON</button><a href="../index.html?dev">Open MVP</a></nav></header>
    <section className="studio-template-bar">{Object.keys(templates).map(t => <button key={t} onClick={() => loadTemplate(t)}>{t}</button>)}</section>
    <section className="builder-grid">
      <aside className="studio-palette"><h2>Components</h2>{["Heading","Text","Button","Input","Image","SoccerPitch","Spacer","ProgressCard"].map(t => <button key={t} onClick={() => addComponent(t)}>{t}</button>)}</aside>
      <section className="canvas-wrap"><div className="iphone-canvas"><div className="safe-area">SAFE AREA</div>{layout.components.filter(c => c.visible !== false).map(c => <Layer key={c.id} c={c} selected={c.id === selectedId} onSelect={() => setSelectedId(c.id)} onMove={e => startMove(e, c, "move")} onResize={e => startMove(e, c, "resize")} />)}</div></section>
      <Inspector selected={selected} update={patch => selected && updateComponent(selected.id, patch)} duplicate={duplicate} remove={remove} />
    </section>
    <section className="json-panel"><h2>Live JSON</h2><pre>{JSON.stringify(layout, null, 2)}</pre></section>
  </main>;
}

function Layer({ c, selected, onSelect, onMove, onResize }) {
  return <div className={`canvas-layer ${selected ? "selected" : ""} ${c.locked ? "locked" : ""}`} style={{ left: c.x, top: c.y, width: c.w, height: c.h, padding: c.padding, borderRadius: c.radius, textAlign: c.align, fontFamily: c.font, fontSize: c.fontSize }} onPointerDown={onSelect}>
    <button className="move-handle" onPointerDown={onMove}>move</button>
    <RenderComponent c={c} />
    <button className="resize-handle" onPointerDown={onResize}>↘</button>
  </div>;
}
function RenderComponent({ c }) {
  if (c.type === "Heading") return <h1>{c.text}</h1>;
  if (c.type === "Text") return <p>{c.text}</p>;
  if (c.type === "Button") return <button className="studio-button primary">{c.text}</button>;
  if (c.type === "Input") return <div className="input-mock">{c.text}</div>;
  if (c.type === "Image") return <div className="studio-image"><span>{c.text}</span></div>;
  if (c.type === "Spacer") return <div className="spacer-mock">{c.text}</div>;
  if (c.type === "ProgressCard") return <div className="studio-progress"><b>{c.text}</b><div><i style={{ width: `${clamp(c.progress || 0, 0, 100)}%` }} /></div></div>;
  if (c.type === "SoccerPitch") return <SoccerPitch c={c} />;
  return <div>{c.text}</div>;
}
function SoccerPitch({ c }) {
  const pos = ["ST","LW","CAM","RW","CM","CDM","LB","CB","RB","GK"];
  return <div className={`soccer-pitch ${c.theme || "neon"}`}>{c.showPositions && pos.map(p => <i key={p}>{p}</i>)}{c.showBall && <b>⚽</b>}</div>;
}
function Inspector({ selected, update, duplicate, remove }) {
  if (!selected) return <aside className="inspector"><h2>Inspector</h2><p>Select a component.</p></aside>;
  const input = (label, key, type = "text") => <label>{label}<input type={type} value={selected[key] ?? ""} onChange={e => update({ [key]: type === "number" ? Number(e.target.value) : e.target.value })} /></label>;
  return <aside className="inspector"><h2>Inspector</h2><b>{selected.type}</b>{input("Text", "text")}{input("X", "x", "number")}{input("Y", "y", "number")}{input("Width", "w", "number")}{input("Height", "h", "number")}{input("Font", "font")}{input("Font Size", "fontSize", "number")}{input("Padding", "padding", "number")}{input("Border Radius", "radius", "number")}<label>Alignment<select value={selected.align} onChange={e => update({ align: e.target.value })}><option>left</option><option>center</option><option>right</option></select></label><label><input type="checkbox" checked={selected.visible !== false} onChange={e => update({ visible: e.target.checked })} /> Visible</label><label><input type="checkbox" checked={!!selected.locked} onChange={e => update({ locked: e.target.checked })} /> Locked</label>{selected.type === "SoccerPitch" && <><label><input type="checkbox" checked={!!selected.showBall} onChange={e => update({ showBall: e.target.checked })} /> Show Ball</label><label><input type="checkbox" checked={!!selected.showPositions} onChange={e => update({ showPositions: e.target.checked })} /> Show Positions</label><label>Theme<select value={selected.theme || "neon"} onChange={e => update({ theme: e.target.value })}><option>neon</option><option>classic</option></select></label><label><input type="checkbox" checked={!!selected.editable} onChange={e => update({ editable: e.target.checked })} /> Editable</label></>}<div className="inspector-actions"><button onClick={duplicate}>Duplicate</button><button onClick={remove}>Delete</button></div></aside>;
}

createRoot(document.getElementById("studio-root")).render(<App />);
