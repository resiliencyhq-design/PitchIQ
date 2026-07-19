import { getLatestFootballIQProfile } from "../profile/football-iq-storage.js";

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

const CHALLENGE_COPY = {
  transfers_strongly: ["Strong transfer", "Your thinking stayed effective when the challenge became more game-like."],
  transfers_inconsistently: ["Developing transfer", "Some of your strengths carried into pressure. More practice can make them more consistent."],
  more_evidence_needed: ["More evidence needed", "Complete more Match Challenges to build a clearer picture of transfer."],
};

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
  return CONFIDENCE_COPY[value] || "More evidence needed";
}

function renderConstructCard([id, label, explanation], profile) {
  const construct = profile?.constructs?.[id];
  const eligible = Boolean(construct?.eligible && Number.isFinite(construct?.score));
  const status = eligible ? confidenceLabel(construct.confidence) : "Building evidence";
  const score = eligible ? construct.score : "—";

  return `<article class="fiq-dimension-card${eligible ? " is-eligible" : " is-building"}">
    <header><span>${escapeHtml(label)}</span><b>${score}</b></header>
    <p>${escapeHtml(explanation)}</p>
    <footer><span>${escapeHtml(status)}</span><small>${eligible ? "Current evidence supports this score." : "Complete more varied challenges to unlock this score."}</small></footer>
  </article>`;
}

function mentalityDimensions(profile) {
  const dimensions = profile?.matchMentality?.dimensions;
  if (!dimensions || typeof dimensions !== "object") return [];
  return Object.entries(dimensions).map(([id, value]) => ({
    id,
    label: id.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()),
    band: value?.band || "emerging",
  }));
}

function bandLabel(value) {
  return String(value || "emerging")
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function renderMentality(profile) {
  const dimensions = mentalityDimensions(profile);
  if (!dimensions.length) {
    return `<article class="fiq-insight-card"><span>Match Mentality</span><h2>Still building</h2><p>Keep completing challenges. Your response to mistakes and pressure will help build this part of your profile.</p></article>`;
  }

  return `<article class="fiq-insight-card"><span>Match Mentality</span><h2>Skills under pressure</h2><p>These are behaviours you can strengthen through practice.</p><div class="fiq-mentality-grid">${dimensions.map((dimension) => `<div><b>${escapeHtml(dimension.label)}</b><small>${escapeHtml(bandLabel(dimension.band))}</small></div>`).join("")}</div></article>`;
}

function renderMatchChallenge(profile) {
  const indicator = profile?.matchChallenge?.indicator || "more_evidence_needed";
  const [title, text] = CHALLENGE_COPY[indicator] || CHALLENGE_COPY.more_evidence_needed;
  return `<article class="fiq-insight-card"><span>Match Challenge</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></article>`;
}

function renderEmptyState() {
  return `<section class="screen app fiq-results active" id="results"><div class="fiq-results-wrap">
    <header class="fiq-results-top"><button type="button" data-route="home">BACK</button><span>FOOTBALL IQ PROFILE</span></header>
    <section class="fiq-hero fiq-hero-empty"><span>YOUR PROFILE IS STARTING</span><h1>More evidence needed</h1><p>Complete Football IQ assessments to build an accurate picture of how you see, read and solve the game.</p><div class="fiq-evidence-progress"><b>0 of 5 dimensions ready</b><small>No score is shown until the evidence is strong enough.</small></div></section>
    <section class="fiq-dimensions"><header><span>Five Football IQ dimensions</span><h2>Every area can be developed.</h2></header>${CONSTRUCTS.map((construct) => renderConstructCard(construct, null)).join("")}</section>
    <section class="fiq-closing"><h2>This is your starting point.</h2><p>Every challenge helps build a clearer picture of your Football IQ.</p><button class="primary mega" data-route="home">BACK TO ACADEMY</button></section>
  </div></section>`;
}

export function renderFootballIQResults({ profile } = {}) {
  const resolvedProfile = profile === undefined ? getLatestFootballIQProfile() : profile;
  if (!resolvedProfile) return renderEmptyState();

  const complete = resolvedProfile.evidenceStatus?.state === "complete" && Number.isFinite(resolvedProfile.integratedFIQ?.score);
  const eligibleCount = resolvedProfile.evidenceStatus?.eligibleConstructs?.length || 0;
  const score = complete ? resolvedProfile.integratedFIQ.score : "—";
  const heroTitle = complete ? "Your Football IQ" : "Your profile is building";
  const heroMessage = complete
    ? "This score combines evidence from all five Football IQ dimensions."
    : "Complete more varied challenges before an overall score is shown.";

  return `<section class="screen app fiq-results active" id="results"><div class="fiq-results-wrap">
    <header class="fiq-results-top"><button type="button" data-route="home">BACK</button><span>FOOTBALL IQ PROFILE</span></header>
    <section class="fiq-hero${complete ? " is-complete" : " is-building"}">
      <span>${complete ? "PROFILE UNLOCKED" : "PROFILE IN PROGRESS"}</span>
      <h1>${escapeHtml(heroTitle)}</h1>
      <div class="fiq-score" aria-label="${complete ? `Football IQ score ${score}` : "Football IQ score not yet available"}">${score}</div>
      <p>${escapeHtml(heroMessage)}</p>
      <div class="fiq-hero-meta"><span>${escapeHtml(formatDate(resolvedProfile.assessmentDate))}</span><b>${eligibleCount} of 5 dimensions ready</b></div>
    </section>
    <section class="fiq-dimensions"><header><span>Your five dimensions</span><h2>You’re building a clearer picture of your game.</h2></header>${CONSTRUCTS.map((construct) => renderConstructCard(construct, resolvedProfile)).join("")}</section>
    <section class="fiq-insights">${renderMentality(resolvedProfile)}${renderMatchChallenge(resolvedProfile)}</section>
    <section class="fiq-closing"><h2>Turn insight into development.</h2><p>See your strongest area and the next skills worth building.</p><button class="primary mega" data-development-route="open">MY DEVELOPMENT</button><button class="primary mega" data-route="home">BACK TO ACADEMY</button></section>
  </div></section>`;
}
