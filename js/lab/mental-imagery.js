const ROUTE = "lab-mental-imagery";
const STORAGE_KEY = "pitchiqMentalImageryProgressV1";

const SESSIONS = Object.freeze([
  {
    id: "match-lock-in",
    title: "Match Lock-In",
    category: "Game preparation",
    duration: 2,
    icon: "◎",
    summary: "Arrive calm, alert and ready for your first action.",
    steps: [
      "Settle your breathing. Feel your feet grounded and your shoulders loose.",
      "Picture the pitch, the sounds around you and the space in front of you.",
      "See yourself scan before the ball arrives. Your first touch is calm and purposeful.",
      "Imagine one simple early action: communicate, move, receive and play.",
      "Lock in your cue: scan early, stay calm, play forward when it is on."
    ]
  },
  {
    id: "calm-before-kickoff",
    title: "Calm Before Kick-Off",
    category: "Calm",
    duration: 3,
    icon: "◌",
    summary: "Lower excess tension without losing match intensity.",
    steps: [
      "Breathe in slowly and let the exhale soften your jaw, hands and shoulders.",
      "Notice excitement as energy you can use, not something you need to remove.",
      "Picture the opening whistle and yourself moving into position with control.",
      "See the first contest. You are balanced, composed and ready to respond.",
      "Return to one cue: calm body, clear eyes, next action."
    ]
  },
  {
    id: "scan-before-receive",
    title: "Scan Before You Receive",
    category: "Football IQ",
    duration: 3,
    icon: "◉",
    summary: "Rehearse checking shoulders and seeing the next action early.",
    steps: [
      "Picture the ball travelling toward a teammate while you move into space.",
      "Check one shoulder, then the other. Notice pressure, teammates and the open lane.",
      "Adjust your body so you can see the ball and the next option together.",
      "Receive with a touch that protects the ball and prepares your next action.",
      "Repeat the sequence: move, scan, open body, receive, decide."
    ]
  },
  {
    id: "mistake-recovery",
    title: "Mistake Recovery",
    category: "Resilience",
    duration: 2,
    icon: "↻",
    summary: "Reset quickly and return attention to the next playable moment.",
    steps: [
      "Picture a pass that misses its target. Notice the reaction, then let it pass.",
      "Take one steady breath and turn your attention back to the field.",
      "See yourself recover position, communicate and compete for the next action.",
      "Use your reset cue: done, learn, next ball.",
      "Finish by picturing one strong action immediately after the mistake."
    ]
  },
  {
    id: "centre-back-focus",
    title: "Centre Back Focus",
    category: "Position",
    duration: 4,
    icon: "◇",
    summary: "Organise, scan, defend first and play through pressure.",
    positions: ["CB"],
    steps: [
      "See the whole line in front of you. Check the striker, the space and your fullbacks.",
      "Communicate early. Move the line before the danger develops.",
      "Picture an aerial ball. Set your feet, attack it strongly and win first contact.",
      "Now receive from the goalkeeper. Scan before it arrives and open a passing lane.",
      "Play through midfield when it is safe. If it is not on, protect the team first.",
      "Lock in your cues: scan, organise, win it, play simple."
    ]
  },
  {
    id: "midfielder-vision",
    title: "Midfielder Vision",
    category: "Position",
    duration: 4,
    icon: "✦",
    summary: "Find space, receive side-on and connect the next pass.",
    positions: ["CAM", "CM", "CDM"],
    steps: [
      "Picture yourself moving away from pressure and arriving in a new passing lane.",
      "Scan both shoulders before the ball comes. Know your safest and most dangerous option.",
      "Receive side-on with space to turn or bounce the ball first time.",
      "See a teammate running beyond. Choose the moment to pass, carry or retain possession.",
      "After releasing the ball, move again and become available for the next action.",
      "Lock in your cues: find space, scan early, connect, move again."
    ]
  },
  {
    id: "striker-finishing",
    title: "Striker Finishing Mindset",
    category: "Position",
    duration: 4,
    icon: "⚡",
    summary: "Rehearse movement, composure and decisive finishing.",
    positions: ["ST", "LW", "RW"],
    steps: [
      "Picture the defender watching the ball. Move out of sight, then attack the space.",
      "Check your shoulder and see the goalkeeper's position before the final pass arrives.",
      "Set your body early. Your first touch brings the ball into your finishing path.",
      "Choose the finish clearly and strike through the ball with commitment.",
      "Picture a miss as well. Reset immediately and make the next run with the same intent.",
      "Lock in your cues: move early, see the goal, finish decisively."
    ]
  },
  {
    id: "confidence-builder",
    title: "Confidence Builder",
    category: "Confidence",
    duration: 3,
    icon: "★",
    summary: "Reconnect with evidence of what you can already do.",
    steps: [
      "Remember a moment when you played with freedom and trusted your decisions.",
      "Notice what your body felt like: balanced, active and ready.",
      "Picture yourself repeating one strength in the next game.",
      "Now see a difficult moment and respond with patience rather than panic.",
      "Finish with your cue: I prepare, I compete, I respond."
    ]
  }
]);

let timer = null;
let activeSession = null;
let elapsed = 0;
let running = false;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      favourites: Array.isArray(parsed.favourites) ? parsed.favourites : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : []
    };
  } catch {
    return { completed: [], favourites: [], recent: [] };
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function currentRoute() {
  return location.hash.replace(/^#/, "").toLowerCase();
}

function playerPosition() {
  return localStorage.getItem("pitchiqSelectedPosition") || "";
}

function recommendedSession() {
  const position = playerPosition();
  return SESSIONS.find(session => session.positions?.includes(position)) || SESSIONS[0];
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function sessionCard(session, progress, recommendedId) {
  const completed = progress.completed.includes(session.id);
  const favourite = progress.favourites.includes(session.id);
  return `<article class="mental-imagery-session-card${session.id === recommendedId ? " is-recommended" : ""}">
    <button type="button" class="mental-imagery-favourite${favourite ? " is-active" : ""}" data-imagery-favourite="${escapeHtml(session.id)}" aria-label="${favourite ? "Remove from" : "Add to"} favourites">${favourite ? "★" : "☆"}</button>
    <span class="mental-imagery-session-icon" aria-hidden="true">${escapeHtml(session.icon)}</span>
    <div>
      <small>${escapeHtml(session.category)} · ${session.duration} min${completed ? " · Completed" : ""}</small>
      <strong>${escapeHtml(session.title)}</strong>
      <p>${escapeHtml(session.summary)}</p>
    </div>
    <button type="button" class="mental-imagery-open" data-imagery-open="${escapeHtml(session.id)}">Begin <b aria-hidden="true">›</b></button>
  </article>`;
}

function renderLibrary() {
  stopTimer();
  const progress = loadProgress();
  const recommended = recommendedSession();
  const app = document.getElementById("app");
  if (!app || currentRoute() !== ROUTE) return false;

  document.body.classList.remove("pitchiq-splash-active", "pitchiq-immersive-active");
  document.getElementById("nav")?.classList.add("visible");
  app.innerHTML = `<section class="mental-imagery-screen" id="mentalImageryLab">
    <header class="mental-imagery-topbar">
      <button type="button" data-imagery-back aria-label="Back to Lab">‹</button>
      <div><span>PitchIQ Lab</span><strong>Mental Imagery</strong></div>
      <em>Prototype</em>
    </header>
    <main class="mental-imagery-content">
      <section class="mental-imagery-hero">
        <span class="mental-imagery-rings" aria-hidden="true"><i></i><i></i><i></i></span>
        <div><span>SEE IT BEFORE YOU PLAY IT</span><h1>Game-ready<br>in a few minutes.</h1><p>Short guided imagery for calm, confidence and football decisions.</p></div>
        <b aria-hidden="true">◉</b>
      </section>
      <section class="mental-imagery-recommended">
        <header><span>Recommended for you</span><small>${escapeHtml(playerPosition() || "Player")} preparation</small></header>
        ${sessionCard(recommended, progress, recommended.id)}
      </section>
      <section class="mental-imagery-library">
        <header><span>Imagery library</span><small>${SESSIONS.length} sessions · 2–4 min</small></header>
        ${SESSIONS.filter(session => session.id !== recommended.id).map(session => sessionCard(session, progress, recommended.id)).join("")}
      </section>
      <p class="mental-imagery-safety">Use while seated or resting. Do not use during driving, active play or any activity requiring full attention.</p>
    </main>
  </section>`;
  return true;
}

function renderPlayer(session) {
  const app = document.getElementById("app");
  if (!app) return;
  activeSession = session;
  elapsed = 0;
  running = false;
  const totalSeconds = session.duration * 60;
  app.innerHTML = `<section class="mental-imagery-player" id="mentalImageryPlayer">
    <header><button type="button" data-imagery-close aria-label="Close session">×</button><span>${escapeHtml(session.category)}</span><em>${session.duration} min</em></header>
    <main>
      <div class="mental-imagery-orb" aria-hidden="true"><i></i><i></i><span>${escapeHtml(session.icon)}</span></div>
      <small>MENTAL IMAGERY</small>
      <h1>${escapeHtml(session.title)}</h1>
      <p id="mentalImageryCue">Settle in, place the phone down and press play when you are ready.</p>
      <div class="mental-imagery-progress"><i id="mentalImageryProgressBar"></i></div>
      <div class="mental-imagery-time"><span id="mentalImageryElapsed">0:00</span><span>${formatTime(totalSeconds)}</span></div>
      <button type="button" class="mental-imagery-play" data-imagery-play aria-label="Play session">▶</button>
      <button type="button" class="mental-imagery-complete" data-imagery-complete>MARK COMPLETE</button>
    </main>
  </section>`;
}

function cueForElapsed(session, seconds) {
  const total = Math.max(1, session.duration * 60);
  const index = Math.min(session.steps.length - 1, Math.floor((seconds / total) * session.steps.length));
  return session.steps[index];
}

function updatePlayer() {
  if (!activeSession) return;
  const total = activeSession.duration * 60;
  const pct = Math.min(100, (elapsed / total) * 100);
  const elapsedNode = document.getElementById("mentalImageryElapsed");
  const progressNode = document.getElementById("mentalImageryProgressBar");
  const cueNode = document.getElementById("mentalImageryCue");
  if (elapsedNode) elapsedNode.textContent = formatTime(elapsed);
  if (progressNode) progressNode.style.width = `${pct}%`;
  if (cueNode) cueNode.textContent = cueForElapsed(activeSession, elapsed);
  if (elapsed >= total) completeActiveSession();
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
  running = false;
}

function togglePlay(button) {
  if (!activeSession) return;
  running = !running;
  button.textContent = running ? "Ⅱ" : "▶";
  button.setAttribute("aria-label", running ? "Pause session" : "Play session");
  stopTimer();
  if (!running) return;
  running = true;
  timer = setInterval(() => {
    elapsed += 1;
    updatePlayer();
  }, 1000);
}

function completeActiveSession() {
  if (!activeSession) return;
  stopTimer();
  const progress = loadProgress();
  progress.completed = [...new Set([...progress.completed, activeSession.id])];
  progress.recent = [activeSession.id, ...progress.recent.filter(id => id !== activeSession.id)].slice(0, 5);
  saveProgress(progress);
  const cue = document.getElementById("mentalImageryCue");
  const play = document.querySelector("[data-imagery-play]");
  if (cue) cue.textContent = "Session complete. Take one final breath and carry your cue into the game.";
  if (play) play.textContent = "✓";
}

function toggleFavourite(sessionId) {
  const progress = loadProgress();
  progress.favourites = progress.favourites.includes(sessionId)
    ? progress.favourites.filter(id => id !== sessionId)
    : [...progress.favourites, sessionId];
  saveProgress(progress);
  renderLibrary();
}

function handleClick(event) {
  const back = event.target.closest?.("[data-imagery-back]");
  if (back) {
    event.preventDefault();
    location.hash = "world-lab";
    return;
  }

  const open = event.target.closest?.("[data-imagery-open]");
  if (open) {
    event.preventDefault();
    const session = SESSIONS.find(item => item.id === open.dataset.imageryOpen);
    if (session) renderPlayer(session);
    return;
  }

  const close = event.target.closest?.("[data-imagery-close]");
  if (close) {
    event.preventDefault();
    renderLibrary();
    return;
  }

  const favourite = event.target.closest?.("[data-imagery-favourite]");
  if (favourite) {
    event.preventDefault();
    toggleFavourite(favourite.dataset.imageryFavourite);
    return;
  }

  const play = event.target.closest?.("[data-imagery-play]");
  if (play) {
    event.preventDefault();
    togglePlay(play);
    return;
  }

  const complete = event.target.closest?.("[data-imagery-complete]");
  if (complete) {
    event.preventDefault();
    completeActiveSession();
  }
}

function handleRoute() {
  if (currentRoute() === ROUTE) queueMicrotask(renderLibrary);
  else stopTimer();
}

document.addEventListener("click", handleClick, true);
window.addEventListener("hashchange", handleRoute);
window.addEventListener("pageshow", handleRoute);
handleRoute();

window.PitchIQMentalImagery = Object.freeze({
  sessions: SESSIONS,
  render: renderLibrary,
  storageKey: STORAGE_KEY
});
