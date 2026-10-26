import assert from "node:assert/strict";
import { test } from "node:test";
import { sders } from "../data/emotion-state";
import { validateInstrument } from "../lib/likert-engine";
import { createEmotionStateCheck, emotionStateTrend, parseEmotionStateChecks, scoreEmotionState } from "../lib/emotion-state";

test("S-DERS follows Lavender et al. (2017), Table 2: 7 non-acceptance, 7 modulate, 5 awareness (reversed), 2 clarity", () => {
  validateInstrument(sders);
  assert.equal(sders.items.length, 21);
  assert.equal(sders.points, 5);
  const numbers = (scale: string) => sders.items.flatMap((item, index) => (item.scale === scale ? [index + 1] : []));
  assert.deepEqual(numbers("nonacceptance"), [1, 4, 5, 8, 12, 18, 20]);
  assert.deepEqual(numbers("modulate"), [3, 9, 10, 13, 15, 17, 21]);
  assert.deepEqual(numbers("awareness"), [2, 6, 11, 16, 19]);
  assert.deepEqual(numbers("clarity"), [7, 14]);
  assert.ok(sders.items.every((item) => item.reverse === (item.scale === "awareness")));
});

test("subscale and total scores are sums on the original 1–5 scale, awareness reverse scored", () => {
  const lowest = scoreEmotionState(Array(21).fill(0));
  // 모두 1점: 자각 문항은 역채점되어 5점
  assert.equal(lowest.total, 16 + 25);
  assert.deepEqual(lowest.subscales.map((scale) => [scale.id, scale.sum]), [["nonacceptance", 7], ["modulate", 7], ["awareness", 25], ["clarity", 2]]);
  const awareCalm = scoreEmotionState(sders.items.map((item) => (item.reverse ? 4 : 0)));
  assert.equal(awareCalm.total, 21);
  assert.equal(awareCalm.totalScore, 0);
  assert.throws(() => scoreEmotionState(Array(20).fill(0)));
  assert.throws(() => scoreEmotionState(Array(21).fill(5)));
});

test("stored checks are validated, kept in time order, and every momentary check is kept", () => {
  const a = createEmotionStateCheck(Array(21).fill(1), new Date("2026-10-20T08:00:00Z"), "a");
  const b = createEmotionStateCheck(Array(21).fill(2), new Date("2026-10-20T20:00:00Z"), "b");
  const parsed = parseEmotionStateChecks(JSON.stringify([a, { ...b, answers: [9] }, b, { ...a, version: "old", id: "x" }]));
  assert.deepEqual(parsed!.map((item) => item.id), ["b", "a"]);
  assert.deepEqual(emotionStateTrend(parsed!).map((point) => point.id), ["a", "b"]);
  assert.equal(parseEmotionStateChecks("{"), null);
});
