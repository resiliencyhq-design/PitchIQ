const ranks = [
  ["Grassroots", 0],
  ["Division 2", 250],
  ["Division 1", 600],
  ["Academy", 1200],
  ["NPL", 2200],
  ["A-League", 4000],
  ["Champions League", 7000],
  ["Ballon d'Or", 11000]
];

const positionCues = {
  cb: ["CHECK", "SWITCH", "STEP", "DROP", "LEFT", "RIGHT"],
  fb: ["OVERLAP", "RECOVER", "LINE", "INSIDE", "CROSS", "LEFT"],
  cm: ["SCAN", "TURN", "BOUNCE", "SWITCH", "SET", "FORWARD"],
  winger: ["INSIDE", "OUTSIDE", "DRIVE", "CROSS", "SHOOT", "CUT"],
  striker: ["SPIN", "SET", "SHOOT", "PRESS", "CHECK", "FIRST TIME"]
};

const colours = [
  { cue: "🔴", answer: ["red"] },
  { cue: "🔵", answer: ["blue"] },
  { cue: "🟢", answer: ["green"] },
  { cue: "🟡", answer: ["yellow"] },
  { cue: "⚪", answer: ["white"] },
  { cue: "🟣", answer: ["purple"] }
];

const arrows = [
  { cue: "←", answer: ["left"] },
  { cue: "→", answer: ["right"] },
  { cue: "↑", answer: ["up", "forward"] },
  { cue: "↓", answer: ["down", "back"] }
];

let state = {
  active: false,
  expected: [],
  score: 0,
  sessionXp: 0,
  combo: 1,
  timeLeft: 60,
  timer: null,
  cueTimer: null,
  recognition: null,
  listening: false
};

function progress() {
  return JSON.parse(localStorage.getItem("soccerIQVoiceProgress") || '{"xp":0,"streak":0,"lastDay":"","sessions":0}');
}

function saveProgress(p) {
  localStorage.setItem("soccerIQVoiceProgress", JSON.stringify(p));
}

function rankFor(xp) {
  return [...ranks].reverse().find(r => xp >= r[1])[0];
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  refresh();
}

function refresh() {
  const p = progress();
  document.getElementById("totalXp").textContent = p.xp;
  document.getElementById("rank").textContent = rankFor(p.xp);
  document.getElementById("streak").textContent = p.streak;
  renderCareer();
}

function renderCareer() {
  const list = document.getElementById("careerList");
  if (!list) return;
  const p = progress();
  list.innerHTML = "";
  ranks.forEach(([name, xp]) => {
    const row = document.createElement("div");
    row.className = "rankRow " + (p.xp >= xp ? "unlocked" : "");
    row.innerHTML = `<b>${p.xp >= xp ? "✅" : "🔒"} ${name}</b><span>${xp} XP</span>`;
    list.appendChild(row);
  });
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function normalize(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function numberWords(n) {
  const words = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen"];
  return [String(n), words[n]].filter(Boolean);
}

function makeMathCue() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 7) + 1;
  if (Math.random() > 0.5) {
    return { cue: `${a} + ${b}`, answer: numberWords(a + b) };
  }
  return { cue: `${a + b} - ${b}`, answer: numberWords(a) };
}

function makeDecisionCue() {
  const rules = [
    { cue: "🔴", action: "PASS" },
    { cue: "🔵", action: "TURN" },
    { cue: "🟢", action: "DRIVE" },
    { cue: "🟡", action: "SHOOT" }
  ];
  const chosen = randomItem(rules);
  document.getElementById("missionText").innerHTML = "🔴 PASS &nbsp; 🔵 TURN &nbsp; 🟢 DRIVE &nbsp; 🟡 SHOOT";
  return { cue: chosen.cue, answer: [chosen.action.toLowerCase()] };
}

function makeCue() {
  const mode = document.getElementById("mode").value;
  const position = document.getElementById("position").value;
  document.getElementById("missionText").textContent = "Call out the answer";

  let item;

  if (mode === "voice") item = randomItem([...colours, ...arrows]);
  if (mode === "maths") item = makeMathCue();
  if (mode === "decision") item = makeDecisionCue();
  if (mode === "mixed") {
    const posCue = randomItem(positionCues[position]);
    item = randomItem([
      ...colours,
      ...arrows,
      makeMathCue(),
      { cue: posCue, answer: [posCue.toLowerCase().replace("first time", "first time")] }
    ]);
  }

  state.expected = item.answer.map(normalize);
  const cueEl = document.getElementById("cue");
  cueEl.textContent = item.cue;
  document.getElementById("heard").textContent = "Listening...";
  beep(880, 0.08);
  vibrate([35]);

  if (state.active) {
    clearTimeout(state.cueTimer);
    state.cueTimer = setTimeout(() => {
      scoreWrong(true);
      makeCue();
    }, intervalForDifficulty());
  }
}

function intervalForDifficulty() {
  const d = document.getElementById("difficulty").value;
  if (d === "easy") return 5200;
  if (d === "medium") return 4100;
  if (d === "hard") return 3100;
  return 2300;
}

function startSession() {
  state.active = true;
  state.score = 0;
  state.sessionXp = 0;
  state.combo = 1;
  state.timeLeft = parseInt(document.getElementById("duration").value, 10);

  document.getElementById("score").textContent = "0";
  document.getElementById("combo").textContent = "1";
  document.getElementById("timeLeft").textContent = state.timeLeft;

  showScreen("game");
  speak("Three, two, one, scan");
  makeCue();
  startSpeech();

  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    document.getElementById("timeLeft").textContent = state.timeLeft;
    if (state.timeLeft <= 0) endSession();
  }, 1000);
}

function startSpeech() {
  if (!document.getElementById("voiceToggle").checked) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById("heard").textContent = "Voice not supported here. Use manual buttons.";
    return;
  }

  state.recognition = new SpeechRecognition();
  state.recognition.lang = "en-AU";
  state.recognition.continuous = true;
  state.recognition.interimResults = false;

  state.recognition.onresult = (event) => {
    const last = event.results[event.results.length - 1][0].transcript;
    handleSpeech(last);
  };

  state.recognition.onerror = () => {
    if (state.active) restartSpeechSoon();
  };

  state.recognition.onend = () => {
    if (state.active) restartSpeechSoon();
  };

  try {
    state.recognition.start();
    state.listening = true;
  } catch (e) {}
}

function restartSpeechSoon() {
  setTimeout(() => {
    if (!state.active || !state.recognition) return;
    try { state.recognition.start(); } catch (e) {}
  }, 400);
}

function handleSpeech(transcript) {
  const heard = normalize(transcript);
  document.getElementById("heard").textContent = `Heard: ${transcript}`;

  const correct = state.expected.some(ans => {
    return heard === ans || heard.includes(ans);
  });

  if (correct) {
    scoreCorrect();
    makeCue();
  } else {
    // no penalty immediately for possible mis-hearing
    document.getElementById("heard").textContent = `Heard: ${transcript} — say again`;
  }
}

function scoreCorrect() {
  if (!state.active) return;
  clearTimeout(state.cueTimer);

  const gain = 10 * state.combo;
  state.score += gain;
  state.sessionXp += gain;
  state.combo = Math.min(state.combo + 1, 8);

  document.getElementById("score").textContent = state.score;
  document.getElementById("combo").textContent = state.combo;
  flash("correctFlash");
  cheer();

  clearTimeout(state.cueTimer);
  state.cueTimer = setTimeout(makeCue, 450);
}

function scoreWrong(timeout=false) {
  if (!state.active) return;

  state.score = Math.max(0, state.score - 5);
  state.combo = 1;
  document.getElementById("score").textContent = state.score;
  document.getElementById("combo").textContent = state.combo;
  flash("wrongFlash");
  gasp();
  if (!timeout) makeCue();
}

function endSession() {
  if (!state.active) return;
  state.active = false;

  clearInterval(state.timer);
  clearTimeout(state.cueTimer);
  try { if (state.recognition) state.recognition.stop(); } catch(e) {}

  const p = progress();
  const today = new Date().toISOString().slice(0,10);
  if (p.lastDay !== today) {
    p.streak = isYesterday(p.lastDay, today) ? p.streak + 1 : 1;
    p.lastDay = today;
  }
  p.sessions += 1;
  p.xp += state.sessionXp;
  saveProgress(p);

  document.getElementById("finalXp").textContent = `${state.sessionXp} XP`;
  document.getElementById("resultMessage").textContent =
    state.sessionXp > 350 ? "Elite scanning session." :
    state.sessionXp > 180 ? "Strong work. Keep the streak alive." :
    "Good start. Try again and beat your score.";

  speak("Session complete");
  showScreen("result");
}

function isYesterday(last, today) {
  if (!last) return false;
  const d1 = new Date(last);
  const d2 = new Date(today);
  return (d2 - d1) / 86400000 === 1;
}

function flash(className) {
  const cue = document.getElementById("cue");
  cue.classList.remove("correctFlash", "wrongFlash");
  void cue.offsetWidth;
  cue.classList.add(className);
}

function beep(freq, dur) {
  if (!document.getElementById("soundToggle")?.checked) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch(e) {}
}

function cheer() {
  beep(980, 0.08);
  setTimeout(() => beep(1320, 0.08), 90);
  vibrate([25, 30, 25]);
}

function gasp() {
  beep(180, 0.18);
  vibrate([120]);
}

function vibrate(pattern) {
  if (document.getElementById("hapticToggle")?.checked && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

function speak(text) {
  if (!document.getElementById("soundToggle")?.checked) return;
  try {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1.05;
    msg.pitch = 1.0;
    window.speechSynthesis.speak(msg);
  } catch(e) {}
}

function resetProgress() {
  if (confirm("Reset all Soccer IQ progress?")) {
    localStorage.removeItem("soccerIQVoiceProgress");
    refresh();
    showScreen("home");
  }
}

refresh();
