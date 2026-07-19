import {
  AI_COACH_IDENTITY,
  buildAICoachGuardrails,
  buildAICoachRecommendation
} from "../../src/coaching/ai-coach.js";

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
  card.dataset.aiCoachIdentity = AI_COACH_IDENTITY.id;
  card.dataset.aiCoachMode = recommendation.personalised ? "personalised" : "evidence-building";
  card.setAttribute("aria-label", `${AI_COACH_IDENTITY.name} recommendation`);
  card.innerHTML = `
    <div class="ai-coach-card__identity" aria-hidden="true">
      <span class="ai-coach-card__mark">IQ</span>
      <div>
        <p class="ai-coach-card__eyebrow">${AI_COACH_IDENTITY.name}</p>
        <small>${AI_COACH_IDENTITY.role}</small>
      </div>
    </div>
    <p class="ai-coach-card__mode">${recommendation.personalised ? "Your priority" : "Evidence-building focus"}</p>
    <h2>${recommendation.title}</h2>
    <p>${recommendation.message}</p>
    <p class="ai-coach-card__encouragement">${recommendation.encouragement}</p>
    <strong>${recommendation.nextAction}</strong>
    <small class="ai-coach-card__evidence-note">${recommendation.evidenceNote}</small>
    <small>Recommendation only. Football IQ changes only after formal reassessment.</small>
  `;
  home.appendChild(card);
  window.PitchIQAICoach = {
    identity: AI_COACH_IDENTITY,
    recommendation,
    guardrails: buildAICoachGuardrails()
  };
}

const observer = new MutationObserver(render);
observer.observe(document.documentElement, { childList: true, subtree: true });
render();
