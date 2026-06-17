export const REWARDS = [
  { id:"academy-boots", name:"Academy Boots", tier:"Gold", xp:100, unlockXp:2400, type:"boots", art:"assets/art/boots.svg" },
  { id:"vision-badge", name:"Vision Badge", tier:"Silver", xp:50, unlockXp:900, type:"badge", art:"assets/art/badge-vision.svg" },
  { id:"stadium-night", name:"Night Stadium", tier:"Elite", xp:150, unlockXp:1800, type:"stadium", art:"assets/art/stadium-night.svg" },
  { id:"elite-card", name:"Elite Card Frame", tier:"Legendary", xp:200, unlockXp:3600, type:"card", art:"assets/art/card-reveal.svg" }
];

export const CAREER_RANKS = [
  { min:1, name:"Grassroots", milestone:"First touch" },
  { min:4, name:"Local Club", milestone:"Training habit" },
  { min:8, name:"Division 3", milestone:"Faster reactions" },
  { min:13, name:"Division 2", milestone:"Better scanning" },
  { min:19, name:"Division 1", milestone:"Pressure decisions" },
  { min:26, name:"Academy", milestone:"Elite pathway" },
  { min:36, name:"NPL", milestone:"High performer" },
  { min:51, name:"A-League", milestone:"Professional habits" },
  { min:71, name:"Europe", milestone:"Game intelligence" },
  { min:91, name:"Ballon d'Or", milestone:"Mastery" }
];

export const ACHIEVEMENTS = [
  { id:"first-session", name:"First Session", requirement:"Complete one session" },
  { id:"combo-five", name:"Combo x5", requirement:"Reach combo x5" },
  { id:"sub-500", name:"Sharp Reaction", requirement:"Record reaction under 500 ms" },
  { id:"week-one", name:"One Week Academy", requirement:"Maintain 7-day streak" }
];
