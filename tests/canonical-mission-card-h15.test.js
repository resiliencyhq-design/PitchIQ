import test from "node:test";
import assert from "node:assert/strict";
import {canonicalMissionCardModel,DEFAULT_IMAGE} from "../js/data/mission-card-content-h15.js";

test("canonical model supplies image, motivation and pathway defaults",()=>{
  const card=canonicalMissionCardModel({id:"predict-next-play",title:"Predict the Next Play",minutes:5,xp:15});
  assert.equal(card.description,"See the pass before everyone else.");
  assert.equal(card.pathway,"Game Intelligence");
  assert.equal(card.image,DEFAULT_IMAGE);
});

test("mission-specific content overrides the image bank preset without changing the component",()=>{
  const card=canonicalMissionCardModel({id:"predict-next-play",cardDescription:"Read the game earlier.",heroImage:"assets/missions/custom.webp",pathway:"Tactical Vision"});
  assert.equal(card.description,"Read the game earlier.");
  assert.equal(card.image,"assets/missions/custom.webp");
  assert.equal(card.pathway,"Tactical Vision");
});

test("unknown missions remain renderable through safe canonical fallbacks",()=>{
  const card=canonicalMissionCardModel({id:"future-mission",focus:"Keep developing."});
  assert.equal(card.description,"Keep developing.");
  assert.equal(card.image,DEFAULT_IMAGE);
  assert.equal(card.pathway,"Development");
});
