import assert from "node:assert/strict";
import { test } from "node:test";
import { ecrR, ecrRS } from "../data/attachment";
import { dsq40, dsq40Tiers, dsq60 } from "../data/defense-dsq";
import { defenseMeta } from "../data/defense-mechanisms";
import { ders18, ders36 } from "../data/emotion";
import { assessmentModules, formIds, moduleIds } from "../data/modules";
import { bfi2, bfi2S, traitFacets } from "../data/traits";
import { validateInstrument } from "../lib/likert-engine";
import type { LikertInstrument } from "../types/assessment";

const count = (instrument: LikertInstrument, scale: string, reverse?: boolean) =>
  instrument.items.filter((item) => item.scale === scale && (reverse === undefined || item.reverse === reverse)).length;
const itemAt = (instrument: LikertInstrument, number: number) => instrument.items[number - 1];
const reversed = (instrument: LikertInstrument) => instrument.items.flatMap((item, index) => (item.reverse ? [index + 1] : []));

test("every module has a valid brief and deep form with the original response format", () => {
  const expected = { emotion: [18, 36, 5], defense: [40, 60, 9], traits: [30, 60, 5], attachment: [9, 36, 7] } as const;
  for (const id of moduleIds) {
    for (const form of formIds) validateInstrument(assessmentModules[id].forms[form].instrument);
    const [brief, deep, points] = expected[id];
    assert.equal(assessmentModules[id].forms.brief.instrument.items.length, brief, id);
    assert.equal(assessmentModules[id].forms.deep.instrument.items.length, deep, id);
    assert.equal(assessmentModules[id].forms.brief.instrument.points, points);
    assert.equal(assessmentModules[id].forms.deep.instrument.points, points);
    assert.notEqual(assessmentModules[id].forms.brief.storageKey, assessmentModules[id].forms.deep.storageKey);
  }
});

test("DERS-36 and DERS-18 follow the published subscale keys", () => {
  assert.deepEqual(Object.fromEntries(ders36.scaleIds.map((id) => [id, count(ders36, id)])), { nonacceptance: 6, goals: 5, impulse: 6, awareness: 6, strategies: 8, clarity: 5 });
  assert.deepEqual(reversed(ders36), [1, 2, 6, 7, 8, 10, 17, 20, 22, 24, 34]);
  assert.equal(itemAt(ders36, 20).scale, "goals");
  assert.equal(itemAt(ders36, 3).scale, "impulse");
  for (const id of ders18.scaleIds) assert.equal(count(ders18, id), 3, id);
  assert.deepEqual(reversed(ders18), [1, 4, 6]);
  assert.deepEqual([7, 13, 14].map((n) => itemAt(ders18, n).scale), ["nonacceptance", "nonacceptance", "nonacceptance"]);
  assert.deepEqual([10, 11, 17].map((n) => itemAt(ders18, n).scale), ["strategies", "strategies", "strategies"]);
});

test("DSQ-40 and DSQ-60 score every defense from exactly two items with no reverse keying", () => {
  for (const instrument of [dsq40, dsq60]) {
    assert.ok(instrument.items.every((item) => !item.reverse));
    for (const id of instrument.scaleIds) assert.equal(count(instrument, id), 2, `${instrument.id} ${id}`);
  }
  assert.equal(dsq40.scaleIds.length, 20);
  assert.equal(dsq60.scaleIds.length, 30);
  assert.equal(itemAt(dsq40, 13).scale, "devaluation");
  assert.equal(itemAt(dsq40, 33).scale, "displacement");
  assert.equal(itemAt(dsq60, 60).scale, "displacement");
  assert.equal(itemAt(dsq60, 16).scale, "omnipotence");
  const tiers = Object.values(dsq40Tiers);
  assert.deepEqual(["adaptive", "inhibitory", "immediate"].map((tier) => tiers.filter((value) => value === tier).length), [4, 4, 12]);
  for (const id of [...dsq40.scaleIds, ...dsq60.scaleIds]) assert.ok(defenseMeta(id), id);
});

test("BFI-2 and BFI-2-S follow the published domain and facet keys", () => {
  for (const id of bfi2S.scaleIds) {
    assert.equal(count(bfi2S, id), 6, id);
    assert.equal(count(bfi2S, id, true), 3, id);
  }
  for (const id of bfi2.scaleIds) {
    assert.equal(count(bfi2, id), 12, id);
    assert.equal(count(bfi2, id, true), 6, id);
  }
  assert.deepEqual(reversed(bfi2S), [1, 3, 7, 8, 10, 14, 17, 19, 20, 21, 24, 26, 27, 28, 30]);
  assert.deepEqual(reversed(bfi2).filter((n) => itemAt(bfi2, n).scale === "neuroticism"), [4, 9, 24, 29, 44, 49]);
  assert.equal(traitFacets.length, 15);
  const covered = traitFacets.flatMap((facet) => facet.items);
  assert.deepEqual([...covered].sort((a, b) => a - b), Array.from({ length: 60 }, (_, index) => index + 1));
  for (const facet of traitFacets) for (const n of facet.items) assert.equal(itemAt(bfi2, n).scale, facet.domain, facet.id);
});

test("ECR-RS and ECR-R follow the published reverse keys", () => {
  assert.deepEqual([count(ecrRS, "attachmentAvoidance"), count(ecrRS, "attachmentAnxiety")], [6, 3]);
  assert.deepEqual(reversed(ecrRS), [1, 2, 3, 4]);
  assert.equal(count(ecrR, "attachmentAnxiety"), 18);
  assert.equal(count(ecrR, "attachmentAnxiety", true), 2);
  assert.equal(count(ecrR, "attachmentAvoidance", true), 12);
  ecrR.items.forEach((item, index) => assert.equal(item.scale, index % 2 === 0 ? "attachmentAnxiety" : "attachmentAvoidance"));
});
