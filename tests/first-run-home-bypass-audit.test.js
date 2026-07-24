import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mainUrl = new URL("../js/app/main.js", import.meta.url);
const bindingUrl = new URL("../js/app/ui/bind-screen.js", import.meta.url);
const legacyLabUrl = new URL("../js/app/academy-trial.js", import.meta.url);

async function source(url){ return readFile(url, "utf8"); }

test("Step 5 hands off to the canonical Academy route instead of Home", async () => {
  const binding = await source(bindingUrl);
  assert.match(binding, /completeStep\("know-your-strengths"\)/);
  assert.match(binding, /PitchIQAcademy/);
  assert.match(binding, /window\.location\.hash = "academy-trial"/);
  assert.doesNotMatch(binding, /app\.goto\("home"\)/);
});

test("module Home handoff is blocked until first run is complete", async () => {
  const main = await source(mainUrl);
  assert.match(main, /const target = firstRun\.getEntryRoute\(\)/);
  assert.match(main, /if \(target !== "home"\)/);
  assert.match(main, /goto\(target\)/);
});

test("legacy juggling Lab cannot grant Academy completion", async () => {
  const lab = await source(legacyLabUrl);
  assert.doesNotMatch(lab, /pitchiqAcademyAccepted/);
  assert.doesNotMatch(lab, /window\.location\.reload\(\)/);
  assert.match(lab, /enterHomeFromModule/);
  assert.match(lab, /does not change Academy induction progress/);
});
