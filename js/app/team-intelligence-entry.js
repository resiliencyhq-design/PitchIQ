import { aggregateTeamEvidence, buildSquadSnapshot, createSessionPlan } from "../../src/team/team-intelligence.js";

const STORAGE_KEY = "pitchiq.team.players.v1";

function readPlayers() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function renderTeamIntelligence() {
  const home = document.querySelector("[data-screen='home'] .screen-content, #home .screen-content, .home-screen .screen-content");
  if (!home || home.querySelector("[data-team-intelligence-card]")) return;

  const players = buildSquadSnapshot(readPlayers());
  const evidence = aggregateTeamEvidence(players);
  const plan = createSessionPlan(players);
  const priority = evidence.priorities[0]?.label || "Evidence building";

  const card = document.createElement("section");
  card.className = "team-intelligence-card";
  card.dataset.teamIntelligenceCard = "true";
  card.innerHTML = `
    <div class="team-intelligence-card__eyebrow">Coach tools</div>
    <h2>Team Intelligence</h2>
    <p>Squad evidence without rankings or changes to individual Football IQ.</p>
    <div class="team-intelligence-card__metrics">
      <span><strong>${evidence.playerCount}</strong> players</span>
      <span><strong>${evidence.reassessmentReadyCount}</strong> reassessment ready</span>
    </div>
    <div class="team-intelligence-card__focus">
      <small>Current squad focus</small>
      <strong>${priority}</strong>
      <span>${plan.objective}</span>
    </div>
    <button type="button" data-open-team-intelligence>Open squad view</button>
  `;
  home.appendChild(card);

  card.querySelector("[data-open-team-intelligence]")?.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("pitchiq:team-intelligence-open", {
      detail: { players, evidence, sessionPlan: plan }
    }));
    card.classList.toggle("is-expanded");
  });
}

const observer = new MutationObserver(renderTeamIntelligence);
observer.observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener("DOMContentLoaded", renderTeamIntelligence, { once: true });
renderTeamIntelligence();
