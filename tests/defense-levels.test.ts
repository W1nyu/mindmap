import assert from "node:assert/strict";
import { test } from "node:test";
import { dsq40, dsq40Tiers, dsq60 } from "../data/defense-dsq";
import { dmrsLevels } from "../data/defense-levels";
import { defenseMechanisms } from "../data/defense-mechanisms";
import { analyzeDefenses, tiersFromLevels } from "../lib/defense-analysis";
import { dmrsProfile } from "../lib/defense-levels";
import type { LikertInstrument, LikertResponse } from "../types/assessment";
import { defenseIds, type DefenseId } from "../types/defense";

const answer = (instrument: LikertInstrument<DefenseId>, valueFor: (defense: DefenseId) => number): LikertResponse[] =>
  instrument.items.map((item) => ({ kind: "likert", questionId: item.id, value: valueFor(item.scale) }));

test("every defense has metadata and a DMRS level; DSQ-60 covers all seven levels", () => {
  assert.deepEqual(defenseMechanisms.map((item) => item.id).sort(), [...defenseIds].sort());
  assert.deepEqual(dmrsLevels.map((level) => level.level), [7, 6, 5, 4, 3, 2, 1]);
  const dmrs = dmrsProfile(analyzeDefenses(answer(dsq60, () => 4), dsq60, tiersFromLevels(dsq60.scaleIds)).result.scales);
  assert.ok(dmrs.levels.every((level) => level.measured));
});

test("DSQ-60 styles come from DMRS levels: 8 mature, 7 neurotic, 15 immature", () => {
  const tiers = Object.values(tiersFromLevels(dsq60.scaleIds));
  assert.deepEqual(["adaptive", "inhibitory", "immediate"].map((tier) => tiers.filter((value) => value === tier).length), [8, 7, 15]);
});

test("equal answers give the defense-count-weighted mean level and shares summing to 100", () => {
  const scales = analyzeDefenses(answer(dsq40, () => 4), dsq40, dsq40Tiers).result.scales;
  const dmrs = dmrsProfile(scales);
  const expected = scales.reduce((sum, scale) => sum + defenseMechanisms.find((item) => item.id === scale.scale)!.level, 0) / scales.length;
  assert.equal(dmrs.index, Math.round(expected * 100) / 100);
  assert.equal(dmrs.levels.reduce((sum, level) => sum + level.share, 0), 100);
});

test("index follows where the scores sit and is null when every score is 0", () => {
  const level = (id: DefenseId) => defenseMechanisms.find((item) => item.id === id)!.level;
  const mature = dmrsProfile(analyzeDefenses(answer(dsq40, (id) => (level(id) === 7 ? 8 : 0)), dsq40, dsq40Tiers).result.scales);
  assert.equal(mature.index, 7);
  const none = dmrsProfile(analyzeDefenses(answer(dsq40, () => 0), dsq40, dsq40Tiers).result.scales);
  assert.equal(none.index, null);
  assert.ok(none.levels.every((item) => item.share === 0));
});

test("style scores average defense scores and DSQ means stay on the 1–9 scale", () => {
  const profile = analyzeDefenses(answer(dsq40, (id) => (dsq40Tiers[id] === "adaptive" ? 8 : 0)), dsq40, dsq40Tiers);
  assert.deepEqual(profile.tiers.map((tier) => [tier.tier, tier.score, tier.mean]), [["adaptive", 100, 9], ["inhibitory", 0, 1], ["immediate", 0, 1]]);
  assert.equal(profile.resources.length, 3);
  assert.ok(profile.highlights.every((item) => item.tier === "adaptive"));
});
