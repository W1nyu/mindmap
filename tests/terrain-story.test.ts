import assert from "node:assert/strict";
import { test } from "node:test";
import { moduleIds } from "../data/modules";
import type { ModuleResults } from "../lib/integration";
import { computeExampleResult } from "../lib/module-results";
import { buildTerrain, type TerrainPeak } from "../lib/terrain";
import { terrainStory } from "../lib/terrain-story";

const allExamples = (): ModuleResults => Object.fromEntries(moduleIds.map((id) => [id, computeExampleResult(id)]));
const peak = (id: string, module: TerrainPeak["module"], score: number, label = id): TerrainPeak => ({ id: `${module}:${id}`, module, scale: id, label, score, x: 0.5, y: 0.5 });

test("story is deterministic and every number it mentions comes from peak scores or their differences", () => {
  const model = buildTerrain(allExamples());
  const story = terrainStory(model.peaks, model.routes);
  assert.deepEqual(story, terrainStory(model.peaks, model.routes));
  const allowed = new Set<number>(model.peaks.map((item) => item.score));
  for (const a of model.peaks) for (const b of model.peaks) allowed.add(a.score - b.score);
  allowed.add(5); // 모듈 이름 ‘성격 5요인 경향’
  for (const line of story) {
    for (const match of line.text.matchAll(/\d+/g)) {
      assert.ok(allowed.has(Number(match[0])), `${match[0]} in "${line.text}"`);
    }
  }
  assert.equal(story[0].kind, "summit");
  assert.equal(story[story.length - 1].kind, "note");
  assert.ok(story.some((line) => line.kind === "region"));
});

test("near-tied summits are described together instead of ranked", () => {
  const story = terrainStory([peak("a", "reaction", 80), peak("b", "defense", 77), peak("c", "traits", 40)], []);
  assert.match(story[0].text, /거의 같은 높이/);
  assert.deepEqual(story[0].peaks, ["reaction:a", "defense:b"]);
});

test("flat regions and low trait poles are framed without judgement", () => {
  const story = terrainStory([peak("x1", "reaction", 50), peak("x2", "reaction", 58), peak("extraversion", "traits", 20, "외향성"), peak("openness", "traits", 60, "개방성")], []);
  assert.ok(story.some((line) => line.kind === "region" && /고른 지형/.test(line.text)));
  const note = story.find((line) => line.kind === "trait-note")!;
  assert.match(note.text, /부족함이 아니라 반대쪽 성향/);
  assert.match(note.text, /조용한/);
  assert.deepEqual(terrainStory([], []), []);
});
