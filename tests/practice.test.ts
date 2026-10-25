import assert from "node:assert/strict";
import { test } from "node:test";
import { assessmentModules } from "../data/modules";
import { practices } from "../data/practices";
import { computeExampleResult, computeModuleResult } from "../lib/module-results";
import { recommendPractices } from "../lib/practice";

test("practice catalog has unique IDs, steps, and triggers that point at real scales", () => {
  assert.equal(new Set(practices.map((item) => item.id)).size, practices.length);
  for (const practice of practices) {
    assert.ok(practice.steps.length >= 3 && practice.minutes > 0 && practice.triggers.length > 0, practice.id);
    for (const trigger of practice.triggers) {
      assert.ok((assessmentModules[trigger.module].instrument.scaleIds as readonly string[]).includes(trigger.scale), `${practice.id}:${trigger.scale}`);
    }
  }
});

test("no completed modules means no personalized recommendations", () => {
  assert.deepEqual(recommendPractices({}), []);
});

test("recommendations carry evidence and sort by matched trigger count, then catalog order", () => {
  const items = assessmentModules.defense.instrument.items;
  const defense = computeModuleResult("defense", items.map((item) => ({ kind: "likert" as const, questionId: item.id, value: (["displacement", "projection", "withdrawal"].includes(item.scale) ? 4 : 1) as 1 | 4 })));
  const recommendations = recommendPractices({ defense });
  assert.deepEqual(recommendations.map((item) => [item.practice.id, item.reasons.length]), [
    ["original-address", 2], ["facts-guesses", 1], ["small-approach", 1], ["ask-for-help", 1], ["worry-window", 1],
  ]);
  assert.deepEqual(recommendations[3].reasons, [{ module: "defense", scale: "affiliation", score: 25, level: "low" }]);
});

test("example profile recommendations are deterministic", () => {
  const results = { reaction: computeExampleResult("reaction"), defense: computeExampleResult("defense"), traits: computeExampleResult("traits") };
  assert.deepEqual(recommendPractices(results), recommendPractices(results));
  assert.ok(recommendPractices(results).length > 0);
});

test("reflection prompts: valid triggers, personalized when scores match, general otherwise, stable per step", async () => {
  const { reflectionPrompts } = await import("../data/reflection-prompts");
  const { dayNumber, pickReflection } = await import("../lib/reflection");
  assert.equal(new Set(reflectionPrompts.map((item) => item.id)).size, reflectionPrompts.length);
  for (const prompt of reflectionPrompts) for (const trigger of prompt.triggers) {
    assert.ok((assessmentModules[trigger.module].instrument.scaleIds as readonly string[]).includes(trigger.scale), `${prompt.id}:${trigger.scale}`);
  }
  const general = pickReflection({}, 0);
  assert.equal(general.personalized, false);
  assert.equal(general.prompt.triggers.length, 0);
  assert.equal(pickReflection({}, 4).prompt.id, general.prompt.id);
  assert.equal(pickReflection({}, -1).prompt.id, pickReflection({}, 3).prompt.id);

  const items = assessmentModules.defense.instrument.items;
  const defense = computeModuleResult("defense", items.map((item) => ({ kind: "likert" as const, questionId: item.id, value: (item.scale === "withdrawal" ? 4 : 2) as 2 | 4 })));
  const picked = pickReflection({ defense }, 7);
  assert.equal(picked.personalized, true);
  assert.equal(picked.poolSize, 1);
  assert.deepEqual([picked.prompt.id, picked.reasons], ["d-withdrawal", [{ module: "defense", scale: "withdrawal", score: 100 }]]);
  assert.equal(dayNumber(new Date(2026, 9, 23, 23, 59)), dayNumber(new Date(2026, 9, 23, 0, 1)));
  assert.equal(dayNumber(new Date(2026, 9, 24)) - dayNumber(new Date(2026, 9, 23)), 1);
});

test("breathing state cycles 4s inhale / 6s exhale and finishes at the total duration", async () => {
  const { breathState } = await import("../lib/breathing");
  const total = 60_000;
  assert.deepEqual(breathState(0, total), { phase: "inhale", secondsLeft: 4, cycle: 0, progress: 0 });
  assert.deepEqual(breathState(3_500, total), { phase: "inhale", secondsLeft: 1, cycle: 0, progress: 0.875 });
  assert.deepEqual(breathState(4_000, total), { phase: "exhale", secondsLeft: 6, cycle: 0, progress: 0 });
  assert.deepEqual(breathState(9_999, total).phase, "exhale");
  assert.deepEqual(breathState(10_000, total), { phase: "inhale", secondsLeft: 4, cycle: 1, progress: 0 });
  assert.deepEqual(breathState(60_000, total), { phase: "done", secondsLeft: 0, cycle: 6, progress: 1 });
  assert.equal(breathState(-5, total).phase, "inhale");
});
