import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const journeyUrl = new URL("../js/app/academy-journey.js", import.meta.url);
const orientationUrl = new URL("../js/app/academy-orientation-interactive.js", import.meta.url);
const indexUrl = new URL("../index.html", import.meta.url);

async function source(url) {
  return readFile(url, "utf8");
}

test("identity completion routes directly to the canonical Academy welcome", async () => {
  const journey = await source(journeyUrl);
  assert.match(journey, /const targetHash = "#academy-trial"/);
  assert.doesNotMatch(journey, /const targetHash = "#academy-trials"/);
  assert.match(journey, /\.trial-shell \.trial-hero/);
});

test("the personalised welcome owns the single Start Orientation action", async () => {
  const orientation = await source(orientationUrl);
  assert.match(orientation, /const ORIENTATION_ROUTE = "academy-trial"/);
  assert.match(orientation, /button\.textContent = "Start Orientation →"/);
  assert.match(orientation, /button\.setAttribute\("data-complete-orientation", ""\)/);
});

test("legacy Learn the Tools route redirects to the canonical welcome", async () => {
  const orientation = await source(orientationUrl);
  assert.match(orientation, /const LEGACY_ORIENTATION_ROUTE = "academy-trials"/);
  assert.match(orientation, /window\.location\.replace/);
});

test("first-step back restores the welcome rather than creating a route loop", async () => {
  const orientation = await source(orientationUrl);
  assert.match(orientation, /function restoreWelcome\(\)/);
  assert.match(orientation, /window\.dispatchEvent\(new HashChangeEvent/);
  assert.doesNotMatch(orientation, /window\.location\.hash = "academy-trial";\s*return;/);
});

test("production cache keys load the consolidated Academy modules", async () => {
  const index = await source(indexUrl);
  assert.match(index, /academy-journey\.js\?v=sprint-c-academy-journey-consolidation-20260721/);
  assert.match(index, /academy-orientation-interactive\.js\?v=sprint-c-academy-journey-consolidation-20260721/);
});
