const KEY = "pitchiq_integrated_v1";
const defaults = {
  profile:{ name:"", position:"Winger", goal:"React faster", createdAt:null },
  game:{ xp:0, level:1, streak:1, coins:0, dailyDone:false, packOpened:false, unlocked:[], lastXp:0, bestCombo:1 },
  analytics:{ sessions:[], bestReaction:null, reactionHistory:[], weeklyXp:[80,140,220,180,310,120,0] },
  settings:{ sound:true, haptics:true, reduceMotion:false, highContrast:false, cameraPreference:"environment" }
};

export function loadState(){
  try { return deepMerge(defaults, JSON.parse(localStorage.getItem(KEY) || "{}")); }
  catch { return structuredClone(defaults); }
}
export function saveState(state){ localStorage.setItem(KEY, JSON.stringify(state)); }
export function resetState(){ localStorage.removeItem(KEY); }
function deepMerge(a,b){
  const out = Array.isArray(a) ? [...a] : {...a};
  for (const k in b) out[k] = b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) ? deepMerge(a[k] || {}, b[k]) : b[k];
  return out;
}