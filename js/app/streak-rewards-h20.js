const STREAK_REWARDS = [
  { days: 3, id: "streak-bronze-boot", name: "Bronze Boot", type: "badge" },
  { days: 7, id: "streak-consistency", name: "Consistency Badge", type: "badge" },
  { days: 14, id: "streak-avatar", name: "Academy Avatar Cosmetic", type: "avatar" },
  { days: 21, id: "streak-xp-boost", name: "Mission XP Boost", type: "boost" },
  { days: 30, id: "streak-crest", name: "Academy Crest Upgrade", type: "crest" },
  { days: 50, id: "streak-stadium", name: "Stadium Theme", type: "stadium" },
  { days: 75, id: "streak-coach-pack", name: "Coach Voice Pack", type: "voice" },
  { days: 100, id: "streak-legend", name: "Legend Badge + Profile Frame", type: "legend" }
];

const STATE_KEY = "pitchiq_integrated_v1";
const CLAIMED_KEY = "pitchiqStreakRewardsClaimed";

function loadGameState(){
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || "{}"); }
  catch { return {}; }
}

function saveGameState(state){
  try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
  catch {}
}

function claimedRewards(){
  try {
    const parsed = JSON.parse(localStorage.getItem(CLAIMED_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveClaimed(ids){
  try { localStorage.setItem(CLAIMED_KEY, JSON.stringify(ids)); }
  catch {}
}

function nextReward(streak){
  return STREAK_REWARDS.find(reward => streak < reward.days) || STREAK_REWARDS.at(-1);
}

function earnedRewards(streak){
  return STREAK_REWARDS.filter(reward => streak >= reward.days);
}

function heroMessage(streak){
  const next = nextReward(streak);
  if (!next || streak >= STREAK_REWARDS.at(-1).days) return "Legend reward unlocked";
  const remaining = Math.max(0, next.days - streak);
  return remaining === 1 ? `1 day until ${next.name}` : `Reward in ${remaining} days`;
}

function applyHeroStreak(root=document){
  const streak = Math.max(0, Number(loadGameState()?.game?.streak || 0));
  const node = root.querySelector?.(".home-streak");
  if (!node) return false;
  node.innerHTML = `🔥 ${streak} DAY STREAK <span class="home-streak-reward">• ${heroMessage(streak)}</span>`;
  node.setAttribute("role", "button");
  node.setAttribute("tabindex", "0");
  node.setAttribute("aria-label", `${streak} day streak. ${heroMessage(streak)}. Open Academy Rewards.`);
  node.dataset.route = "reward";
  return true;
}

function rewardProgressMarkup(streak, claimed){
  return STREAK_REWARDS.map(reward => {
    const earned = streak >= reward.days;
    const isClaimed = claimed.includes(reward.id);
    const status = isClaimed ? "Claimed" : earned ? "Ready to claim" : `${Math.max(0, reward.days-streak)} days remaining`;
    return `<article class="streak-reward-row ${earned ? "earned" : "locked"}">
      <div class="streak-reward-day">${reward.days}<small>days</small></div>
      <div class="streak-reward-copy"><strong>${reward.name}</strong><span>${status}</span></div>
      ${earned && !isClaimed ? `<button type="button" data-claim-streak-reward="${reward.id}">Claim</button>` : `<b>${isClaimed ? "✓" : "🔒"}</b>`}
    </article>`;
  }).join("");
}

function renderRewardHub(root=document){
  const screen = root.querySelector?.("#reward");
  if (!screen || screen.dataset.streakRewardsEnhanced === "true") return false;
  screen.dataset.streakRewardsEnhanced = "true";
  const state = loadGameState();
  const streak = Math.max(0, Number(state?.game?.streak || 0));
  const claimed = claimedRewards();
  const next = nextReward(streak);
  screen.innerHTML = `<div class="streak-reward-hub">
    <header><span>Academy Rewards</span><h1>Your streak rewards</h1><p>Complete the daily mission to keep your streak alive and unlock the next reward.</p></header>
    <section class="streak-reward-summary"><div><small>Current streak</small><strong>🔥 ${streak} days</strong></div><div><small>Next reward</small><strong>${streak >= STREAK_REWARDS.at(-1).days ? "Legend unlocked" : next.name}</strong></div></section>
    <section class="streak-reward-list" aria-label="Streak reward milestones">${rewardProgressMarkup(streak, claimed)}</section>
    <button class="primary mega" type="button" data-route="home">Back to Home</button>
  </div>`;
  return true;
}

function claimReward(id){
  const reward = STREAK_REWARDS.find(item => item.id === id);
  if (!reward) return;
  const state = loadGameState();
  const streak = Math.max(0, Number(state?.game?.streak || 0));
  if (streak < reward.days) return;
  const claimed = claimedRewards();
  if (!claimed.includes(id)) claimed.push(id);
  saveClaimed(claimed);
  state.game ||= {};
  state.game.unlocked = Array.isArray(state.game.unlocked) ? state.game.unlocked : [];
  if (!state.game.unlocked.includes(id)) state.game.unlocked.push(id);
  saveGameState(state);
  const screen = document.querySelector("#reward");
  if (screen) screen.dataset.streakRewardsEnhanced = "false";
  renderRewardHub(document);
}

function refresh(){
  applyHeroStreak(document);
  renderRewardHub(document);
}

document.addEventListener("click", event => {
  const claim = event.target.closest?.("[data-claim-streak-reward]");
  if (!claim) return;
  event.preventDefault();
  claimReward(claim.dataset.claimStreakReward);
}, true);

if (typeof document !== "undefined") {
  const app = document.getElementById("app");
  if (app) new MutationObserver(() => queueMicrotask(refresh)).observe(app, { childList:true, subtree:false });
  window.addEventListener("pageshow", refresh);
  window.addEventListener("hashchange", () => queueMicrotask(refresh));
  refresh();
}

export { STREAK_REWARDS, applyHeroStreak, renderRewardHub };
