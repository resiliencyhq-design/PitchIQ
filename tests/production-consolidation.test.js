import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const indexUrl = new URL("../index.html", import.meta.url);
const bootstrapUrl = new URL("../js/app/production-bootstrap.js", import.meta.url);

async function source(url) {
  return readFile(url, "utf8");
}

test("production loads the consolidation bootstrap", async () => {
  const index = await source(indexUrl);
  assert.match(index, /js\/app\/production-bootstrap\.js\?v=sprint-b-production-consolidation-20260721/);
});

test("legacy Academy Trial reload owner is not loaded", async () => {
  const index = await source(indexUrl);
  assert.doesNotMatch(index, /academy-trial-home-return\.js/);
});

test("bootstrap activates the approved Home composition", async () => {
  const bootstrap = await source(bootstrapUrl);
  assert.match(bootstrap, /import \{ applyHomeContentComposition \} from "\.\/home-content-composition\.js/);
  assert.match(bootstrap, /applyHomeContentComposition\(document\)/);
});

test("Academy Home return delegates to canonical navigation without reload", async () => {
  const bootstrap = await source(bootstrapUrl);
  assert.match(bootstrap, /#nav \[data-route="home"\]/);
  assert.match(bootstrap, /control\.click\(\)/);
  assert.doesNotMatch(bootstrap, /window\.location\.reload|location\.reload/);
});
