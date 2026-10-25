import assert from "node:assert/strict";
import { test } from "node:test";
import { defenseVignettes } from "../data/defense-quiz";
import { defenseIds } from "../types/defense";

test("each vignette has four unique valid options including its answer, covering every defense once", () => {
  assert.equal(new Set(defenseVignettes.map((item) => item.id)).size, defenseVignettes.length);
  for (const vignette of defenseVignettes) {
    assert.equal(new Set(vignette.options).size, 4, vignette.id);
    assert.ok(vignette.options.includes(vignette.answer), vignette.id);
    assert.ok(vignette.options.every((option) => (defenseIds as readonly string[]).includes(option)), vignette.id);
    assert.ok(vignette.story.length > 10 && vignette.explanation.length > 20);
  }
  assert.deepEqual([...defenseVignettes.map((item) => item.answer)].sort(), [...defenseIds].sort());
});

test("answer positions are spread out rather than always first", () => {
  const positions = defenseVignettes.map((item) => item.options.indexOf(item.answer));
  for (const position of [0, 1, 2, 3]) assert.ok(positions.filter((value) => value === position).length >= 2, `position ${position}`);
});
