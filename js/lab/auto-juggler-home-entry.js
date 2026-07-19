const app = document.getElementById("app");

function injectAutoJugglerHomeTile(){
  const grid = document.querySelector("#home .home-actions-grid");
  if(!grid || grid.querySelector("[data-auto-juggler-open]")) return;

  const tile = document.createElement("button");
  tile.type = "button";
  tile.className = "home-action-card auto-juggler-home-card";
  tile.setAttribute("data-auto-juggler-open", "true");
  tile.setAttribute("aria-label", "Open PitchIQ Lab Auto Juggler");
  tile.innerHTML = `<b>◉</b><span>PitchIQ Lab</span><small>Auto Juggler</small>`;
  grid.appendChild(tile);
}

if(app){
  new MutationObserver(injectAutoJugglerHomeTile).observe(app, {childList:true, subtree:true});
}

window.addEventListener("hashchange", () => setTimeout(injectAutoJugglerHomeTile, 0));
injectAutoJugglerHomeTile();
