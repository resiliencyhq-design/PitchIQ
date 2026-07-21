import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const cssUrl=new URL("../css/home-adaptive-mission-h8.css",import.meta.url);
const moduleUrl=new URL("../js/app/home-adaptive-mission-h8.js",import.meta.url);

test("Option A card uses one staged hero, one continuous metadata strip and a full-width CTA",async()=>{
  const [css,module]=await Promise.all([readFile(cssUrl,"utf8"),readFile(moduleUrl,"utf8")]);
  assert.match(module,/home-mission-stage/);
  assert.match(module,/home-mission-kicker/);
  assert.match(module,/home-adaptive-mission-meta/);
  assert.match(module,/home-adaptive-mission-action/);
  assert.match(css,/grid-template-columns:\.9fr \.9fr 1\.45fr/);
  assert.match(css,/min-height:272px/);
  assert.match(css,/min-height:64px/);
});

test("Option A layout keeps content-driven mission fields and existing routes",async()=>{
  const module=await readFile(moduleUrl,"utf8");
  for(const field of ["mission.image","mission.title","mission.description","mission.minutes","mission.xp","mission.pathway"]){
    assert.ok(module.includes(field),`${field} must remain data driven`);
  }
  assert.match(module,/data-h8-open-football-iq/);
  assert.match(module,/data-action="start-mission-training"/);
});
