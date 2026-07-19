export const TECHNICAL_CATEGORY_LABELS = Object.freeze({
  "first-touch":"First Touch", passing:"Passing", receiving:"Receiving", "ball-mastery":"Ball Mastery", dribbling:"Dribbling", finishing:"Finishing", "weak-foot":"Weak Foot", turning:"Turning", "one-v-one":"1 v 1", "speed-agility":"Speed & Agility"
});

export const TECHNICAL_CATEGORIES = Object.freeze([
  "first-touch","passing","receiving","ball-mastery","dribbling","finishing","weak-foot","turning","one-v-one","speed-agility"
]);

const TITLES = Object.freeze({
  "first-touch":["First Touch Fundamentals","Cushion and Carry","Touch Out of Feet","First Touch Gates","Aerial Control Basics","Pressure Touch Escape","Directional First Touch","Match-Speed First Touch"],
  passing:["Wall Pass Rhythm","Inside-Foot Accuracy","Two-Touch Passing","Passing Gates","Driven Pass Technique","One-Touch Wall Series","Pass and Move Circuit","Pressure Passing Test"],
  receiving:["Receive Across Your Body","Open Body Receiving","Back-Foot Receive","Receive and Turn","Aerial Receive Control","Pressure-Side Receive","Receive Into Space","Match-Speed Receiving"],
  "ball-mastery":["Inside–Outside Mastery","Sole Roll Control","Toe Tap Rhythm","Foundations Box","V-Pull Series","L-Turn Mastery","Scissors Rhythm","Cruyff Control","Foundation Combo","Ball Mastery Challenge"],
  dribbling:["Change of Direction","Close Control Slalom","Speed Dribble Gates","Inside Cut Series","Outside Cut Series","Stop-Start Escape","Double-Move Dribble","Pressure Slalom","Head-Up Dribbling","Match-Speed Dribble"],
  finishing:["Finishing Foundations","Inside-Foot Placement","Laces Finish","First-Time Finish","Near-Post Finish","Far-Post Finish","Weak-Side Finish","Pressure Finishing"],
  "weak-foot":["Weak Foot Foundations","Weak Foot Passing","Weak Foot Receiving","Weak Foot Dribbling","Weak Foot Finishing","Weak Foot Match Test"],
  turning:["Inside Hook Turn","Outside Hook Turn","Cruyff Turn","Drag-Back Turn","Half-Turn Receive","Pressure Turn Circuit"],
  "one-v-one":["1 v 1 Foundations","Body Feint Escape","Scissors Attack","Double Move","Protect and Roll","1 v 1 Match Test"],
  "speed-agility":["Quick Feet Foundations","Cone Acceleration","Lateral Footwork","Reaction Gates","Change-of-Direction Sprint","Ball and Agility Circuit"]
});

const DESCRIPTIONS = Object.freeze({
  "first-touch":"Control the ball cleanly and prepare the next action with purpose.", passing:"Build accurate, repeatable passing technique under increasing pressure.", receiving:"Receive with better body shape, awareness and direction.", "ball-mastery":"Improve close control, coordination and confidence on the ball.", dribbling:"Carry the ball with control, speed and effective changes of direction.", finishing:"Develop cleaner striking technique and more composed finishing choices.", "weak-foot":"Build confidence and consistency on the non-dominant side.", turning:"Turn away from pressure while keeping the ball protected and playable.", "one-v-one":"Create separation and beat a defender with controlled attacking moves.", "speed-agility":"Improve foot speed, acceleration, reaction and change of direction."
});

const EQUIPMENT = Object.freeze({
  "first-touch":["ball","wall","4 cones"], passing:["ball","wall","4 cones"], receiving:["ball","wall","4 cones"], "ball-mastery":["ball","4 cones"], dribbling:["ball","6 cones"], finishing:["ball","goal","4 cones"], "weak-foot":["ball","wall","4 cones"], turning:["ball","4 cones"], "one-v-one":["ball","6 cones"], "speed-agility":["ball","6 cones"]
});

function slugify(value){return value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}
function buildDrill(category,title,index){
  const difficulty=Math.min(5,1+Math.floor(index/2));
  const academyLevel=Math.min(5,1+Math.floor(index/2));
  const unlockLevel=index<3?1:academyLevel;
  const locked=unlockLevel>1;
  const xp=5+difficulty*5;
  const minutes=3+Math.min(7,index);
  const badges=[difficulty<=2?"Beginner":difficulty<=4?"Intermediate":"Advanced"];
  if(index===0)badges.push("Academy Essential");
  if(index===1)badges.push("New");
  if(index===2)badges.push("Featured");
  if(category==="weak-foot")badges.push("Weak Foot");
  if(index===TITLES[category].length-1)badges.push("Match Ready");
  return Object.freeze({
    id:slugify(title), title, category, description:DESCRIPTIONS[category], difficulty, xp, minutes,
    equipment:EQUIPMENT[category], environments:category==="finishing"?["outdoor"]:["indoor","outdoor"],
    recommendedAge:"9–16", academyLevel, unlockLevel, prerequisites:index? [slugify(TITLES[category][index-1])] : [],
    tags:[category,...badges.map(slugify)], badges, featured:index===0||index===2, newest:index===1,
    status:locked?"locked":"available"
  });
}

export const TECHNICAL_TRAINING_DRILLS = Object.freeze(
  TECHNICAL_CATEGORIES.flatMap(category=>TITLES[category].map((title,index)=>buildDrill(category,title,index)))
);

export const TECHNICAL_DRILL_COUNT = TECHNICAL_TRAINING_DRILLS.length;
