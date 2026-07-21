const DEFAULT_IMAGE="assets/missions/football-iq/predict-next-play.svg";

const MISSION_CARD_CONTENT=Object.freeze({
  "predict-next-play":{description:"See the pass before everyone else.",image:DEFAULT_IMAGE,pathway:"Game Intelligence"},
  "scan-before-receiving":{description:"Know your next move before the ball arrives.",image:DEFAULT_IMAGE,pathway:"Scanning"},
  "find-the-free-player":{description:"Spot space before it disappears.",image:DEFAULT_IMAGE,pathway:"Game Intelligence"},
  "technical-foundation":{description:"Build cleaner touches with every repetition.",image:DEFAULT_IMAGE,pathway:"Technical Training"}
});

function clean(value,fallback=""){return typeof value==="string"&&value.trim()?value.trim():fallback;}

export function canonicalMissionCardModel(mission={}){
  const preset=MISSION_CARD_CONTENT[mission.id]||{};
  return {
    ...mission,
    description:clean(mission.cardDescription||preset.description||mission.focus,"One focused mission. One step forward."),
    image:clean(mission.image||mission.heroImage||preset.image,DEFAULT_IMAGE),
    pathway:clean(mission.pathway||preset.pathway||mission.world,"Development")
  };
}

export {DEFAULT_IMAGE,MISSION_CARD_CONTENT};