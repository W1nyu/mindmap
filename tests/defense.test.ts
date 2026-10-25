import assert from "node:assert/strict";
import { test } from "node:test";
import { defenseMechanisms, defenseTiers } from "../data/defense-mechanisms";
import { DEFENSE_QUESTIONNAIRE_VERSION, defenseInstrument, defenseQuestions } from "../data/defense-questions";
import { DEFENSE_SCORING_VERSION, analyzeDefenses } from "../lib/defense-analysis";
import { validateInstrument } from "../lib/likert-engine";
import type { LikertResponse, LikertValue } from "../types/assessment";
import { defenseIds, type DefenseId, type DefenseTierId } from "../types/defense";

const tierOf = (id: DefenseId) => defenseMechanisms.find((item) => item.id === id)!.tier;

function answers(valueFor: (defense: DefenseId) => LikertValue): LikertResponse[] {
  return defenseQuestions.map((item) => ({ kind: "likert", questionId: item.id, value: valueFor(item.scale) }));
}

test("45 defense items: 15 defenses × 3, no reverse items, unit weights, metadata for every defense", () => {
  validateInstrument(defenseInstrument);
  assert.equal(defenseInstrument.version, DEFENSE_QUESTIONNAIRE_VERSION);
  assert.equal(defenseQuestions.length, 45);
  assert.equal(new Set(defenseQuestions.map((item) => item.id)).size, 45);
  assert.equal(new Set(defenseQuestions.map((item) => item.text)).size, 45);
  for (const id of defenseIds) {
    const group = defenseQuestions.filter((item) => item.scale === id);
    assert.equal(group.length, 3, id);
    assert.ok(group.every((item) => !item.reverse && item.weight === 1));
  }
  assert.deepEqual(defenseMechanisms.map((item) => item.id), [...defenseIds]);
  const counts = Object.fromEntries(defenseTiers.map((tier) => [tier.id, defenseMechanisms.filter((item) => item.tier === tier.id).length]));
  assert.deepEqual(counts, { adaptive: 5, inhibitory: 4, immediate: 6 });
});

test("items of the same defense are never adjacent in presentation order", () => {
  for (let index = 1; index < defenseQuestions.length; index += 1) {
    assert.notEqual(defenseQuestions[index].scale, defenseQuestions[index - 1].scale, `position ${index}`);
  }
});

test("neutral answers give a centered profile with largest-remainder composition", () => {
  const profile = analyzeDefenses(answers(() => 2));
  assert.equal(profile.result.scoringVersion, DEFENSE_SCORING_VERSION);
  assert.equal(profile.result.instrumentVersion, DEFENSE_QUESTIONNAIRE_VERSION);
  assert.ok(profile.result.scales.every((scale) => scale.score === 50));
  assert.deepEqual(profile.tiers.map((tier) => [tier.tier, tier.score]), [["adaptive", 50], ["inhibitory", 50], ["immediate", 50]]);
  assert.deepEqual(profile.balance, { value: 2, position: 50 });
  assert.deepEqual(profile.composition?.map((item) => item.share), [34, 33, 33]);
  assert.equal(profile.personalMean, 50);
  assert.ok(profile.relative.every((item) => item.deviation === 0));
  assert.deepEqual(profile.highlights.map((item) => item.defense), ["sublimation", "humor", "anticipation"]);
  assert.ok(profile.highlights.slice(1).every((item) => item.closeToPrevious));
  assert.equal(profile.similarBeyondHighlights, 12);
});

test("all-zero answers produce no balance, composition, or highlights instead of dividing by zero", () => {
  const profile = analyzeDefenses(answers(() => 0));
  assert.equal(profile.balance, null);
  assert.equal(profile.composition, null);
  assert.deepEqual(profile.highlights, []);
  assert.deepEqual(profile.resources, []);
  assert.equal(profile.quality.allIdentical, true);
  assert.equal(profile.quality.lowAgreement, true);
});

test("adaptive-only answers move the balance to 100 and list adaptive resources", () => {
  const profile = analyzeDefenses(answers((defense) => (tierOf(defense) === "adaptive" ? 4 : 0)));
  assert.deepEqual(profile.balance, { value: 3, position: 100 });
  assert.deepEqual(profile.composition?.map((item) => item.share), [100, 0, 0]);
  assert.deepEqual(profile.highlights.map((item) => item.defense), ["sublimation", "humor", "anticipation"]);
  assert.equal(profile.similarBeyondHighlights, 2);
  assert.deepEqual(profile.resources, ["sublimation", "humor", "anticipation"]);
  assert.equal(profile.personalMean, 33.3);
  assert.equal(profile.relative.find((item) => item.defense === "sublimation")!.deviation, 66.7);
  assert.equal(profile.relative.find((item) => item.defense === "denial")!.deviation, -33.3);
});

test("highlights are ranked by score, require 50+, and mark near ties within 5 points", () => {
  const values: Partial<Record<DefenseId, LikertValue>> = { withdrawal: 4, displacement: 3, projection: 3, humor: 2 };
  const input = answers((defense) => values[defense] ?? 0);
  // humor: 3문항 중 1개만 4로 올려 67점 → 3위 projection(75)과 8점 차이라 근접 동점이 아님
  const humorFirst = input.findIndex((item) => item.questionId === "defense-humor-1");
  input[humorFirst] = { ...input[humorFirst], value: 4 };
  const profile = analyzeDefenses(input);
  assert.deepEqual(profile.highlights.map((item) => [item.defense, item.score, item.closeToPrevious]), [
    ["withdrawal", 100, false], ["displacement", 75, false], ["projection", 75, true],
  ]);
  assert.equal(profile.similarBeyondHighlights, 0);
  assert.equal(profile.resources.length, 1);
  assert.equal(profile.balance!.position < 50, true);
});

test("tier scores pool item sums; balance uses unrounded tier means", () => {
  const values: Record<DefenseTierId, LikertValue> = { adaptive: 3, inhibitory: 1, immediate: 2 };
  const profile = analyzeDefenses(answers((defense) => values[tierOf(defense)]));
  assert.deepEqual(profile.tiers.map((tier) => tier.score), [75, 25, 50]);
  // (3×0.75 + 2×0.25 + 1×0.5) / 1.5 = 2.1667 → 위치 58
  assert.deepEqual(profile.balance, { value: 2.17, position: 58 });
  assert.deepEqual(profile.composition?.map((item) => item.share), [50, 17, 33]);
});

test("analysis is deterministic and does not mutate input", () => {
  const input = answers((defense) => ((defenseIds.indexOf(defense) % 5) as LikertValue));
  const before = JSON.stringify(input);
  const first = analyzeDefenses(input);
  assert.deepEqual(first, analyzeDefenses([...input].reverse()));
  assert.equal(JSON.stringify(input), before);
});
