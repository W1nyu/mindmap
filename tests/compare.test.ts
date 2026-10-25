import assert from "node:assert/strict";
import { test } from "node:test";
import { comparePrompts } from "../data/compare-prompts";
import { assessmentModules } from "../data/modules";
import { compareInsights, sharedModules } from "../lib/compare";
import { computeExampleResult, computeModuleResult } from "../lib/module-results";
import type { LikertValue } from "../types/assessment";

function attachment(anxiety: LikertValue, avoidance: LikertValue) {
  const items = assessmentModules.attachment.instrument.items;
  return computeModuleResult("attachment", items.map((item) => {
    const target = item.scale === "attachmentAnxiety" ? anxiety : avoidance;
    return { kind: "likert" as const, questionId: item.id, value: (item.reverse ? 4 - target : target) as LikertValue };
  }));
}

test("compare prompts point at real scales with unique IDs", () => {
  assert.equal(new Set(comparePrompts.map((item) => item.id)).size, comparePrompts.length);
  for (const prompt of comparePrompts) assert.ok((assessmentModules[prompt.module].instrument.scaleIds as readonly string[]).includes(prompt.scale), prompt.id);
});

test("only modules both people shared are compared, gaps ≥ 25 sorted by size", () => {
  const a = { attachment: attachment(4, 1), traits: computeExampleResult("traits") };
  const b = { attachment: attachment(1, 2), defense: computeExampleResult("defense") };
  assert.deepEqual(sharedModules(a, b), ["attachment"]);
  const insights = compareInsights(a, b);
  assert.deepEqual(insights.map((item) => [item.prompt.id, item.a, item.b, item.gap]), [["c-anxiety", 100, 25, 75], ["c-avoidance", 25, 50, 25]]);
  assert.deepEqual(compareInsights({ attachment: attachment(2, 2) }, { attachment: attachment(2, 2) }), []);
});
