import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const indexUrl = new URL("../index.html", import.meta.url);
const runtimeUrl = new URL("../js/app/onboard-tactical-web.js", import.meta.url);
const cssUrl = new URL("../css/onboard-step2-tactical-web.css", import.meta.url);

async function source(url) {
  return readFile(url, "utf8");
}

test("production loads the approved position tactical web runtime", async () => {
  const index = await source(indexUrl);
  assert.match(index, /onboard-tactical-web\.js\?v=restore-position-tactical-web-20260724/);
  assert.match(index, /onboard-step2-tactical-web\.css\?v=restore-position-tactical-web-20260724/);
});

test("tactical web restores position links and explanatory caption", async () => {
  const runtime = await source(runtimeUrl);
  const css = await source(cssUrl);
  assert.match(runtime, /GK:\s*\['CB'\]/);
  assert.match(runtime, /both Centre Backs/);
  assert.match(runtime, /Links to/);
  assert.match(runtime, /tactical-web-svg/);
  assert.match(css, /\.tactical-web-line/);
  assert.match(css, /tacticalLineDraw/);
});
