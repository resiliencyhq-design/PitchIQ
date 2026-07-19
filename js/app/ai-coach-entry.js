import { buildAICoachGuardrails, buildAICoachRecommendation } from "../../src/coaching/ai-coach.js";

const STORAGE_KEYS = {
  results: "pitchiq.footballIQ.latestResult",
  match: "pitchiq.match.latestEvidence",
  season: "pitchiq.academySeason.weeklyPlan",
  readiness: "pitchiq.assessmentReadiness"
};

function readJSON(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function render() {
  const home = document.querySelector("[data-home-screen], .home-screen, #homeScreen");
  if (!home || home.querySelector("[data-ai-coach-card]")) return;

  const result = readJSON(STORAGE_KEYS.results, {});
  const match = readJSON(STORAGE_KEYS.match, {});
  const weeklyPlan = readJSON(STORAGE_KEYS.season, {});
  const readiness = readJSON(STORAGE_KEYS.readiness, {});
  const recommendation = buildAICoachRecommendation({
    footballIQScores: result.constructScores || result.scores,
    formalPriority: result.developmentPriority,
    latestMatchEvidence: match,
    weeklyPlan,
    readinessScore: readiness.score,
    evidenceCount: readiness.evidenceCount
  });

  const card = document.createElement("section");
  card.className = "ai-coach-card";
  card.dataset.aiCoachCard = "true";
  card.innerHTML = `
    <p class="ai-coach-card__eyebrow">AI Coach</p>
    <h2>${recommendation.title}</h2>
    <p>${recommendation.message}</p>
    <strong>${recommendation.nextAction}</strong>
    <small>Recommendation only. Football IQ changes only after formal reassessment.</small>
  `;
  home.appendChild(card);
  window.PitchIQAICoach = { recommendation, guardrails: buildAICoachGuardrails() };
}

const observer = new MutationObserver(render);
observer.observe(document.documentElement, { childList: true, subtree: true });
render();
