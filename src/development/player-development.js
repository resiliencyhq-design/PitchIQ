import { getLatestFootballIQProfile } from "../profile/football-iq-storage.js";
import { getLatestCoachingIntelligence } from "../coaching/coaching-intelligence-storage.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Assessment date unavailable";
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function confidenceLabel(value) {
  return String(value || "building evidence")
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function renderEmptyState(profile) {
  const eligibleCount = profile?.evidenceStatus?.eligibleConstructs?.length || 0;
  return `<section class="screen app development-screen active" id="results"><div class="development-wrap">
    <header class="development-top"><button type="button" data-development-route="results">BACK</button><span>MY DEVELOPMENT</span></header>
    <section class="development-hero is-building">
      <span>PROFILE IN PROGRESS</span>
      <h1>Your next focus is still taking shape.</h1>
      <p>Complete more varied Football IQ challenges so your coaching guidance is based on strong evidence.</p>
      <div class="development-evidence"><b>${eligibleCount} of 5 dimensions ready</b><small>No development priority is shown until the evidence is reliable enough.</small></div>
    </section>
    <section class="development-panel"><span>WHAT TO DO NOW</span><h2>Keep showing how you think.</h2><p>Every new challenge helps PitchIQ understand your decisions more accurately.</p></section>
    <section class="development-closing"><h2>Keep building.</h2><p>Your Football IQ can grow through practice, reflection and better decisions.</p><button class="primary mega" data-route="home">BACK TO ACADEMY</button></section>
  </div></section>`;
}

function renderStrength(strength) {
  return `<article class="development-card strength-card">
    <span>MY STRENGTH</span>
    <h2>${escapeHtml(strength.label)}</h2>
    <p>${escapeHtml(strength.statement)}</p>
    <footer><b>${escapeHtml(confidenceLabel(strength.confidence))}</b><small>This is your strongest established area in the current evidence.</small></footer>
  </article>`;
}

function renderPriority(priority, index) {
  return `<article class="development-card priority-card">
    <span>${index === 0 ? "MY NEXT FOCUS" : "KEEP DEVELOPING"}</span>
    <h2>${escapeHtml(priority.label)}</h2>
    <p>${escapeHtml(priority.statement)}</p>
    <footer><b>${escapeHtml(confidenceLabel(priority.recommendationStrength))}</b><small>This is a trainable skill, not a fixed label.</small></footer>
  </article>`;
}

function renderFocusArea(area) {
  const label = area.label || (area.type === "match_transfer" ? "Game Transfer" : "Match Mentality");
  return `<li><span aria-hidden="true">→</span><div><b>${escapeHtml(label)}</b><p>${escapeHtml(area.statement)}</p></div></li>`;
}

export function renderPlayerDevelopment({ profile, coaching } = {}) {
  const resolvedProfile = profile === undefined ? getLatestFootballIQProfile() : profile;
  const resolvedCoaching = coaching === undefined
    ? getLatestCoachingIntelligence(resolvedProfile?.playerId)
    : coaching;

  if (!resolvedProfile || !resolvedCoaching || resolvedCoaching.evidenceStatus?.state !== "ready") {
    return renderEmptyState(resolvedProfile);
  }

  const strength = resolvedCoaching.strengths?.[0];
  const priorities = resolvedCoaching.priorities || [];
  const focusAreas = resolvedCoaching.focusAreas || [];
  const score = Number.isFinite(resolvedProfile.integratedFIQ?.score)
    ? resolvedProfile.integratedFIQ.score
    : "—";

  return `<section class="screen app development-screen active" id="results"><div class="development-wrap">
    <header class="development-top"><button type="button" data-development-route="results">BACK</button><span>MY DEVELOPMENT</span></header>
    <section class="development-hero">
      <span>YOUR FOOTBALL IQ IS GROWING</span>
      <h1>Build the player you can become.</h1>
      <div class="development-score" aria-label="Football IQ score ${score}">${score}</div>
      <p>Your profile shows what is working now and the next skills worth developing.</p>
      <div class="development-meta"><span>${escapeHtml(formatDate(resolvedProfile.assessmentDate))}</span><b>Profile v${escapeHtml(resolvedProfile.profileVersion || "1.0")}</b></div>
    </section>
    <section class="development-stack">
      ${strength ? renderStrength(strength) : ""}
      ${priorities.map(renderPriority).join("")}
    </section>
    <section class="development-panel training-focus">
      <span>RECOMMENDED TRAINING FOCUS</span>
      <h2>Train the thinking, not just the movement.</h2>
      <ul>${focusAreas.map(renderFocusArea).join("")}</ul>
    </section>
    <section class="development-panel evidence-panel"><span>WHY THIS CHANGES</span><h2>Every challenge adds evidence.</h2><p>Your guidance becomes more accurate as you complete different situations. Your strengths and priorities can change as you develop.</p></section>
    <section class="development-closing"><h2>Keep building.</h2><p>Great players develop their Football IQ one decision at a time.</p><button class="primary mega" data-route="home">BACK TO ACADEMY</button></section>
  </div></section>`;
}
