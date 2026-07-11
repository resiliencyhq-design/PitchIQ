/* STEP 2 - Tactical Web Chemistry Lines */

const tacticalLinks = {
  LB: ["CB", "CM", "LW"],
  RB: ["CB", "CDM", "RW"],
  CB: ["GK", "CB", "LB", "RB", "CDM"],
  GK: ["CB"],
  CM: ["CAM", "CDM", "CB", "LW", "RW"],
  CDM: ["CB", "CM", "CAM", "RB"],
  CAM: ["ST", "CM", "CDM", "LW", "RW"],
  LW: ["LB", "CM", "CAM", "ST"],
  RW: ["RB", "CDM", "CAM", "ST"],
  ST: ["LW", "RW", "CAM"]
};

const tacticalLabels = {
  GK:"Goalkeeper",
  LB:"Left Back",
  CB:"Centre Back",
  RB:"Right Back",
  CDM:"Defensive Midfielder",
  CM:"Central Midfielder",
  CAM:"Attacking Midfielder",
  LW:"Left Wing",
  RW:"Right Wing",
  ST:"Striker"
};

let tacticalSelected = null;
let tacticalTimer = null;

function tacticalCode(marker){
  return marker?.dataset?.position || marker?.dataset?.pos || "";
}

function tacticalLabel(code){
  return tacticalLabels[code] || code;
}

function tacticalCenter(layer, marker){
  const layerRect = layer.getBoundingClientRect();
  const markerRect = marker.getBoundingClientRect();
  return {
    x: markerRect.left - layerRect.left + markerRect.width / 2,
    y: markerRect.top - layerRect.top + markerRect.height / 2
  };
}

function tacticalSvg(layer){
  let svg = layer.querySelector(".tactical-web-svg");
  if(!svg){
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("tactical-web-svg");
    svg.setAttribute("aria-hidden", "true");
    layer.prepend(svg);
  }
  return svg;
}

function tacticalTargets(markers, selected, code){
  const selectedCode = tacticalCode(selected);
  const selectedSlot = selected.dataset.slot || "";
  const matches = markers.filter(marker => marker !== selected && tacticalCode(marker) === code);

  if(code === "CB"){
    if(selectedCode === "CB" || selectedCode === "GK") return matches;
    const preferred = (selectedSlot === "rb" || selectedCode === "RB" || selectedCode === "CDM") ? "cb2" : "cb1";
    const first = matches.filter(marker => marker.dataset.slot === preferred).slice(0, 1);
    if(first.length) return first;
    return matches.slice(0, 1);
  }

  return matches.slice(0, 1);
}

function tacticalLinkedText(codes, selectedCode){
  if(selectedCode === "GK") return "both Centre Backs";
  const labels = codes.map(tacticalLabel);
  if(labels.length <= 1) return labels[0] || "key teammates";
  return labels.slice(0, -1).join(", ") + " and " + labels[labels.length - 1];
}

function tacticalUpdateCaption(code, links){
  const confirm = document.querySelector("#positionConfirm");
  if(!confirm) return;
  confirm.classList.add("tactical-web-caption");
  confirm.innerHTML = `<span>Selected position</span><b>${tacticalLabel(code)}</b><small>Links to ${tacticalLinkedText(links, code)}</small>`;
}

function drawTacticalWeb(selected, options = {}){
  const layer = document.querySelector('.onboard-step[data-onboard-step="2"] .position-game-layer');
  const markers = Array.from(document.querySelectorAll('.onboard-step[data-onboard-step="2"] .position-marker'));
  if(!layer || !markers.length || !selected) return;

  const svg = tacticalSvg(layer);
  const code = tacticalCode(selected);
  const links = tacticalLinks[code] || [];

  const drawNow = () => {
    const start = tacticalCenter(layer, selected);
    svg.classList.remove("is-fading");
    svg.innerHTML = "";
    markers.forEach(marker => marker.classList.remove("is-selected", "is-linked"));
    selected.classList.add("is-selected");

    let lineIndex = 0;
    links.forEach(linkCode => {
      tacticalTargets(markers, selected, linkCode).forEach(linked => {
        linked.classList.add("is-linked");
        const end = tacticalCenter(layer, linked);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.classList.add("tactical-web-line");
        line.style.animationDelay = `${lineIndex * 110}ms`;
        line.setAttribute("x1", String(start.x));
        line.setAttribute("y1", String(start.y));
        line.setAttribute("x2", String(end.x));
        line.setAttribute("y2", String(end.y));
        svg.appendChild(line);
        lineIndex += 1;
      });
    });

    tacticalUpdateCaption(code, links);
  };

  if(options.fade !== false && svg.childNodes.length){
    svg.classList.add("is-fading");
    window.setTimeout(drawNow, 150);
    return;
  }

  drawNow();
}

function tacticalRedraw(){
  if(!tacticalSelected) return;
  clearTimeout(tacticalTimer);
  tacticalTimer = setTimeout(() => drawTacticalWeb(tacticalSelected, { fade:false }), 120);
}

document.addEventListener("click", event => {
  const marker = event.target.closest && event.target.closest('.onboard-step[data-onboard-step="2"] .position-marker');
  if(!marker) return;
  tacticalSelected = marker;
  setTimeout(() => drawTacticalWeb(marker), 260);
});

window.addEventListener("resize", tacticalRedraw, { passive:true });
window.addEventListener("orientationchange", tacticalRedraw, { passive:true });

setTimeout(() => {
  const selected = document.querySelector('.onboard-step[data-onboard-step="2"] .position-marker.selected, .onboard-step[data-onboard-step="2"] .position-marker.active');
  if(selected){
    tacticalSelected = selected;
    drawTacticalWeb(selected, { fade:false });
  }
}, 720);