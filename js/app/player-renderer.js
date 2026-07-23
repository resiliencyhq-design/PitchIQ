import { xpNeed } from "../game/progression.js";
import { footballIQScore, playerOverall } from "./player-metrics.js";

const POSITION_LABELS = {
  ST: "Striker",
  LW: "Left Wing",
  RW: "Right Wing",
  CAM: "Attacking Midfielder",
  CM: "Central Midfielder",
  CDM: "Defensive Midfielder",
  LB: "Left Back",
  RB: "Right Back",
  CB: "Centre Back",
  GK: "Goalkeeper",
  Winger: "Winger",
  Striker: "Striker",
  FB: "Full Back"
};

function positionLabel(position="Winger"){
  return POSITION_LABELS[position] || position || "Winger";
}

export function renderPlayer(state){
  const need=xpNeed(state.game.level);
  const pct=Math.min(100,Math.round(state.game.xp/need*100));
  const iq=footballIQScore(state);
  const number=localStorage.getItem("pitchiqJerseyNumber")||"—";
  const style=localStorage.getItem("pitchiqPlayerStyle")||"Creator";
  return `<section class="screen app player-v3 player-v4 active" id="player"><div class="player-v3-wrap"><article class="player-v3-identity"><div class="player-v3-avatar"><img src="assets/players/player-avatar.png" alt="${state.profile.name||"Player"} avatar"></div><div class="player-v3-overall"><small>Overall</small><b>${playerOverall(state)}</b></div><div class="player-v3-iq"><small>Football IQ</small><b>${iq??"--"}</b></div><div class="player-v3-progress"><span>PitchIQ Level ${state.game.level}</span><div class="xpbar"><i style="width:${pct}%"></i></div><small>${state.game.xp} / ${need} XP</small></div></article><section class="player-v4-details" aria-label="Player identity details"><header><span>Player identity</span><small>Your football profile</small></header><div class="player-v4-detail-grid"><article><small>Name</small><b>${state.profile.name||"Player"}</b></article><article><small>Number</small><b>${number}</b></article><article><small>Position</small><b>${positionLabel(state.profile.position)}</b></article><article><small>Player style</small><b>${style}</b></article></div></section><section class="player-v3-management player-v4-management"><span>Manage player</span><p>Edit identity and account options without leaving the Player tab.</p><button data-action="player-settings-open">Open player options</button></section><aside class="player-settings-panel" id="playerSettingsPanel" hidden aria-label="Player options"><div class="player-settings-card"><header><div><span class="kicker">Manage player</span><h2>${state.profile.name||"Player"}</h2></div><button data-action="player-settings-close" aria-label="Close player options">×</button></header><div class="player-settings-actions"><button data-player-option="name">Edit name</button><button data-player-option="number">Edit number</button><button data-player-option="position">Edit position</button><button data-player-option="style">Edit player style</button><button data-player-option="avatar">Change avatar</button><button data-player-option="password" disabled>Change password <small>Account feature</small></button><button data-player-option="feedback">Send feedback</button><button class="player-reset-button" data-player-option="reset">Reset player</button></div></div></aside></div></section>`;
}
