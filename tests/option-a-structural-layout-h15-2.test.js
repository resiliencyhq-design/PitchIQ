import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const renderer=fs.readFileSync(new URL("../js/app/home-adaptive-mission-h8.js",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../css/home-adaptive-mission-h8.css",import.meta.url),"utf8");

test("mission card renders the approved vertical Option A DOM order",()=>{
  const header=renderer.indexOf('class="home-mission-header"');
  const hero=renderer.indexOf('class="home-mission-hero"');
  const copy=renderer.indexOf('class="home-mission-copy"');
  const meta=renderer.indexOf('class="home-adaptive-mission-meta"');
  const action=renderer.indexOf("${actionMarkup(mission)}");
  assert.ok(header>=0&&hero>header&&copy>hero&&meta>copy&&action>meta);
});

test("legacy H15.1 layout class is removed when the card mounts",()=>{
  assert.match(renderer,/classList\.remove\("home-option-a-pixel-lock-h15-1"\)/);
  assert.match(renderer,/home-option-a-structure-h15-2/);
  assert.match(renderer,/h15Structure="option-a-v2"/);
});

test("card and all direct children are forced into one full-width column",()=>{
  assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(css,/\.home-option-a-structure-h15-2>\*/);
  assert.match(css,/grid-column:1\/-1!important/);
  assert.match(css,/width:100%!important/);
});

test("metadata and CTA follow content rather than occupying a side column",()=>{
  assert.match(css,/\.home-adaptive-mission-meta\{[\s\S]*grid-template-columns:\.85fr \.85fr 1\.3fr!important/);
  assert.match(css,/\.home-adaptive-mission-action\{[\s\S]*width:100%!important/);
});
