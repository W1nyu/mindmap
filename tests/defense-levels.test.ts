import assert from "node:assert/strict";
import { test } from "node:test";
import { defenseMechanisms } from "../data/defense-mechanisms";
import { dmrsLevels } from "../data/defense-levels";
import { defenseQuestions } from "../data/defense-questions";
import { analyzeDefenses } from "../lib/defense-analysis";
import { dmrsProfile } from "../lib/defense-levels";
import type { LikertResponse, LikertValue } from "../types/assessment";
import { defenseIds, type DefenseId } from "../types/defense";

const profileFor = (valueFor: (defense: DefenseId) => LikertValue) =>
  analyzeDefenses(defenseQuestions.map((item): LikertResponse => ({ kind: "likert", questionId: item.id, value: valueFor(item.scale) })));

test("every defense sits on exactly one DMRS level that matches its SelfMap tier", () => {
  const placed = dmrsLevels.flatMap((level) => level.defenses);
  assert.deepEqual([...placed].sort(), [...defenseIds].sort());
  for (const level of dmrsLevels) {
    for (const id of level.defenses) assert.equal(defenseMechanisms.find((item) => item.id === id)!.tier, level.tier, id);
  }
  assert.deepEqual(dmrsLevels.map((level) => level.level), [7, 6, 5, 4, 3, 2, 1]);
});

test("equal answers give the defense-count-weighted mean level and shares summing to 100", () => {
  const dmrs = dmrsProfile(profileFor(() => 2).result.scales);
  // (7×5 + 6×2 + 5×2 + 3×3 + 1×3) / 15 = 69 / 15
  assert.equal(dmrs.index, 4.6);
  assert.deepEqual(dmrs.levels.map((level) => level.share), [33, 14, 13, 0, 20, 0, 20]);
  assert.equal(dmrs.levels.reduce((sum, level) => sum + level.share, 0), 100);
  assert.deepEqual(dmrs.levels.filter((level) => !level.measured).map((level) => [level.level, level.score]), [[4, null], [2, null]]);
});

test("index follows where the scores sit and is null when every score is 0", () => {
  const adaptiveOnly = dmrsProfile(profileFor((id) => (dmrsLevels[0].defenses.includes(id) ? 4 : 0)).result.scales);
  assert.equal(adaptiveOnly.index, 7);
  assert.equal(adaptiveOnly.levels[0].score, 100);
  const actionOnly = dmrsProfile(profileFor((id) => (dmrsLevels[6].defenses.includes(id) ? 3 : 0)).result.scales);
  assert.equal(actionOnly.index, 1);
  const none = dmrsProfile(profileFor(() => 0).result.scales);
  assert.equal(none.index, null);
  assert.ok(none.levels.every((level) => level.share === 0));
});
