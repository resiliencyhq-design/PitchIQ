const app = document.getElementById("app");
const nav = document.getElementById("nav");

let stream = null;
let countdownTimer = null;
let previousMarkup = "";
let previousNavVisible = false;
let mounted = false;

function cameraSupported(){
  return Boolean(navigator.mediaDevices?.getUserMedia);
}

function stopCountdown(){
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = null;
}

export function stopCamera(){
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  const video = document.getElementById("autoJugglerVideo");
  if (video) video.srcObject = null;
  document.body.classList.remove("auto-juggler-camera-active");
}

function setStatus(message, state="idle"){
  const status = document.getElementById("autoJugglerStatus");
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
}

function showPermissionHelp(error){
  const denied = error?.name === "NotAllowedError" || error?.name === "SecurityError";
  setStatus(
    denied
      ? "Camera access is blocked. Allow camera access in Safari Settings, then try again."
      : "The camera could not start. Check that no other app is using it, then try again.",
    "error"
  );
}

export async function startCamera(){
  if (!cameraSupported()) {
    setStatus("This browser does not support camera access.", "error");
    return false;
  }

  stopCamera();
  setStatus("Starting rear camera…", "loading");

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio:false,
      video:{
        facingMode:{ideal:"environment"},
        width:{ideal:1280},
        height:{ideal:720}
      }
    });
    const video = document.getElementById("autoJugglerVideo");
    if (!video) {
      stopCamera();
      return false;
    }
    video.srcObject = stream;
    await video.play();
    document.body.classList.add("auto-juggler-camera-active");
    setStatus("Camera ready. Keep your full body and ball inside the frame.", "ready");
    document.getElementById("autoJugglerStart")?.removeAttribute("disabled");
    return true;
  } catch (error) {
    stopCamera();
    showPermissionHelp(error);
    return false;
  }
}

function renderShell(){
  return `<section class="screen app auto-juggler-shell active" id="autoJuggler" aria-labelledby="autoJugglerTitle">
    <header class="auto-juggler-header">
      <button type="button" class="auto-juggler-back" data-auto-juggler-action="back" aria-label="Return to Home">←</button>
      <div>
        <span>PitchIQ Lab</span>
        <h1 id="autoJugglerTitle">Auto Juggler</h1>
      </div>
      <span class="auto-juggler-beta">BETA</span>
    </header>

    <main class="auto-juggler-main">
      <div class="auto-juggler-video-wrap">
        <video id="autoJugglerVideo" playsinline muted autoplay></video>
        <div class="auto-juggler-frame" aria-hidden="true"><span></span></div>
        <div class="auto-juggler-countdown" id="autoJugglerCountdown" hidden></div>
      </div>

      <p id="autoJugglerStatus" class="auto-juggler-status" data-state="idle" role="status" aria-live="polite">
        Place your phone upright, stand back, and keep your full body and ball visible.
      </p>

      <ol class="auto-juggler-setup">
        <li><b>1</b><span>Prop the phone upright</span></li>
        <li><b>2</b><span>Keep the ball in frame</span></li>
        <li><b>3</b><span>Start after the countdown</span></li>
      </ol>

      <div class="auto-juggler-actions">
        <button type="button" class="auto-juggler-secondary" data-auto-juggler-action="camera">ENABLE CAMERA</button>
        <button type="button" class="primary mega" id="autoJugglerStart" data-auto-juggler-action="countdown" disabled>START ATTEMPT</button>
      </div>
      <p class="auto-juggler-privacy">Video stays on this device and is not uploaded or saved.</p>
    </main>
  </section>`;
}

function beginCountdown(){
  if (!stream) return setStatus("Enable the camera first.", "error");
  stopCountdown();
  const overlay = document.getElementById("autoJugglerCountdown");
  const start = document.getElementById("autoJugglerStart");
  if (!overlay) return;
  if (start) start.disabled = true;
  overlay.hidden = false;
  const sequence = ["3", "2", "1", "GO"];
  let index = 0;
  overlay.textContent = sequence[index];
  countdownTimer = setInterval(() => {
    index += 1;
    if (index < sequence.length) {
      overlay.textContent = sequence[index];
      return;
    }
    stopCountdown();
    setTimeout(() => {
      if (overlay) overlay.hidden = true;
      if (start) start.disabled = false;
      setStatus("Camera shell validated. Automatic counting arrives in Sprint 10.0B.", "ready");
    }, 650);
  }, 850);
}

function restoreHome(){
  stopCountdown();
  stopCamera();
  mounted = false;
  document.body.classList.remove("auto-juggler-open");
  if (previousMarkup) app.innerHTML = previousMarkup;
  if (nav) nav.classList.toggle("visible", previousNavVisible);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function mountAutoJuggler(){
  if (!app || mounted) return;
  mounted = true;
  previousMarkup = app.innerHTML;
  previousNavVisible = nav?.classList.contains("visible") || false;
  document.body.classList.add("auto-juggler-open");
  if (nav) nav.classList.remove("visible");
  app.innerHTML = renderShell();
  app.scrollTop = 0;
}

function injectLabTile(){
  const grid = document.querySelector("#home .home-actions-grid");
  if (!grid || grid.querySelector("[data-auto-juggler-launch]")) return;
  const tile = document.createElement("button");
  tile.type = "button";
  tile.className = "home-action-card auto-juggler-home-card";
  tile.dataset.autoJugglerLaunch = "true";
  tile.innerHTML = `<b>◉</b><span>PitchIQ Lab</span><small>Auto Juggler</small>`;
  grid.appendChild(tile);
}

document.addEventListener("click", event => {
  const launch = event.target.closest("[data-auto-juggler-launch]");
  if (launch) {
    event.preventDefault();
    mountAutoJuggler();
    return;
  }

  const action = event.target.closest("[data-auto-juggler-action]")?.dataset.autoJugglerAction;
  if (!action) return;
  if (action === "back") restoreHome();
  if (action === "camera") startCamera();
  if (action === "countdown") beginCountdown();
});

window.addEventListener("pagehide", () => {
  stopCountdown();
  stopCamera();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopCamera();
});

new MutationObserver(injectLabTile).observe(app, {childList:true, subtree:true});
injectLabTile();
