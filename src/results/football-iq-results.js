import { getLatestFootballIQProfile } from "../profile/football-iq-storage.js";
import { loadState, normalizeState } from "../../js/services/storage.js";
import { xpNeed, rewardProgressXp } from "../../js/game/progression.js";
import { REWARDS } from "../../js/data/rewards.js";

const CONSTRUCTS = [
  ["awareness", "Awareness", "Notice the important information around you before the ball arrives."],
  ["gameReading", "Game Reading", "Recognise what is happening and predict what may happen next."],
  ["decisionQuality", "Decision Quality", "Choose an effective option for the situation in front of you."],
  ["adaptability", "Adaptability", "Adjust when pressure, space or the game situation changes."],
  ["useOfSpace", "Use of Space", "Find, create and protect useful space for yourself and teammates."],
];

const CONFIDENCE_COPY = {
  emerging_evidence: "Emerging evidence",
  developing_confidence: "Developing confidence",
  strong_confidence: "Strong confidence",
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function confidenceLabel(value) {
  return CONFIDENCE_COPY[value] || "More evidence needed";
}

function completedTrainingSeconds(state) {
  return (state.analytics?.sessions || []).reduce(
    (total, session) => total + (session.durationSeconds || 45),
    0,
  );
}

function trainingStats(state) {
  const sessions = state.analytics?.sessions || [];
  const attempts = sessions.reduce(
    (total, session) => total + (Array.isArray(session.results) ? session.results.length : 0),
    0,
  );
  const correct = sessions.reduce(
    (total, session) => total + (Array.isArray(session.results)
      ? session.results.filter(result => result.correct).length
      : 0),
    0,
  );
  const savedResult = state.game?.lastResult;
  const accuracy = attempts
    ? Math.round((correct / attempts) * 100)
    : (savedResult?.attempts ? savedResult.accuracy : null);
  const reaction = Number.isFinite(state.analytics?.bestReaction)
    ? `${(state.analytics.bestReaction / 1000).toFixed(2)}s`
    : "—";

  return {
    accuracy: Number.isFinite(accuracy) ? `${accuracy}%` : "—",
    reaction,
    combo: state.game?.bestCombo ? `x${state.game.bestCombo}` : "—",
    xpEarned: state.game?.lastXp || 0,
    level: state.game?.level || 1,
    xp: state.game?.xp || 0,
    timeMinutes: Math.floor(Math.max(state.game?.trainingSeconds || 0, completedTrainingSeconds(state)) / 60),
  };
}

function constructEntries(profile) {
  return CONSTRUCTS.map(([id, label, explanation]) => {
    const construct = profile?.constructs?.[id];
    const eligible = Boolean(construct?.eligible && Number.isFinite(construct?.score));
    return {
      id,
      label,
      explanation,
      eligible,
      score: eligible ? construct.score : null,
      confidence: eligible ? confidenceLabel(construct.confidence) : "Building evidence",
    };
  });
}

function coachCopy(profile) {
  const eligible = constructEntries(profile).filter(item => item.eligible).sort((a, b) => b.score - a.score);
  const strengths = eligible.slice(0, 2);
  const focus = eligible.length ? eligible.at(-1) : null;

  return {
    strengths: strengths.length
      ? strengths.map(item => `Strong ${item.label.toLowerCase()} today.`)
      : ["Keep completing challenges to build a clearer picture of your game."],
    focus: focus
      ? `Keep building ${focus.label.toLowerCase()} in your next session.`
      : "Complete another varied challenge to unlock your next focus.",
  };
}

function renderCoachCard(profile) {
  const coach = coachCopy(profile);
  return `<article class="r1-card r1-coach-card">
    <header><span>COACH SAYS</span><b aria-hidden="true">“</b></header>
    <div class="r1-coach-points">
      ${coach.strengths.map(point => `<p><span aria-hidden="true">✓</span>${escapeHtml(point)}</p>`).join("")}
      <p class="is-focus"><span aria-hidden="true">→</span>${escapeHtml(coach.focus)}</p>
    </div>
    <strong>Keep it up, smart player.</strong>
  </article>`;
}

function renderKeyStats(stats) {
  const items = [
    ["Accuracy", stats.accuracy, "◎"],
    ["Reaction", stats.reaction, "ϟ"],
    ["Combo", stats.combo, "⌁"],
    ["XP Earned", stats.xpEarned, "XP"],
  ];

  return `<article class="r1-card r1-stats-card"><h2>KEY STATS</h2><div class="r1-stats-grid">
    ${items.map(([label, value, icon]) => `<div><span aria-hidden="true">${icon}</span><small>${label}</small><b>${escapeHtml(value)}</b></div>`).join("")}
  </div></article>`;
}

function renderSkillDevelopment(profile) {
  const entries = constructEntries(profile);
  return `<article class="r1-card r1-skills-card"><h2>SKILL DEVELOPMENT</h2><div class="r1-skill-list">
    ${entries.map(item => `<div class="${item.eligible ? "is-ready" : "is-building"}"><span>${escapeHtml(item.label)}</span><b>${item.eligible ? item.score : "—"}</b><small>${escapeHtml(item.confidence)}</small></div>`).join("")}
  </div></article>`;
}

function renderProgress(stats) {
  const need = xpNeed(stats.level);
  const progress = Math.min(100, Math.round((stats.xp / Math.max(1, need)) * 100));
  const remaining = Math.max(0, need - stats.xp);
  return `<article class="r1-card r1-progress-card">
    <div class="r1-level-badge" aria-label="Level ${stats.level}">${stats.level}</div>
    <div class="r1-progress-copy"><header><h2>LEVEL ${stats.level}</h2><b>${stats.xp} / ${need} XP</b></header><div class="r1-xpbar"><i style="width:${progress}%"></i></div><small>★ ${remaining} XP to reach Level ${stats.level + 1}</small></div>
  </article>`;
}

function renderNextUnlock(state) {
  const earnedXp = rewardProgressXp(state);
  const reward = REWARDS
    .filter(item => !state.game.unlocked.includes(item.id))
    .sort((a, b) => a.unlockXp - b.unlockXp)
    .find(item => item.unlockXp > earnedXp) || null;

  if (!reward) {
    return `<article class="r1-card r1-unlock-card"><div><span>NEXT UNLOCK</span><h2>More rewards coming</h2><p>Keep training to build your collection.</p></div></article>`;
  }

  return `<article class="r1-card r1-unlock-card">
    <img src="${escapeHtml(reward.art)}" alt="" loading="lazy">
    <div><span>NEXT UNLOCK</span><h2>${escapeHtml(reward.name)}</h2><p>${Math.max(0, reward.unlockXp - earnedXp)} XP remaining</p></div>
  </article>`;
}

function previousEligibleScore(profile) {
  const candidates = [
    profile?.previousIntegratedFIQ?.score,
    profile?.previousScore,
    profile?.comparison?.previousScore,
    profile?.history?.at?.(-2)?.integratedFIQ?.score,
    profile?.history?.at?.(-2)?.score,
  ];
  return candidates.find(Number.isFinite) ?? null;
}

function heroMessage(score, previousScore, complete) {
  if (!complete) {
    return {
      heading: "Your profile is building",
      tone: "building",
      comparison: null,
    };
  }

  const delta = Number.isFinite(previousScore) ? Math.round(score - previousScore) : null;
  if (Number.isFinite(delta) && delta >= 4) {
    return { heading: "Excellent Progress!", tone: "improved", comparison: `+${delta} vs last result` };
  }
  if (Number.isFinite(delta) && delta <= -4) {
    return { heading: "Good Work Today", tone: "reset", comparison: `${delta} vs last result` };
  }
  if (score >= 85) return { heading: "Outstanding Session!", tone: "elite", comparison: delta ? `${delta > 0 ? "+" : ""}${delta} vs last result` : null };
  if (score >= 70) return { heading: "Great Session!", tone: "strong", comparison: delta ? `${delta > 0 ? "+" : ""}${delta} vs last result` : null };
  return { heading: "Solid Session!", tone: "steady", comparison: delta ? `${delta > 0 ? "+" : ""}${delta} vs last result` : null };
}

function renderHero(profile, complete, score, eligibleCount, playerName) {
  const safeName = String(playerName || "").trim();
  const label = safeName ? `WELL DONE, ${safeName.toUpperCase()}!` : "WELL DONE!";
  const previousScore = previousEligibleScore(profile);
  const hero = heroMessage(score, previousScore, complete);
  const status = complete ? "Football IQ score unlocked" : `${eligibleCount} of 5 dimensions ready`;
  const scoreAttributes = complete ? `data-score-target="${score}" data-score-animate="true"` : "";

  return `<section class="r1-results-hero r2-results-hero is-${hero.tone} ${complete ? "is-complete" : "is-building"}">
    <span>${escapeHtml(label)}</span>
    <h1>${escapeHtml(hero.heading)}</h1>
    <div class="r1-score-block r2-score-block"><small>FOOTBALL IQ</small><strong ${scoreAttributes}>${complete ? score : "—"}</strong><b>/100</b></div>
    <div class="r2-hero-status"><p>${escapeHtml(status)}</p>${hero.comparison ? `<span class="r2-comparison-badge">${escapeHtml(hero.comparison)}</span>` : ""}</div>
  </section>`;
}

function renderResultsShell(profile) {
  const state = normalizeState(loadState());
  const complete = profile?.evidenceStatus?.state === "complete" && Number.isFinite(profile?.integratedFIQ?.score);
  const score = complete ? profile.integratedFIQ.score : "—";
  const eligibleCount = profile?.evidenceStatus?.eligibleConstructs?.length || 0;
  const stats = trainingStats(state);

  return `<section class="screen app fiq-results r1-results r2-results active" id="results"><div class="r1-results-wrap">
    <header class="r1-results-top"><button type="button" data-route="home" aria-label="Back to Home">←</button><span>RESULTS</span><i aria-hidden="true"></i></header>
    ${renderHero(profile, complete, score, eligibleCount, state.profile?.name || "")}
    ${renderCoachCard(profile)}
    ${renderKeyStats(stats)}
    ${renderSkillDevelopment(profile)}
    ${renderProgress(stats)}
    ${renderNextUnlock(state)}
    <section class="r1-results-actions"><button class="primary mega" data-development-route="open">MY DEVELOPMENT</button><button class="ghost" data-route="home">BACK TO ACADEMY</button></section>
  </div></section>`;
}

export function renderFootballIQResults({ profile } = {}) {
  const resolvedProfile = profile === undefined ? getLatestFootballIQProfile() : profile;
  return renderResultsShell(resolvedProfile || null);
}
