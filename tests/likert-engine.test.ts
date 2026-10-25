import assert from "node:assert/strict";
import { test } from "node:test";
import { agree7, agree9, buildInstrument } from "../data/instrument-kit";
import { isLikertValue, scoreLikertInstrument, type ScoringError, validateInstrument } from "../lib/likert-engine";
import type { LikertResponse } from "../types/assessment";

const seven = buildInstrument<"a" | "b">({ id: "t7", version: "v1", options: agree7, scaleIds: ["a", "b"], items: [["a1", "a"], ["a2", "a", true], ["b1", "b"]] });
const answers = (values: number[]): LikertResponse[] => values.map((value, index) => ({ kind: "likert", questionId: seven.items[index].id, value }));

test("values must be integers inside the instrument's own range", () => {
  assert.ok(isLikertValue(0, 7) && isLikertValue(6, 7));
  assert.ok(!isLikertValue(7, 7) && !isLikertValue(-1, 7) && !isLikertValue(1.5, 7) && !isLikertValue("1", 7));
  assert.ok(isLikertValue(8, 9));
});

test("reverse items use max − value and scores map to 0–100 with a mean in original units", () => {
  const result = scoreLikertInstrument(seven, answers([6, 0, 3]));
  const a = result.scales.find((scale) => scale.scale === "a")!;
  assert.deepEqual([a.score, a.mean], [100, 7]);
  const b = result.scales.find((scale) => scale.scale === "b")!;
  assert.deepEqual([b.score, b.mean], [50, 4]);
  assert.equal(result.points, 7);
});

test("a 9-point instrument maps its midpoint to 50", () => {
  const nine = buildInstrument<"d">({ id: "t9", version: "v1", options: agree9, scaleIds: ["d"], items: [["d1", "d"], ["d2", "d"]] });
  const result = scoreLikertInstrument(nine, nine.items.map((item) => ({ kind: "likert" as const, questionId: item.id, value: 4 })));
  assert.deepEqual([result.scales[0].score, result.scales[0].mean], [50, 5]);
});

test("missing, duplicate, unknown and out-of-range answers are rejected", () => {
  const code = (fn: () => unknown) => {
    try {
      fn();
      return "ok";
    } catch (error) {
      return (error as ScoringError).code;
    }
  };
  assert.equal(code(() => scoreLikertInstrument(seven, answers([1, 2]))), "MISSING_RESPONSE");
  assert.equal(code(() => scoreLikertInstrument(seven, [...answers([1, 2, 3]), answers([1])[0]])), "DUPLICATE_RESPONSE");
  assert.equal(code(() => scoreLikertInstrument(seven, [...answers([1, 2]), { kind: "likert", questionId: "x", value: 1 }])), "UNKNOWN_QUESTION");
  assert.equal(code(() => scoreLikertInstrument(seven, answers([1, 2, 7]))), "INVALID_RESPONSE");
});

test("instrument validation requires matching options and coverage of every scale", () => {
  assert.throws(() => validateInstrument({ ...seven, points: 5 }));
  assert.throws(() => validateInstrument({ ...seven, scaleIds: ["a", "b", "c"] as never }));
});
