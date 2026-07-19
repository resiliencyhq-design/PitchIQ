const app = document.getElementById("app");

function getActiveHome(){
  const home = document.querySelector("#home");
  if(!home) return null;
  return home.classList.contains("active") || home.offsetParent !== null ? home : null;
}

function syncHomeActiveState(){
  document.documentElement.classList.toggle("pitchiq-home-active", Boolean(getActiveHome()));
}

function injectStartTrainingAction(){
  const home = document.querySelector("#home");
  if(!home || home.querySelector(".home-start-training")){
    syncHomeActiveState();
    return;
  }

  const mission = home.querySelector(".home-mock-mission");
  const grid = home.querySelector(".home-v7-grid");
  if(!grid) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "home-start-training";
  button.setAttribute("data-route", "training");
  button.setAttribute("aria-label", "Start training");
  button.innerHTML = `
    <span class="home-start-training-icon" aria-hidden="true">⚽</span>
    <span class="home-start-training-copy">
      <strong>START TRAINING</strong>
      <small>Continue your journey</small>
    </span>
    <span class="home-start-training-arrow" aria-hidden="true">›</span>
  `;

  if(mission && mission.parentElement === grid){
    mission.insertAdjacentElement("afterend", button);
  }else{
    grid.appendChild(button);
  }

  syncHomeActiveState();
}

function refreshHomeEnhancements(){
  injectStartTrainingAction();
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
