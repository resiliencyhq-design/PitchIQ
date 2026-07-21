import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const indexUrl = new URL("../index.html", import.meta.url);
const canonicalUrl = new URL("../js/app/academy-runtime-canonical.js", import.meta.url);
const loaderUrl = new URL("../js/app/academy-lab-loader.js", import.meta.url);

async function source(url){
  return readFile(url, "utf8");
}

test("production does not eagerly load the legacy trial runtime", async () => {
  const index = await source(indexUrl);
  assert.doesNotMatch(index, /<script[^>]+src="js\/app\/academy-trial\.js/);
  assert.match(index, /academy-lab-loader\.js\?v=sprint-c3-2-final-route-ownership-20260721/);
});

test("the experimental trial runtime is lazy-loaded only for lab-juggling", async () => {
  const loader = await source(loaderUrl);
  assert.match(loader, /const LAB_ROUTE = "lab-juggling"/);
  assert.match(loader, /if\(currentRoute\(\) !== LAB_ROUTE\) return Promise\.resolve\(false\)/);
  assert.match(loader, /import\("\.\/academy-trial\.js\?v=sprint-c3-2-lab-only-route-ownership-20260721"\)/);
});

test("the canonical Match Ready runtime owns the Start Orientation control", async () => {
  const canonical = await source(canonicalUrl);
  assert.match(canonical, /data-canonical-next>Start Orientation →/);
  assert.doesNotMatch(canonical, /data-trial-route="academy-trials">Enter the Academy/);
});

test("production build identifies the final route ownership consolidation", async () => {
  const index = await source(indexUrl);
  assert.match(index, /sprint-c3-2-final-route-ownership-20260721/);
});
