const autoJugglerStyles = document.createElement("link");
autoJugglerStyles.rel = "stylesheet";
autoJugglerStyles.href = "css/auto-juggler.css?v=sprint-10-2-1-home-tile-restore-20260719";
document.head.appendChild(autoJugglerStyles);

const autoJugglerPreviewStyles = document.createElement("link");
autoJugglerPreviewStyles.rel = "stylesheet";
autoJugglerPreviewStyles.href = "css/auto-juggler-preview.css?v=sprint-10-2-1-home-tile-restore-20260719";
document.head.appendChild(autoJugglerPreviewStyles);

const footballIQResultsStyles = document.createElement("link");
footballIQResultsStyles.rel = "stylesheet";
footballIQResultsStyles.href = "css/football-iq-results.css?v=sprint-12-4b-player-development-20260719";
document.head.appendChild(footballIQResultsStyles);

const playerDevelopmentStyles = document.createElement("link");
playerDevelopmentStyles.rel = "stylesheet";
playerDevelopmentStyles.href = "css/player-development.css?v=sprint-12-4b-player-development-20260719";
document.head.appendChild(playerDevelopmentStyles);

const footballIQProgressStyles = document.createElement("link");
footballIQProgressStyles.rel = "stylesheet";
footballIQProgressStyles.href = "css/football-iq-progress.css?v=sprint-14-0-progress-20260719";
document.head.appendChild(footballIQProgressStyles);

const academySeasonStyles = document.createElement("link");
academySeasonStyles.rel = "stylesheet";
academySeasonStyles.href = "css/academy-season.css?v=sprint-15-0-academy-season-20260719";
document.head.appendChild(academySeasonStyles);

const coachDashboardStyles = document.createElement("link");
coachDashboardStyles.rel = "stylesheet";
coachDashboardStyles.href = "css/coach-dashboard.css?v=sprint-16-0-coach-dashboard-20260719";
document.head.appendChild(coachDashboardStyles);

const matchIntelligenceStyles = document.createElement("link");
matchIntelligenceStyles.rel = "stylesheet";
matchIntelligenceStyles.href = "css/match-intelligence.css?v=sprint-17-0-match-intelligence-20260719";
document.head.appendChild(matchIntelligenceStyles);

const aiCoachStyles = document.createElement("link");
aiCoachStyles.rel = "stylesheet";
aiCoachStyles.href = "css/ai-coach.css?v=sprint-12-6a-coach-identity-20260719";
document.head.appendChild(aiCoachStyles);

const preTrainingCoachBriefStyles = document.createElement("link");
preTrainingCoachBriefStyles.rel = "stylesheet";
preTrainingCoachBriefStyles.href = "css/pre-training-coach-brief.css?v=sprint-12-6b-pre-training-brief-20260719";
document.head.appendChild(preTrainingCoachBriefStyles);

const postTrainingCoachReflectionStyles = document.createElement("link");
postTrainingCoachReflectionStyles.rel = "stylesheet";
postTrainingCoachReflectionStyles.href = "css/post-training-coach-reflection.css?v=sprint-12-6c-post-training-reflection-20260719";
document.head.appendChild(postTrainingCoachReflectionStyles);

const teamIntelligenceStyles = document.createElement("link");
teamIntelligenceStyles.rel = "stylesheet";
teamIntelligenceStyles.href = "css/team-intelligence.css?v=sprint-19-0-team-intelligence-20260719";
document.head.appendChild(teamIntelligenceStyles);

const homeSprint103Styles = document.createElement("link");
homeSprint103Styles.rel = "stylesheet";
homeSprint103Styles.href = "css/home-sprint-10-3.css?v=sprint-10-3-1-home-simplification-20260719";
document.head.appendChild(homeSprint103Styles);

const homeAdaptiveRecommendationStyles = document.createElement("link");
homeAdaptiveRecommendationStyles.rel = "stylesheet";
homeAdaptiveRecommendationStyles.href = "css/home-adaptive-recommendation.css?v=sprint-12-5d-home-display-20260719";
document.head.appendChild(homeAdaptiveRecommendationStyles);

import("../lab/auto-juggler-camera.js?v=sprint-10-2-1-home-tile-restore-20260719").catch(error => { console.warn("[PitchIQ Lab] Auto Juggler ball detector failed to load", error); });
import("../lab/auto-juggler-home-entry.js?v=sprint-10-2-1-home-tile-restore-20260719").catch(error => { console.warn("[PitchIQ Lab] Auto Juggler Home tile failed to load", error); });
import("./football-iq-results-entry.js?v=sprint-12-4b-player-development-20260719").catch(error => { console.warn("[PitchIQ] Football IQ results and development experiences failed to load", error); });
import("./football-iq-progress-entry.js?v=sprint-14-0-progress-20260719").catch(error => { console.warn("[PitchIQ] Football IQ progress experience failed to load", error); });
import("./academy-season-entry.js?v=sprint-15-0-academy-season-20260719").catch(error => { console.warn("[PitchIQ] Academy Season experience failed to load", error); });
import("./coach-dashboard-entry.js?v=sprint-16-0-coach-dashboard-20260719").catch(error => { console.warn("[PitchIQ] Coach Dashboard experience failed to load", error); });
import("./match-intelligence-entry.js?v=sprint-17-0-match-intelligence-20260719").catch(error => { console.warn("[PitchIQ] Match Intelligence experience failed to load", error); });
import("./ai-coach-entry.js?v=sprint-12-6a-coach-identity-20260719").catch(error => { console.warn("[PitchIQ] AI Coach experience failed to load", error); });
import("./pre-training-coach-brief.js?v=sprint-12-6b-pre-training-brief-20260719").catch(error => { console.warn("[PitchIQ] Pre-training coach brief failed to load; Live Rep remains available", error); });
import("./post-training-coach-reflection.js?v=sprint-12-6c-post-training-reflection-20260719").catch(error => { console.warn("[PitchIQ] Post-training coach reflection failed to load; Results remain available", error); });
import("./team-intelligence-entry.js?v=sprint-19-0-team-intelligence-20260719").catch(error => { console.warn("[PitchIQ] Team Intelligence experience failed to load", error); });
import("./home-sprint-10-3.js?v=hotfix-home-load-loop-20260719").catch(error => { console.warn("[PitchIQ] Home Sprint 10.3.1 enhancements failed to load", error); });
import("./home-adaptive-recommendation.js?v=sprint-12-5d-home-display-20260719").catch(error => { console.warn("[PitchIQ] Home adaptive recommendation failed to load", error); });
import("./training-evidence-entry.js?v=sprint-13-0-evidence-loop-20260719").catch(error => { console.warn("[PitchIQ] Training evidence loop failed to load", error); });
// Registers a lightweight route listener only. The adaptive engine is loaded after the player explicitly enters Training.
import("./adaptive-training-entry.js?v=sprint-12-5b-training-screen-integration-20260719").catch(error => { console.warn("[PitchIQ] Adaptive training route integration failed to load", error); });

document.addEventListener("click", event => {
  const button = event.target.closest?.('[data-trial-route="home"]');
  if(!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", cleanUrl);
  window.location.reload();
}, true);