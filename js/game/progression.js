import { CAREER_RANKS } from "../data/rewards.js";

export function xpNeed(level){ return level * 600; }
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
export function openReward(state, reward){
  if (!state.game.unlocked.includes(reward.id)) state.game.unlocked.push(reward.id);
  state.game.packOpened = true;
  return reward.xp || 0;
}