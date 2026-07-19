const app = document.getElementById("app");

function getActiveHome(){
  const home = document.querySelector("#home");
  if(!home) return null;
  return home.classList.contains("active") || home.offsetParent !== null ? home : null;
}

function syncHomeActiveState(){
  document.documentElement.classList.toggle("pitchiq-home-active", Boolean(getActiveHome()));
}

function removeDuplicateTrainingAction(home){
  home?.querySelectorAll(".home-start-training").forEach(button => button.remove());
}

function readCurrentXp(home){
  const levelPanel = home?.querySelector(".home-level-panel");
  if(!levelPanel) return 0;
  const match = levelPanel.textContent.match(/([\d,]+)\s*\/\s*[\d,]+\s*XP/i);
  return match ? Number(match[1].replaceAll(",", "")) : 0;
}

function findRewardThresholdElement(home){
  const mission = home?.querySelector(".home-mock-mission");
  if(!mission) return null;

  return [...mission.querySelectorAll("small, span, p, em, strong, b, div")].find(element => {
    const text = element.textContent.trim();
    return /^Unlock at\s*[\d,]+\s*XP$/i.test(text) || element.classList.contains("home-reward-progress");
  }) || null;
}

function syncRewardProgress(home){
  const element = findRewardThresholdElement(home);
  if(!element) return;

  const thresholdMatch = element.textContent.match(/Unlock at\s*([\d,]+)\s*XP/i);
  if(thresholdMatch && !element.dataset.rewardTargetXp){
    element.dataset.rewardTargetXp = thresholdMatch[1].replaceAll(",", "");
  }

  const targetXp = Number(element.dataset.rewardTargetXp || 0);
  if(!targetXp) return;

  const currentXp = readCurrentXp(home);
  const remainingXp = Math.max(0, targetXp - currentXp);
  const nextText = remainingXp > 0
    ? `${remainingXp.toLocaleString()} XP remaining`
    : "Reward ready";

  if(!element.classList.contains("home-reward-progress")){
    element.classList.add("home-reward-progress");
  }

  // Avoid repeatedly mutating textContent from inside the observer callback.
  // Rewriting identical text triggers another childList mutation and can lock the app.
  if(element.textContent !== nextText){
    element.textContent = nextText;
  }
}

function refreshHomeEnhancements(){
  const home = document.querySelector("#home");
  if(home){
    removeDuplicateTrainingAction(home);
    syncRewardProgress(home);
  }
  syncHomeActiveState();
}

if(app){
  new MutationObserver(refreshHomeEnhancements).observe(app, {
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:["class"]
  });
}

window.addEventListener("hashchange", () => setTimeout(refreshHomeEnhancements, 0));
window.addEventListener("pageshow", refreshHomeEnhancements);
refreshHomeEnhancements();
