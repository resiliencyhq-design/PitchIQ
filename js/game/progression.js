import { CAREER_RANKS } from "../data/rewards.js";

const LEVEL_XP_REQUIREMENTS = {
  1: 220,
  2: 360,
  3: 500,
  4: 640,
  5: 800
};

export function xpNeed(level){ return LEVEL_XP_REQUIREMENTS[level] || 800 + (level - 5) * 180; }
export function rankForLevel(level){
  return CAREER_RANKS.filter(r => level >= r.min).at(-1)?.name || "Grassroots";
}
export function addXP(state, amount){
  state.game.xp += amount;
  state.game.lastXp += amount;
  let leveled = false;
  while(state.game.xp >= xpNeed(state.game.level)){
    state.game.xp -= xpNeed(state.game.level);
    state.game.level += 1;
    leveled = true;
  }
  state.analytics.weeklyXp[6] = (state.analytics.weeklyXp[6] || 0) + amount;
  return leveled;
}
export function completeDaily(state){
  state.game.dailyDone = true;
}

export function rewardProgressXp(state){
  return (state.analytics?.weeklyXp || []).reduce((sum, xp) => sum + xp, 0);
}

export function openReward(state, rewards){
  const pool = Array.isArray(rewards) ? rewards : [rewards];
  const earnedXp = rewardProgressXp(state);
  const reward = pool.find(item => item && !state.game.unlocked.includes(item.id) && earnedXp >= (item.unlockXp || 0));
  if (!reward) return null;
  if (!state.game.unlocked.includes(reward.id)) state.game.unlocked.push(reward.id);
  state.game.packOpened = true;
  return reward;
}
