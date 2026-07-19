const app = document.getElementById("app");

function isOrientationPreview(){
  return window.location.hash.replace(/^#/, "").toLowerCase() === "academy-trials";
}

function applyOrientationPolish(){
  if(!isOrientationPreview()) return;
  const shell = app?.querySelector(".trial-shell");
  const head = shell?.querySelector(".trial-list-head");
  const cards = shell?.querySelectorAll(".trial-card.available");
  if(!shell || !head || !cards || cards.length < 3) return;

  shell.classList.add("orientation-preview-polished");

  const kicker = head.querySelector(".trial-kicker");
  const title = head.querySelector("h1");
  const copy = head.querySelector("p");
  if(kicker) kicker.textContent = "Welcome to PitchIQ";
  if(title) title.textContent = "Learn the Tools";
  if(copy) copy.textContent = "Meet your coach, camera and first challenge.";

  const cardCopy = [
    ["Meet Your Coach", "Listen to your coach."],
    ["Camera Finder", "Find your training space."],
    ["Quick Challenge", "Play your first challenge."]
  ];

  cards.forEach((card, index) => {
    const strong = card.querySelector("strong");
    const small = card.querySelector("small");
    if(strong) strong.textContent = cardCopy[index][0];
    if(small) small.textContent = cardCopy[index][1];
  });
}

window.addEventListener("hashchange", () => setTimeout(applyOrientationPolish, 0));
new MutationObserver(applyOrientationPolish).observe(app, {childList:true, subtree:true});
applyOrientationPolish();
