import assert from "node:assert/strict";
import { test } from "node:test";
import { ScoringError, scoreLikertInstrument, validateInstrument, type ScoringErrorCode } from "../lib/likert-engine";
import { responseQuality, reverseGap, scoreBand } from "../lib/interpretation";
import type { LikertInstrument, LikertResponse, LikertValue } from "../types/assessment";

const instrument: LikertInstrument<"a" | "b"> = {
  id: "toy",
  version: "toy-v1",
  scaleIds: ["a", "b"],
  items: [
    { id: "a1", kind: "likert", text: "A 1", scale: "a", reverse: false, weight: 1 },
    { id: "a2", kind: "likert", text: "A 2", scale: "a", reverse: true, weight: 1 },
    { id: "b1", kind: "likert", text: "B 1", scale: "b", reverse: false, weight: 2 },
    { id: "b2", kind: "likert", text: "B 2", scale: "b", reverse: false, weight: 1 },
  ],
};

function answers(value: LikertValue): LikertResponse[] {
  return instrument.items.map((item) => ({ kind: "likert", questionId: item.id, value }));
}

function expectError(input: readonly LikertResponse[], code: ScoringErrorCode, set: LikertInstrument = instrument) {
  assert.throws(() => scoreLikertInstrument(set, input), (error) => error instanceof ScoringError && error.code === code);
}

test("generic engine scores scales in declared order with weights and reverse items", () => {
  const input = answers(4);
  const result = scoreLikertInstrument(instrument, input, "toy-scoring");
  assert.equal(result.instrumentId, "toy");
  assert.equal(result.instrumentVersion, "toy-v1");
  assert.equal(result.scoringVersion, "toy-scoring");
  assert.equal(result.responseCount, 4);
  assert.deepEqual(result.scales.map((scale) => scale.scale), ["a", "b"]);
  assert.equal(result.scales[0].score, 50);
  assert.equal(result.scales[1].score, 100);
  assert.equal(result.scales[1].weightedSum, 12);
  assert.equal(result.scales[1].weightSum, 3);
  assert.deepEqual(result.scales[0].evidence[1], { questionId: "a2", rawValue: 4, scoredValue: 0, reverse: true, weight: 1, weightedValue: 0 });
});

test("generic engine is deterministic and independent of response order", () => {
  const input: LikertResponse[] = [
    { kind: "likert", questionId: "a1", value: 3 }, { kind: "likert", questionId: "a2", value: 1 },
    { kind: "likert", questionId: "b1", value: 2 }, { kind: "likert", questionId: "b2", value: 0 },
  ];
  const result = scoreLikertInstrument(instrument, input);
  assert.deepEqual(result, scoreLikertInstrument(instrument, [...input].reverse()));
  assert.equal(result.scales[0].score, 75);
  assert.equal(result.scales[1].score, 33);
});

test("generic engine rejects missing, duplicate, unknown and invalid responses", () => {
  expectError(answers(2).slice(1), "MISSING_RESPONSE");
  expectError([...answers(2), answers(2)[0]], "DUPLICATE_RESPONSE");
  expectError([{ kind: "likert", questionId: "zzz", value: 2 }, ...answers(2)], "UNKNOWN_QUESTION");
  expectError([{ kind: "likert", questionId: "a1", value: 7 } as unknown as LikertResponse], "INVALID_RESPONSE");
  expectError(undefined as unknown as LikertResponse[], "INVALID_RESPONSE");
});

test("generic engine rejects malformed instruments", () => {
  const bad: LikertInstrument[] = [
    { ...instrument, version: " " },
    { ...instrument, scaleIds: [] },
    { ...instrument, scaleIds: ["a", "a"] },
    { ...instrument, items: instrument.items.filter((item) => item.scale !== "b") },
    { ...instrument, items: [...instrument.items, instrument.items[0]] },
    { ...instrument, items: instrument.items.map((item, index) => index === 0 ? { ...item, scale: "c" as "a" } : item) },
    { ...instrument, items: instrument.items.map((item, index) => index === 0 ? { ...item, weight: 0 } : item) },
  ];
  for (const set of bad) {
    assert.throws(() => validateInstrument(set));
    expectError(answers(2), "INVALID_QUESTIONNAIRE", set);
  }
});

test("score bands follow the mean-response boundaries 1, 2 and 3", () => {
  assert.deepEqual([0, 24, 25, 49, 50, 74, 75, 100].map(scoreBand), ["rare", "rare", "sometimes", "sometimes", "often", "often", "prominent", "prominent"]);
});

test("response quality flags uniform and extreme agreement without rejecting", () => {
  assert.deepEqual(responseQuality(answers(4)), { responseCount: 4, meanRaw: 4, allIdentical: true, highAgreement: true, lowAgreement: false, reverseGap: null, inconsistentReverse: false });
  assert.deepEqual(responseQuality(answers(0)), { responseCount: 4, meanRaw: 0, allIdentical: true, highAgreement: false, lowAgreement: true, reverseGap: null, inconsistentReverse: false });
  const mixed: LikertResponse[] = [0, 1, 3, 4].map((value, index) => ({ kind: "likert", questionId: instrument.items[index].id, value: value as LikertValue }));
  assert.deepEqual(responseQuality(mixed), { responseCount: 4, meanRaw: 2, allIdentical: false, highAgreement: false, lowAgreement: false, reverseGap: null, inconsistentReverse: false });
  assert.deepEqual(responseQuality([]), { responseCount: 0, meanRaw: 0, allIdentical: false, highAgreement: false, lowAgreement: false, reverseGap: null, inconsistentReverse: false });
});

test("reverse gap is 0 for consistent answers, 1 for agreeing with both directions, null without reverse items", () => {
  const consistent: LikertResponse[] = [{ kind: "likert", questionId: "a1", value: 3 }, { kind: "likert", questionId: "a2", value: 1 }, { kind: "likert", questionId: "b1", value: 2 }, { kind: "likert", questionId: "b2", value: 2 }];
  assert.deepEqual([reverseGap(instrument, consistent), responseQuality(consistent, instrument).inconsistentReverse], [0, false]);
  assert.deepEqual([reverseGap(instrument, answers(4)), responseQuality(answers(4), instrument).inconsistentReverse], [1, true]);
  assert.equal(reverseGap(instrument, answers(3)), 0.5);
  assert.equal(reverseGap(instrument, answers(2)), 0);
  assert.equal(reverseGap({ ...instrument, items: instrument.items.map((item) => ({ ...item, reverse: false })) }, answers(4)), null);
});

test("strongest statements rank raw agreement, keep item order on ties, and respect the threshold", async () => {
  const { strongestStatements } = await import("../lib/interpretation");
  const input: LikertResponse[] = [
    { kind: "likert", questionId: "a1", value: 3 }, { kind: "likert", questionId: "a2", value: 4 },
    { kind: "likert", questionId: "b1", value: 3 }, { kind: "likert", questionId: "b2", value: 1 },
  ];
  assert.deepEqual(strongestStatements(instrument, input).map((item) => [item.questionId, item.value]), [["a2", 4], ["a1", 3], ["b1", 3]]);
  assert.deepEqual(strongestStatements(instrument, input, 2).map((item) => item.questionId), ["a2", "a1"]);
  assert.deepEqual(strongestStatements(instrument, answers(2)), []);
});
