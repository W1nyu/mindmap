import assert from "node:assert/strict";
import { test } from "node:test";
import { interactionRules } from "../data/reaction-insights";
import { questions } from "../data/questions";
import { reactionInsights } from "../lib/reaction-insights";
import { scoreQuestionnaire } from "../lib/scoring";
import { dimensionIds, type DimensionId, type LikertResponse, type LikertValue } from "../types/psychology";

/** 차원별 목표 채점값(0–4)을 만들도록 역채점까지 고려한 원응답을 만듭니다. */
function responsesFor(scored: Partial<Record<DimensionId, LikertValue>>, fallback: LikertValue = 2): LikertResponse[] {
  return questions.map((question) => {
    const target = scored[question.dimension] ?? fallback;
    return { kind: "likert", questionId: question.id, value: (question.reverse ? 4 - target : target) as LikertValue };
  });
}

test("rules reference known dimensions and have unique IDs", () => {
  assert.equal(new Set(interactionRules.map((rule) => rule.id)).size, interactionRules.length);
  for (const rule of interactionRules) assert.ok(rule.when.length >= 2 && rule.when.every((item) => dimensionIds.includes(item.dimension)));
});

test("neutral answers produce near-tied features, no interaction rules and a mixed recovery", () => {
  const insights = reactionInsights(scoreQuestionnaire(responsesFor({})));
  assert.deepEqual(insights.features.map((item) => [item.dimension, item.closeToPrevious]), [
    ["evaluationSensitivity", false], ["contextAccuracyNeed", true], ["defensiveReactivity", true],
  ]);
  assert.deepEqual(insights.rules, []);
  assert.equal(insights.flow?.dimension, "evaluationSensitivity");
  assert.equal(insights.recovery.level, "mixed");
});

test("interaction rules fire only when every condition holds and carry score evidence", () => {
  const result = scoreQuestionnaire(responsesFor({ evaluationSensitivity: 4, selfCriticism: 3, perspectiveRecovery: 4, emotionalArousal: 1 }));
  const insights = reactionInsights(result);
  assert.deepEqual(insights.rules.map((item) => item.rule.id), ["evaluation-criticism", "criticism-recovery"]);
  assert.deepEqual(insights.rules[0].evidence, [{ dimension: "evaluationSensitivity", score: 100 }, { dimension: "selfCriticism", score: 75 }]);
  assert.equal(insights.features[0].dimension, "evaluationSensitivity");
  assert.equal(insights.flow?.dimension, "evaluationSensitivity");
  assert.equal(insights.recovery.level, "high");
});

test("low scores produce no features or flow but can match low-level resource rules", () => {
  const insights = reactionInsights(scoreQuestionnaire(responsesFor({}, 1)));
  assert.deepEqual(insights.features, []);
  assert.equal(insights.flow, null);
  assert.deepEqual(insights.rules.map((item) => item.rule.id), ["steady-distance"]);
  assert.equal(insights.recovery.level, "low");
});

test("integration rules reference real module scales and evaluate only completed modules", async () => {
  const { integrationRules } = await import("../data/integration-rules");
  const { assessmentModules } = await import("../data/modules");
  const { integratedInsights } = await import("../lib/integration");
  const { computeExampleResult, computeModuleResult } = await import("../lib/module-results");
  assert.equal(new Set(integrationRules.map((rule) => rule.id)).size, integrationRules.length);
  for (const rule of integrationRules) {
    assert.ok(new Set(rule.when.map((item) => item.module)).size >= 2, `${rule.id} spans modules`);
    for (const condition of rule.when) assert.ok((assessmentModules[condition.module].instrument.scaleIds as readonly string[]).includes(condition.scale), `${rule.id}:${condition.scale}`);
  }
  const none = integratedInsights({});
  assert.deepEqual([none.matched.length, none.evaluated, none.waiting], [0, 0, integrationRules.length]);

  const reaction = computeModuleResult("reaction", responsesFor({ relationshipSensitivity: 4, emotionalArousal: 4 }));
  const defenseItems = assessmentModules.defense.instrument.items;
  const defense = computeModuleResult("defense", defenseItems.map((item) => ({ kind: "likert" as const, questionId: item.id, value: (item.scale === "withdrawal" || item.scale === "displacement" ? 4 : 1) as LikertValue })));
  const both = integratedInsights({ reaction, defense });
  assert.deepEqual(both.matched.map((item) => item.rule.id), ["emotion-seeking-outlet", "approach-avoid", "sensitive-but-alone"]);
  assert.equal(both.evaluated + both.waiting, integrationRules.length);
  assert.deepEqual(both.matched[1].evidence, [{ module: "defense", scale: "withdrawal", score: 100 }, { module: "reaction", scale: "relationshipSensitivity", score: 100 }]);

  const examples = integratedInsights({ reaction: computeExampleResult("reaction"), defense: computeExampleResult("defense"), traits: computeExampleResult("traits"), attachment: computeExampleResult("attachment") });
  assert.equal(examples.waiting, 0);
  assert.equal(examples.evaluated, integrationRules.length);
});
