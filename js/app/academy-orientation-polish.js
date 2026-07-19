const app = document.getElementById("app");
let applyingPolish = false;

function isOrientationPreview(){
  return window.location.hash.replace(/^#/, "").toLowerCase() === "academy-trials";
}

function setTextIfChanged(element, text){
  if(element && element.textContent !== text) element.textContent = text;
}

function applyOrientationPolish(){
  if(applyingPolish || !isOrientationPreview()) return;
  const shell = app?.querySelector(".trial-shell");
  const head = shell?.querySelector(".trial-list-head");
  const cards = shell?.querySelectorAll(".trial-card.available");
  if(!shell || !head || !cards || cards.length < 3) return;

  applyingPolish = true;
  try{
    shell.classList.add("orientation-preview-polished");

    setTextIfChanged(head.querySelector(".trial-kicker"), "Welcome to PitchIQ");
    setTextIfChanged(head.querySelector("h1"), "Learn the Tools");
    setTextIfChanged(head.querySelector("p"), "Meet your coach, camera and first challenge.");

    const cardCopy = [
      ["Meet Your Coach", "Listen to your coach."],
      ["Camera Finder", "Find your training space."],
      ["Quick Challenge", "Play your first challenge."]
    ];

    cards.forEach((card, index) => {
      setTextIfChanged(card.querySelector("strong"), cardCopy[index][0]);
      setTextIfChanged(card.querySelector("small"), cardCopy[index][1]);
    });
  } finally {
    applyingPolish = false;
  }
}

window.addEventListener("hashchange", () => setTimeout(applyOrientationPolish, 0));
new MutationObserver(applyOrientationPolish).observe(app, {childList:true, subtree:true});
applyOrientationPolish();
