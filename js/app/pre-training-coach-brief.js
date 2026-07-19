import { AI_COACH_IDENTITY } from "../../src/coaching/ai-coach.js";

const ADAPTIVE_CURRENT_KEY = "pitchiq.adaptiveTraining.current.v1";
const bypassedButtons = new WeakSet();
let activeBrief = null;

const FOCUS_LABELS = Object.freeze({
  scanning: "Scanning",
  vision: "Vision",
  decision: "Decision making",
  reaction: "Reaction",
  dual: "Dual task",
  position: "Positioning"
});

const NOTICE_CUES = Object.freeze({
  scanning: "Before the ball arrives, check one option on each side.",
  vision: "Look away from the ball once and notice where the space is opening.",
  decision: "Notice your first two options, then choose one quickly.",
  reaction: "Stay ready for the next cue and respond with your first clear action.",
  dual: "Keep the main football action simple while noticing the second cue.",
  position: "Check your distance and angle before the next pass arrives."
});

function readSelection() {
  try {
    return JSON.parse(localStorage.getItem(ADAPTIVE_CURRENT_KEY));
  } catch {
    return null;
  }
}

export function buildPreTrainingBrief(selection) {
  const mission = selection?.mission || {};
  const focusId = mission.drillId || "scanning";
  const focus = FOCUS_LABELS[focusId] || "Football IQ";
  const personalised = selection?.mode === "personalised";

  return Object.freeze({
    coachName: AI_COACH_IDENTITY.name,
    coachRole: AI_COACH_IDENTITY.role,
    modeLabel: personalised ? "Your priority" : "Today’s focus",
    missionTitle: mission.title || "Scan First",
    explanation: personalised
      ? `Your current Football IQ evidence suggests ${focus.toLowerCase()} is a useful focus today.`
      : `Today we’re building more evidence around ${focus.toLowerCase()}.`,
    noticeCue: NOTICE_CUES[focusId] || "Notice one useful option before your next action.",
    personalised
  });
}

function continueToLiveRep(button) {
  if (!button) return;
  bypassedButtons.add(button);
  button.click();
}

function removeBrief() {
  activeBrief?.remove();
  activeBrief = null;
}

export function showPreTrainingCoachBrief(button, selection = readSelection()) {
  removeBrief();
  const brief = buildPreTrainingBrief(selection);
  const overlay = document.createElement("div");
  overlay.className = "pre-training-coach-brief";
  overlay.dataset.preTrainingCoachBrief = "true";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "preTrainingCoachBriefTitle");
  overlay.innerHTML = `
    <section class="pre-training-coach-brief__card">
      <p class="pre-training-coach-brief__coach">${brief.coachName}</p>
      <p class="pre-training-coach-brief__role">${brief.coachRole}</p>
      <p class="pre-training-coach-brief__mode">${brief.modeLabel}</p>
      <h2 id="preTrainingCoachBriefTitle">${brief.missionTitle}</h2>
      <p class="pre-training-coach-brief__explanation">${brief.explanation}</p>
      <div class="pre-training-coach-brief__notice">
        <span>Notice this</span>
        <strong>${brief.noticeCue}</strong>
      </div>
      <button class="pre-training-coach-brief__start" type="button" data-coach-brief-start>Start Live Rep →</button>
      <button class="pre-training-coach-brief__skip" type="button" data-coach-brief-skip>Skip brief</button>
    </section>
  `;

  const proceed = () => {
    removeBrief();
    continueToLiveRep(button);
  };
  overlay.querySelector("[data-coach-brief-start]")?.addEventListener("click", proceed, { once: true });
  overlay.querySelector("[data-coach-brief-skip]")?.addEventListener("click", proceed, { once: true });
  document.body.appendChild(overlay);
  activeBrief = overlay;
  overlay.querySelector("[data-coach-brief-start]")?.focus();
  return overlay;
}

if (typeof document !== "undefined") {
  document.addEventListener("click", event => {
    const button = event.target.closest?.('[data-action="start-mission-training"]');
    if (!button) return;
    if (bypassedButtons.has(button)) {
      bypassedButtons.delete(button);
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    showPreTrainingCoachBrief(button);
  }, true);
}
