import assert from "node:assert/strict";
import { test } from "node:test";
import { ecrR, ecrRS } from "../data/attachment";
import { dmrsSr30 } from "../data/defense-dmrs";
import { dsq40, dsq40Tiers } from "../data/defense-dsq";
import { defenseMeta } from "../data/defense-mechanisms";
import { DERS18_SOURCE_ITEMS, ders18, ders36 } from "../data/emotion";
import { assessmentModules, formIds, moduleIds } from "../data/modules";
import { bfi2, bfi2S, traitFacets } from "../data/traits";
import { validateInstrument } from "../lib/likert-engine";
import type { LikertInstrument } from "../types/assessment";

const count = (instrument: LikertInstrument, scale: string, reverse?: boolean) =>
  instrument.items.filter((item) => item.scale === scale && (reverse === undefined || item.reverse === reverse)).length;
const itemAt = (instrument: LikertInstrument, number: number) => instrument.items[number - 1];
const reversed = (instrument: LikertInstrument) => instrument.items.flatMap((item, index) => (item.reverse ? [index + 1] : []));

test("every module has a valid brief and deep form with the original response format", () => {
  const expected = { emotion: [18, 36, 5], defense: [30, 40, 0], traits: [30, 60, 5], attachment: [9, 36, 7] } as const;
  for (const id of moduleIds) {
    for (const form of formIds) validateInstrument(assessmentModules[id].forms[form].instrument);
    const [brief, deep, points] = expected[id];
    assert.equal(assessmentModules[id].forms.brief.instrument.items.length, brief, id);
    assert.equal(assessmentModules[id].forms.deep.instrument.items.length, deep, id);
    if (id === "defense") {
      assert.deepEqual([assessmentModules[id].forms.brief.instrument.points, assessmentModules[id].forms.deep.instrument.points], [5, 9]);
    } else {
      assert.equal(assessmentModules[id].forms.brief.instrument.points, points);
      assert.equal(assessmentModules[id].forms.deep.instrument.points, points);
    }
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
  // 한국판 K-DERS(조용래, 2007) 문장과 응답 표기, DERS-18은 같은 원 문항을 그대로 씀
  assert.equal(itemAt(ders36, 25).text, "나는 화가 나거나 기분이 나쁘면, 그렇게 느끼는 것에 대해 죄책감을 느낀다.");
  assert.deepEqual(ders36.options.map((option) => option.label.split(" (")[0]), ["거의 그렇지 않다", "때때로 그렇다", "대략 반쯤 그렇다", "대부분 그렇다", "거의 언제나 그렇다"]);
  DERS18_SOURCE_ITEMS.forEach((number, index) => {
    const short = itemAt(ders18, index + 1);
    const full = itemAt(ders36, number);
    assert.deepEqual([short.text, short.scale, Boolean(short.reverse)], [full.text, full.scale, Boolean(full.reverse)], `DERS-18 ${index + 1} = DERS ${number}`);
  });
});

test("DSQ-40 scores every defense from exactly two items with no reverse keying", () => {
  assert.ok(dsq40.items.every((item) => !item.reverse));
  for (const id of dsq40.scaleIds) assert.equal(count(dsq40, id), 2, id);
  assert.equal(dsq40.scaleIds.length, 20);
  assert.equal(itemAt(dsq40, 13).scale, "devaluation");
  assert.equal(itemAt(dsq40, 33).scale, "displacement");
  const tiers = Object.values(dsq40Tiers);
  assert.deepEqual(["adaptive", "inhibitory", "immediate"].map((tier) => tiers.filter((value) => value === tier).length), [4, 4, 12]);
  for (const id of dsq40.scaleIds) assert.ok(defenseMeta(id), id);
});

test("DMRS-SR-30 covers 28 defenses with the item counts per DMRS level reported in Di Giuseppe et al. (2020), Table 2", () => {
  assert.equal(dmrsSr30.items.length, 30);
  assert.equal(dmrsSr30.scaleIds.length, 28);
  assert.equal(dmrsSr30.points, 5);
  assert.ok(dmrsSr30.items.every((item) => !item.reverse));
  for (const id of dmrsSr30.scaleIds) assert.equal(count(dmrsSr30, id), id === "passiveAggression" || id === "dissociation" ? 2 : 1, id);
  const perLevel = [7, 6, 5, 4, 3, 2, 1].map((level) => dmrsSr30.items.filter((item) => defenseMeta(item.scale).level === level).length);
  assert.deepEqual(perLevel, [8, 3, 5, 3, 4, 3, 4]);
  const perCategory = [[7], [5, 6], [1, 2, 3, 4]].map((levels) => dmrsSr30.items.filter((item) => levels.includes(defenseMeta(item.scale).level)).length);
  assert.deepEqual(perCategory, [8, 8, 14]);
  const depressive = dmrsSr30.items.filter((item) => [1, 2].includes(defenseMeta(item.scale).level) || ["projection", "devaluation"].includes(item.scale)).length;
  assert.equal(depressive, 9);
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
