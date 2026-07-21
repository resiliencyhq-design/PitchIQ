import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../js/app/home-adaptive-mission-h8.js",import.meta.url),"utf8");
const styles=fs.readFileSync(new URL("../css/home-mission-overlay-h15-2-1.css",import.meta.url),"utf8");

test("removes the non-functional mission header arrow",()=>{
  assert.doesNotMatch(source,/home-mission-header-arrow/);
  assert.match(source,/<header class="home-mission-header"><span class="home-mission-header-label">Today's Mission<\/span><\/header>/);
});

test("renders mission copy inside the hero image container",()=>{
  const heroStart=source.indexOf('<div class="home-mission-hero">');
  const copyStart=source.indexOf('<div class="home-mission-copy">');
  const metaStart=source.indexOf('<div class="home-adaptive-mission-meta"');
  assert.ok(heroStart>=0);
  assert.ok(copyStart>heroStart);
  assert.ok(metaStart>copyStart);
  assert.match(source,/home-mission-hero-shade/);
  assert.match(source,/home-mission-eyebrow/);
});

test("keeps metadata and CTA below the compact hero",()=>{
  assert.match(styles,/\.home-mission-copy\{\s*position:absolute!important/);
  assert.match(styles,/\.home-mission-hero\{[\s\S]*min-height:290px/);
  assert.match(styles,/\.home-adaptive-mission-meta\{\s*min-height:68px/);
  assert.match(styles,/\.home-adaptive-mission-action\{\s*min-height:60px/);
});

test("loads the cache-busted compact overlay stylesheet",()=>{
  assert.match(source,/home-mission-overlay-h15-2-1\.css\?v=sprint-h15-2-1-mission-overlay-compact-20260721/);
});