import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("H7 exposes the four approved Academy worlds", async () => {
  const source = await read("js/app/home-world-stack-h5.js");
  assert.match(source, /Football IQ/);
  assert.match(source, /Technical Training/);
  assert.match(source, /Progress/);
  assert.match(source, /PitchIQ Lab/);
  assert.match(source, /h7-academy-worlds/);
});

test("existing canonical destinations remain intact", async () => {
  const source = await read("js/app/home-world-stack-h5.js");
  assert.match(source, /data-route=\"training\"/);
  assert.match(source, /data-route=\"results\"/);
  assert.match(source, /lab-juggling/);
});

test("Football IQ is lazy-loaded only for its route family", async () => {
  const loader = await read("js/app/football-iq-lazy-loader-h7.js");
  const index = await read("index.html");
  assert.match(loader, /football-iq-library/);
  assert.match(loader, /football-iq-module/);
  assert.match(loader, /football-iq-mission/);
  assert.match(loader, /import\("\.\/football-iq-library-w1-1\.js/);
  assert.match(index, /football-iq-lazy-loader-h7\.js/);
  assert.doesNotMatch(index, /src=\"js\/app\/football-iq-library-w1-1\.js/);
});

test("lazy Football IQ module renders the current hash immediately", async () => {
  const source = await read("js/app/football-iq-library-w1-1.js");
  assert.match(source, /renderCurrentFootballIqRoute\(\);\s*$/);
});

test("H7 keeps hero and Today's Mission composition ownership", async () => {
  const source = await read("js/app/home-content-composition.js");
  assert.match(source, /hero-locked/);
  assert.match(source, /todays-mission/);
  assert.match(source, /academy-worlds/);
  assert.match(source, /homeComposition = \"h7\"/);
});
