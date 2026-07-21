const HOME_SELECTOR = "#home";
const STATS_SELECTOR = ".home-training-snapshot";

function textFromStat(card, label) {
  const item = [...card.querySelectorAll(".training-stats-grid > div")]
    .find(node => node.querySelector("small")?.textContent?.trim().toLowerCase() === label.toLowerCase());
  return item?.querySelector("b")?.textContent?.trim() || "--";
}

function heroXpContext(home) {
  const progress = home.querySelector(".home-level-panel .xpbar > i")?.style?.width || "0%";
  const xpText = home.querySelector(".home-level-panel > em")?.textContent?.trim() || "0 / 0 XP";
  return { progress, xpText };
}

function heroAccuracy(value) {
  const parsed = Number.parseInt(String(value).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(parsed) ? `${parsed}%` : "--";
}

function metric(label, value, icon) {
  return `<div class="performance-snapshot-metric"><span aria-hidden="true">${icon}</span><small>${label}</small><b>${value}</b></div>`;
}

export function applyHomePerformanceSnapshot(root = document) {
  const home = root.querySelector?.(HOME_SELECTOR);
  const card = home?.querySelector?.(STATS_SELECTOR);
  if (!home || !card) return false;

  const reps = textFromStat(card, "Reps");
  const time = textFromStat(card, "Time");
  const accuracy = textFromStat(card, "Accuracy");
  const combo = textFromStat(card, "Combo");
  const xp = textFromStat(card, "XP Earned");
  const level = textFromStat(card, "PitchIQ Level");
  const { progress, xpText } = heroXpContext(home);

  const signature = [reps, time, accuracy, combo, xp, level, progress, xpText].join("|");
  if (card.dataset.h14Signature === signature) return true;

  card.dataset.h14Signature = signature;
  card.dataset.performanceSnapshot = "mission-control";
  card.setAttribute("aria-label", "Training performance snapshot");
  card.innerHTML = `<header class="performance-snapshot-header"><span>Training Snapshot</span><div class="performance-snapshot-hero"><strong>${heroAccuracy(accuracy)}</strong><small>Accuracy</small></div></header><div class="performance-snapshot-grid">${metric("Reps", reps, "↗")}${metric("Time", time, "◷")}${metric("Combo", combo, "⌁")}${metric("XP Earned", xp, "XP")}${metric("PitchIQ Level", level, "▮")}${metric("Weekly Trend", "Building", "▲")}</div><footer class="performance-snapshot-progress"><span>XP Progress</span><div class="xpbar"><i style="width:${progress}"></i></div><b>${xpText}</b></footer>`;
  return true;
}
