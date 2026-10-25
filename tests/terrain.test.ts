import assert from "node:assert/strict";
import { test } from "node:test";
import { moduleIds } from "../data/modules";
import { terrainSites } from "../data/terrain-layout";
import { computeExampleResult } from "../lib/module-results";
import type { ModuleResults } from "../lib/integration";
import { buildTerrain, contourPath, terrainField, terrainPeaks, terrainRoutes } from "../lib/terrain";

const allExamples = (): ModuleResults => Object.fromEntries(moduleIds.map((id) => [id, computeExampleResult(id)]));

test("terrain sites are unique, inside the canvas, and cover every scale shown on the map", () => {
  assert.equal(new Set(terrainSites.map((site) => `${site.module}:${site.scale}`)).size, terrainSites.length);
  for (const site of terrainSites) {
    assert.ok(site.x > 0 && site.x < 1 && site.y > 0 && site.y < 1, `${site.scale} out of bounds`);
  }
  const peaks = terrainPeaks(allExamples());
  assert.equal(peaks.length, 6 + 3 + 5 + 2);
});

test("peak heights are the deterministic scale scores, never invented", () => {
  const results = allExamples();
  const peaks = terrainPeaks(results);
  const emotion = results.emotion!;
  assert.equal(emotion.module, "emotion");
  for (const scale of emotion.profile.result.scales) {
    assert.equal(peaks.find((peak) => peak.id === `emotion:${scale.scale}`)?.score, scale.score);
  }
  const defense = results.defense!;
  if (defense.module === "defense") {
    for (const tier of defense.profile.tiers) assert.equal(peaks.find((peak) => peak.id === `defense:${tier.tier}`)?.score, tier.score);
  }
});

test("only completed modules raise peaks", () => {
  const peaks = terrainPeaks({ attachment: computeExampleResult("attachment") });
  assert.deepEqual(peaks.map((peak) => peak.module), ["attachment", "attachment"]);
  assert.deepEqual(terrainPeaks({}), []);
});

test("routes only connect existing peaks", () => {
  const results = allExamples();
  const peaks = terrainPeaks(results);
  const ids = new Set(peaks.map((peak) => peak.id));
  const routes = terrainRoutes(results, peaks);
  for (const route of routes) {
    assert.ok(ids.has(route.from) && ids.has(route.to));
    assert.notEqual(route.from, route.to);
  }
});

test("terrain model is deterministic and contours stay inside the canvas", () => {
  const a = buildTerrain(allExamples());
  const b = buildTerrain(allExamples());
  assert.deepEqual(a, b);
  assert.ok(a.contours.length >= 6);
  for (const contour of a.contours) {
    for (const match of contour.d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)) {
      const x = Number(match[1]);
      const y = Number(match[2]);
      assert.ok(x >= 0 && x <= a.width && y >= 0 && y <= a.height);
    }
  }
});

test("a single isolated bump yields one closed contour ring", () => {
  const cols = 20;
  const rows = 20;
  const field = new Float64Array((cols + 1) * (rows + 1));
  for (let j = 0; j <= rows; j += 1) for (let i = 0; i <= cols; i += 1) field[j * (cols + 1) + i] = Math.max(0, 1 - Math.hypot(i - 10, j - 10) / 6);
  const d = contourPath(field, cols, rows, 0.5, 200, 200);
  assert.equal(d.match(/M/g)?.length, 1);
  assert.ok(d.endsWith("Z"));
  assert.ok(terrainField([], 4, 4, 1).every((value) => value < 0.12));
});
