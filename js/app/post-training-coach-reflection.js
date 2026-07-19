import { AI_COACH_IDENTITY } from "../../src/coaching/ai-coach.js";

const ADAPTIVE_CURRENT_KEY = "pitchiq.adaptiveTraining.current.v1";
const REFLECTION_CURRENT_KEY = "pitchiq.coachReflection.current.v1";
const REFLECTION_HISTORY_KEY = "pitchiq.coachReflection.history.v1";
const MAX_HISTORY = 20;
let activeReflection = null;

const OPTIONS = Object.freeze([
  { id: "noticed", label: "I noticed it", response: "Great. Hold onto what you noticed and look for it again next time." },
  { id: "sometimes", label: "Sometimes", response: "That is useful evidence. Keep the same cue and give yourself another chance to spot it." },
  { id: "learning", label: "Still learning", response: "That is completely fine. One clear attempt is enough to keep building from." }
]);

function readSelection() { try { return JSON.parse(localStorage.getItem(ADAPTIVE_CURRENT_KEY) || "null"); } catch { return null; } }
function readHistory() { try { const value = JSON.parse(localStorage.getItem(REFLECTION_HISTORY_KEY) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } }

export function buildPostTrainingReflection(selection = readSelection()) {
  const mission = selection?.mission || {};
  return Object.freeze({ coachName: AI_COACH_IDENTITY.name, coachRole: AI_COACH_IDENTITY.role, missionId: mission.id || null, missionTitle: mission.title || "today’s mission", prompt: `During ${mission.title || "that mission"}, how often did you notice the coaching cue?`, options: OPTIONS });
}

export function saveCoachReflection({ selection = readSelection(), responseId = "skipped" } = {}) {
  const mission = selection?.mission || {};
  const record = Object.freeze({ id: `reflection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, missionId: mission.id || null, missionTitle: mission.title || null, focusId: mission.drillId || null, responseId, createdAt: new Date().toISOString(), assessmentImpact: false, xpImpact: false });
  try { localStorage.setItem(REFLECTION_CURRENT_KEY, JSON.stringify(record)); localStorage.setItem(REFLECTION_HISTORY_KEY, JSON.stringify([...readHistory(), record].slice(-MAX_HISTORY))); window.dispatchEvent(new CustomEvent("pitchiq:coach-reflection", { detail: record })); } catch (error) { console.warn("[PitchIQ Coach] Reflection could not be stored", error); }
  return record;
}

function closeReflection() { activeReflection?.remove(); activeReflection = null; }

export function showPostTrainingCoachReflection(selection = readSelection()) {
  closeReflection();
  const model = buildPostTrainingReflection(selection);
  const overlay = document.createElement("div");
  overlay.className = "post-training-coach-reflection";
  overlay.dataset.postTrainingCoachReflection = "true";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "postTrainingCoachReflectionTitle");
  overlay.innerHTML = `<section class="post-training-coach-reflection__card"><p class="post-training-coach-reflection__coach">${model.coachName}</p><p class="post-training-coach-reflection__role">${model.coachRole}</p><p class="post-training-coach-reflection__kicker">Quick reflection</p><h2 id="postTrainingCoachReflectionTitle">${model.missionTitle}</h2><p class="post-training-coach-reflection__prompt">${model.prompt}</p><div class="post-training-coach-reflection__options">${model.options.map(option => `<button type="button" data-reflection-response="${option.id}">${option.label}</button>`).join("")}</div><p class="post-training-coach-reflection__response" data-reflection-coach-response hidden></p><button class="post-training-coach-reflection__continue" type="button" data-reflection-continue hidden>Continue →</button><button class="post-training-coach-reflection__skip" type="button" data-reflection-skip>Skip reflection</button><small>This reflection supports coaching context only. It does not change Football IQ scores or XP.</small></section>`;
  const responseText = overlay.querySelector("[data-reflection-coach-response]");
  const continueButton = overlay.querySelector("[data-reflection-continue]");
  overlay.querySelectorAll("[data-reflection-response]").forEach(button => button.addEventListener("click", () => {
    const option = OPTIONS.find(item => item.id === button.dataset.reflectionResponse);
    saveCoachReflection({ selection, responseId: option?.id || "learning" });
    overlay.querySelectorAll("[data-reflection-response]").forEach(item => { item.disabled = true; });
    if (responseText) { responseText.textContent = option?.response || OPTIONS[2].response; responseText.hidden = false; }
    if (continueButton) { continueButton.hidden = false; continueButton.focus(); }
    overlay.querySelector("[data-reflection-skip]")?.remove();
  }, { once: true }));
  continueButton?.addEventListener("click", closeReflection, { once: true });
  overlay.querySelector("[data-reflection-skip]")?.addEventListener("click", () => { saveCoachReflection({ selection, responseId: "skipped" }); closeReflection(); }, { once: true });
  document.body.appendChild(overlay); activeReflection = overlay; overlay.querySelector("[data-reflection-response]")?.focus(); return overlay;
}

if (typeof document !== "undefined") document.addEventListener("click", event => { const action = event.target.closest?.("[data-action]")?.dataset.action; if (action === "finish-live-session") setTimeout(() => showPostTrainingCoachReflection(), 0); }, true);
