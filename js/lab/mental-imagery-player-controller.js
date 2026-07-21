let controllerTimer = null;
let controllerElapsed = 0;
let controllerRunning = false;
let controllerSessionId = "";
let controllerCueIndex = -1;

function currentSession() {
  const title = document.querySelector("#mentalImageryPlayer h1")?.textContent?.trim();
  return window.PitchIQMentalImagery?.sessions?.find(session => session.title === title) || null;
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function stopNarration() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function speak(text) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.82;
  utterance.pitch = 0.92;
  utterance.volume = 0.9;
  window.speechSynthesis.speak(utterance);
}

function resetController(session) {
  clearInterval(controllerTimer);
  controllerTimer = null;
  controllerElapsed = 0;
  controllerRunning = false;
  controllerSessionId = session?.id || "";
  controllerCueIndex = -1;
  stopNarration();
}

function updatePlayer(session) {
  const total = session.duration * 60;
  const cueIndex = Math.min(session.steps.length - 1, Math.floor((controllerElapsed / Math.max(1, total)) * session.steps.length));
  const cue = session.steps[cueIndex];
  const elapsed = document.getElementById("mentalImageryElapsed");
  const bar = document.getElementById("mentalImageryProgressBar");
  const cueNode = document.getElementById("mentalImageryCue");
  if (elapsed) elapsed.textContent = formatTime(controllerElapsed);
  if (bar) bar.style.width = `${Math.min(100, controllerElapsed / total * 100)}%`;
  if (cueNode) cueNode.textContent = cue;
  if (cueIndex !== controllerCueIndex) {
    controllerCueIndex = cueIndex;
    speak(cue);
  }
  if (controllerElapsed >= total) completeSession(session);
}

function saveCompletion(session) {
  const key = window.PitchIQMentalImagery?.storageKey;
  if (!key) return;
  let progress = { completed: [], favourites: [], recent: [] };
  try { progress = { ...progress, ...JSON.parse(localStorage.getItem(key) || "{}") }; } catch {}
  progress.completed = [...new Set([...(progress.completed || []), session.id])];
  progress.recent = [session.id, ...(progress.recent || []).filter(id => id !== session.id)].slice(0, 5);
  localStorage.setItem(key, JSON.stringify(progress));
}

function completeSession(session) {
  clearInterval(controllerTimer);
  controllerTimer = null;
  controllerRunning = false;
  stopNarration();
  saveCompletion(session);
  const cue = document.getElementById("mentalImageryCue");
  const play = document.querySelector("[data-imagery-play]");
  const bar = document.getElementById("mentalImageryProgressBar");
  if (cue) cue.textContent = "Session complete. Take one final breath and carry your cue into the game.";
  if (play) { play.textContent = "✓"; play.setAttribute("aria-label", "Session complete"); }
  if (bar) bar.style.width = "100%";
}

function toggleController(button, session) {
  if (controllerSessionId !== session.id) resetController(session);
  controllerRunning = !controllerRunning;
  button.textContent = controllerRunning ? "Ⅱ" : "▶";
  button.setAttribute("aria-label", controllerRunning ? "Pause session" : "Play session");
  clearInterval(controllerTimer);
  controllerTimer = null;
  if (!controllerRunning) {
    stopNarration();
    return;
  }
  updatePlayer(session);
  controllerTimer = setInterval(() => {
    controllerElapsed += 1;
    updatePlayer(session);
  }, 1000);
}

window.addEventListener("click", event => {
  const play = event.target.closest?.("#mentalImageryPlayer [data-imagery-play]");
  const complete = event.target.closest?.("#mentalImageryPlayer [data-imagery-complete]");
  if (!play && !complete) return;
  const session = currentSession();
  if (!session) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (play) toggleController(play, session);
  else completeSession(session);
}, true);

window.addEventListener("hashchange", () => {
  if (location.hash.replace(/^#/, "") !== "lab-mental-imagery") resetController(null);
});
