import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import "./studio.css";

const STORAGE_KEY = "pitchiqPuckStudioLayoutV1";

const templates = {
  blank: { content: [], root: {} },
  splash: {
    content: [
      { type: "Heading", props: { id: "Heading-1", text: "Train smarter.\nPlay faster.", size: "hero" } },
      { type: "Button", props: { id: "Button-1", label: "ENTER THE ACADEMY ->", variant: "primary" } },
      { type: "ImagePlaceholder", props: { id: "Image-1", label: "Academy Hero Panel", height: 250 } },
      { type: "Text", props: { id: "Text-1", text: "Develop scanning, decision speed and football IQ.", align: "center" } }
    ],
    root: {}
  },
  onboarding: {
    content: [
      { type: "ProgressCard", props: { id: "Progress-1", label: "Step 1 of 3", progress: 33 } },
      { type: "Heading", props: { id: "Heading-1", text: "Who is training?", size: "large" } },
      { type: "Card", props: { id: "Card-1", title: "Player name", body: "Input placeholder" } },
      { type: "Button", props: { id: "Button-1", label: "CONTINUE ->", variant: "primary" } }
    ],
    root: {}
  },
  home: {
    content: [
      { type: "Heading", props: { id: "Heading-1", text: "Today&apos;s Mission", size: "large" } },
      { type: "ProgressCard", props: { id: "Progress-1", label: "Level progress", progress: 72 } },
      { type: "Card", props: { id: "Card-1", title: "Vision Sprint", body: "Train scanning and decision speed." } },
      { type: "Card", props: { id: "Card-2", title: "Results", body: "Review your last session." } }
    ],
    root: {}
  },
  drill: {
    content: [
      { type: "Heading", props: { id: "Heading-1", text: "SCAN FIRST", size: "large" } },
      { type: "PitchSelectorPlaceholder", props: { id: "Pitch-1", title: "Pitch selector placeholder" } },
      { type: "Button", props: { id: "Button-1", label: "START REP ->", variant: "primary" } }
    ],
    root: {}
  }
};

const config = {
  components: {
    Heading: {
      fields: {
        text: { type: "textarea" },
        size: { type: "select", options: [
          { label: "Hero", value: "hero" },
          { label: "Large", value: "large" },
          { label: "Medium", value: "medium" }
        ] }
      },
      defaultProps: { text: "Heading", size: "large" },
      render: ({ text, size }) => <h1 className={`studio-heading ${size}`}>{String(text).split("\n").map((line, i) => <React.Fragment key={i}>{line}{i < String(text).split("\n").length - 1 && <br />}</React.Fragment>)}</h1>
    },
    Text: {
      fields: {
        text: { type: "textarea" },
        align: { type: "select", options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" }
        ] }
      },
      defaultProps: { text: "Text block", align: "left" },
      render: ({ text, align }) => <p className={`studio-text ${align}`}>{text}</p>
    },
    Button: {
      fields: {
        label: { type: "text" },
        variant: { type: "select", options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" }
        ] }
      },
      defaultProps: { label: "Button", variant: "primary" },
      render: ({ label, variant }) => <button className={`studio-button ${variant}`} type="button">{label}</button>
    },
    Card: {
      fields: {
        title: { type: "text" },
        body: { type: "textarea" }
      },
      defaultProps: { title: "Card", body: "Card body" },
      render: ({ title, body }) => <article className="studio-card"><b>{title}</b><span>{body}</span></article>
    },
    ImagePlaceholder: {
      fields: {
        label: { type: "text" },
        height: { type: "number" }
      },
      defaultProps: { label: "Image placeholder", height: 220 },
      render: ({ label, height }) => <div className="studio-image" style={{ minHeight: `${height || 220}px` }}><span>{label}</span></div>
    },
    PitchSelectorPlaceholder: {
      fields: { title: { type: "text" } },
      defaultProps: { title: "Pitch selector placeholder" },
      render: ({ title }) => <div className="studio-pitch"><span>{title}</span><i>ST</i><i>LW</i><i>CAM</i><i>RW</i><i>CM</i><i>CB</i><i>GK</i></div>
    },
    ProgressCard: {
      fields: {
        label: { type: "text" },
        progress: { type: "number" }
      },
      defaultProps: { label: "Progress", progress: 50 },
      render: ({ label, progress }) => <div className="studio-progress"><b>{label}</b><div><i style={{ width: `${Math.max(0, Math.min(100, progress || 0))}%` }} /></div><small>{progress || 0}%</small></div>
    }
  }
};

function loadSavedData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || ""); } catch { return templates.splash; }
}

function App() {
  const initialData = useMemo(() => loadSavedData() || templates.splash, []);
  const [data, setData] = useState(initialData);
  const [previewData, setPreviewData] = useState(initialData);
  const [message, setMessage] = useState("Studio sandbox only. Production MVP is untouched.");

  function saveLayout(nextData = data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData, null, 2));
    setPreviewData(nextData);
    setMessage("Saved layout JSON locally.");
  }

  function loadTemplate(name) {
    const next = templates[name] || templates.blank;
    setData(next);
    setPreviewData(next);
    setMessage(`${name} template loaded. Save to persist.`);
  }

  function exportJson() {
    navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
    setMessage("Layout JSON copied to clipboard if browser permissions allow.");
  }

  return (
    <main className="studio-shell">
      <header className="studio-topbar">
        <div>
          <strong>PitchIQ / WellTrackIQ Studio</strong>
          <span>{message}</span>
        </div>
        <nav>
          <button onClick={() => saveLayout(data)}>Save Layout</button>
          <button onClick={exportJson}>Export JSON</button>
          <a href="../index.html?dev">Open MVP</a>
        </nav>
      </header>
      <section className="studio-template-bar">
        {Object.keys(templates).map(name => <button key={name} onClick={() => loadTemplate(name)}>{name}</button>)}
      </section>
      <section className="studio-grid">
        <div className="studio-editor">
          <Puck config={config} data={data} onChange={setData} onPublish={saveLayout} />
        </div>
        <aside className="studio-preview-wrap">
          <h2>iPhone Preview</h2>
          <div className="studio-phone">
            <Puck.Render config={config} data={previewData} />
          </div>
          <details>
            <summary>Saved JSON Preview</summary>
            <pre>{JSON.stringify(previewData, null, 2)}</pre>
          </details>
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById("studio-root")).render(<App />);
