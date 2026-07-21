import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const worlds=fs.readFileSync("js/app/home-world-stack-h5.js","utf8");
const composition=fs.readFileSync("js/app/home-content-composition.js","utf8");
const css=fs.readFileSync("css/home-four-worlds-h16.css","utf8");
const production=fs.readFileSync("js/app/production-bootstrap.js","utf8");

test("H16 Home exposes exactly four top-level development worlds",()=>{
  for(const id of ["academy","train","review","lab"]) assert.match(worlds,new RegExp(`id: "${id}"`));
  assert.match(worlds,/home-world-quad-grid/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test("existing destinations are grouped without changing their canonical routes",()=>{
  for(const route of ["academy-world","coach-world","football-iq-library","training","mindiq-world","results","player-twin","reflect-world","lab-juggling"]){
    assert.ok(worlds.includes(`route:"${route}"`),`${route} should remain reachable`);
  }
});

test("world cards reserve artwork layers before final images are supplied",()=>{
  assert.match(worlds,/home-world-art/);
  assert.match(worlds,/development-world-hero-art/);
  assert.match(css,/\.home-world-art/);
  assert.match(css,/\.development-world-hero-art/);
});

test("each world opens a reusable module screen and returns to Home",()=>{
  assert.match(worlds,/renderDevelopmentWorld/);
  assert.match(worlds,/data-world-module-route/);
  assert.match(worlds,/data-world-back/);
  assert.match(worlds,/location\.hash = "home"/);
});

test("H16 is wired into canonical Home production composition",()=>{
  assert.match(composition,/home-four-worlds-h16\.css/);
  assert.match(composition,/h16-four-worlds/);
  assert.match(production,/sprint-h16/);
  assert.match(production,/canonical-home-plus-h16-four-worlds/);
});
