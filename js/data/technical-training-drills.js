export const TECHNICAL_TRAINING_DRILLS = Object.freeze([
  { id:"first-touch-fundamentals", title:"First Touch Fundamentals", category:"first-touch", difficulty:2, xp:10, minutes:4, description:"Build a softer first touch that keeps the ball close and prepares your next action.", status:"available", featured:true },
  { id:"wall-pass-rhythm", title:"Wall Pass Rhythm", category:"passing", difficulty:2, xp:10, minutes:5, description:"Develop cleaner passing technique and a repeatable receiving rhythm.", status:"available" },
  { id:"receive-across-body", title:"Receive Across Your Body", category:"receiving", difficulty:3, xp:15, minutes:5, description:"Open your body and receive into space rather than stopping the ball underneath you.", status:"available" },
  { id:"inside-outside-mastery", title:"Inside–Outside Mastery", category:"ball-mastery", difficulty:2, xp:10, minutes:4, description:"Improve close control using alternating inside and outside touches.", status:"available" },
  { id:"change-of-direction", title:"Change of Direction", category:"dribbling", difficulty:3, xp:15, minutes:5, description:"Use sharp cuts and controlled acceleration to escape pressure.", status:"available" },
  { id:"weak-foot-foundations", title:"Weak Foot Foundations", category:"weak-foot", difficulty:2, xp:10, minutes:4, description:"Build confidence and consistency on your non-dominant side.", status:"locked", unlockLevel:2 }
]);

export const TECHNICAL_CATEGORY_LABELS = Object.freeze({
  "first-touch":"First Touch",
  passing:"Passing",
  receiving:"Receiving",
  "ball-mastery":"Ball Mastery",
  dribbling:"Dribbling",
  finishing:"Finishing",
  "weak-foot":"Weak Foot",
  turning:"Turning",
  "one-v-one":"1 v 1",
  "speed-agility":"Speed & Agility"
});

export const TECHNICAL_CATEGORIES = Object.freeze([
  "first-touch","passing","receiving","ball-mastery","dribbling","finishing","weak-foot","turning","one-v-one","speed-agility"
]);
