const PROFILE_KEYS = Object.freeze({
  name: "pitchiqPlayerName",
  number: "pitchiqJerseyNumber",
  position: "pitchiqSelectedPosition",
  style: "pitchiqPlayerStyle",
  avatar: "pitchiqPlayerAvatar"
});

const POSITION_OPTIONS = Object.freeze([
  ["GK", "Goalkeeper"],
  ["CB", "Centre Back"],
  ["LB", "Left Back"],
  ["RB", "Right Back"],
  ["CDM", "Defensive Midfielder"],
  ["CM", "Central Midfielder"],
  ["CAM", "Attacking Midfielder"],
  ["LW", "Left Wing"],
  ["RW", "Right Wing"],
  ["ST", "Striker"]
]);

const STYLE_OPTIONS = Object.freeze(["Creator", "Controller", "Finisher", "Engine", "Defender", "Sweeper"]);
const AVATAR_OPTIONS = Object.freeze([
  ["default", "Academy Player", "assets/players/player-avatar.png"]
]);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function optionButtons(options, selected) {
  return options.map(([value, label]) => `<button type="button" class="player-editor-choice${value === selected ? " active" : ""}" data-player-editor-choice="${escapeHtml(value)}">${escapeHtml(label)}</button>`).join("");
}

function styleButtons(selected) {
  return STYLE_OPTIONS.map(value => `<button type="button" class="player-editor-choice${value === selected ? " active" : ""}" data-player-editor-choice="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join("");
}

function avatarButtons(selected) {
  return AVATAR_OPTIONS.map(([value, label, src]) => `<button type="button" class="player-editor-avatar${value === selected ? " active" : ""}" data-player-editor-choice="${escapeHtml(value)}"><img src="${escapeHtml(src)}" alt=""><span>${escapeHtml(label)}</span></button>`).join("");
}

function editorMarkup(field, profile) {
  const value = profile[field] ?? "";
  const labels = { name: "Edit name", number: "Edit number", position: "Edit position", style: "Edit player style", avatar: "Change avatar" };
  let body = "";

  if (field === "name") body = `<label class="player-editor-field"><span>Player name</span><input id="playerEditorInput" type="text" maxlength="18" value="${escapeHtml(value)}" autocomplete="name"></label>`;
  if (field === "number") body = `<label class="player-editor-field"><span>Jersey number</span><input id="playerEditorInput" type="number" min="1" max="99" inputmode="numeric" value="${escapeHtml(value || 1)}"></label>`;
  if (field === "position") body = `<div class="player-editor-choice-grid" role="group" aria-label="Choose position">${optionButtons(POSITION_OPTIONS, value)}</div>`;
  if (field === "style") body = `<div class="player-editor-choice-grid" role="group" aria-label="Choose player style">${styleButtons(value)}</div>`;
  if (field === "avatar") body = `<div class="player-editor-avatar-grid" role="group" aria-label="Choose avatar">${avatarButtons(value || "default")}</div>`;

  return `<aside class="player-editor-panel" id="playerEditorPanel" data-player-editor-field="${escapeHtml(field)}" aria-label="${escapeHtml(labels[field])}"><div class="player-editor-card"><header><div><span class="kicker">Player profile</span><h2>${escapeHtml(labels[field])}</h2></div><button type="button" data-player-editor-close aria-label="Close editor">×</button></header>${body}<p class="player-editor-error" id="playerEditorError" role="alert"></p><div class="player-editor-actions"><button type="button" data-player-editor-close>Cancel</button><button type="button" class="primary" data-player-editor-save>Save changes</button></div></div></aside>`;
}

function profileFromState(state) {
  return {
    name: state.profile?.name || localStorage.getItem(PROFILE_KEYS.name) || "",
    number: state.profile?.number || localStorage.getItem(PROFILE_KEYS.number) || "1",
    position: state.profile?.position || localStorage.getItem(PROFILE_KEYS.position) || "Winger",
    style: state.profile?.style || localStorage.getItem(PROFILE_KEYS.style) || "Creator",
    avatar: state.profile?.avatar || localStorage.getItem(PROFILE_KEYS.avatar) || "default"
  };
}

function persistCompatibilityKeys(profile) {
  Object.entries(PROFILE_KEYS).forEach(([field, key]) => localStorage.setItem(key, String(profile[field] ?? "")));
}

function readEditorValue(panel, field) {
  if (["position", "style", "avatar"].includes(field)) return panel.querySelector("[data-player-editor-choice].active")?.dataset.playerEditorChoice || "";
  return panel.querySelector("#playerEditorInput")?.value?.trim() || "";
}

function validate(field, value) {
  if (field === "name" && !value) return "Enter a player name.";
  if (field === "number") {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 1 || number > 99) return "Choose a jersey number from 1 to 99.";
  }
  if (["position", "style", "avatar"].includes(field) && !value) return "Choose an option.";
  return "";
}

export function createPlayerProfileEditor({ getState, saveState, rerenderPlayer, notify, onPositionChanged }) {
  function closeEditor() {
    document.getElementById("playerEditorPanel")?.remove();
  }

  function openEditor(field) {
    const state = getState();
    const profile = profileFromState(state);
    closeEditor();
    document.body.insertAdjacentHTML("beforeend", editorMarkup(field, profile));
    const panel = document.getElementById("playerEditorPanel");
    panel?.querySelector("#playerEditorInput")?.focus();
  }

  function selectChoice(button) {
    const panel = button.closest("#playerEditorPanel");
    panel?.querySelectorAll("[data-player-editor-choice]").forEach(choice => choice.classList.toggle("active", choice === button));
  }

  function saveEditor() {
    const panel = document.getElementById("playerEditorPanel");
    if (!panel) return;
    const field = panel.dataset.playerEditorField;
    const value = readEditorValue(panel, field);
    const error = validate(field, value);
    const errorNode = panel.querySelector("#playerEditorError");
    if (error) {
      if (errorNode) errorNode.textContent = error;
      return;
    }

    const state = getState();
    const previousPosition = state.profile?.position;
    state.profile ||= {};
    state.profile[field] = field === "number" ? String(Number(value)) : value;
    const profile = profileFromState(state);
    persistCompatibilityKeys(profile);
    saveState(state);
    closeEditor();
    if (field === "position" && previousPosition !== value) onPositionChanged?.();
    rerenderPlayer();
    notify?.("Player updated");
  }

  function handleClick(event) {
    const option = event.target.closest?.("[data-player-option]");
    if (option) {
      event.preventDefault();
      const field = option.dataset.playerOption;
      if (["name", "number", "position", "style", "avatar"].includes(field)) openEditor(field);
      if (field === "feedback") {
        window.location.href = "mailto:?subject=PitchIQ%20Feedback";
      }
      return;
    }

    const choice = event.target.closest?.("[data-player-editor-choice]");
    if (choice) {
      event.preventDefault();
      selectChoice(choice);
      return;
    }

    if (event.target.closest?.("[data-player-editor-close]")) {
      event.preventDefault();
      closeEditor();
      return;
    }

    if (event.target.closest?.("[data-player-editor-save]")) {
      event.preventDefault();
      saveEditor();
    }
  }

  document.addEventListener("click", handleClick, true);
  return Object.freeze({ openEditor, closeEditor, destroy: () => document.removeEventListener("click", handleClick, true) });
}
