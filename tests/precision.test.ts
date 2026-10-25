import assert from "node:assert/strict";
import { test } from "node:test";
import { profileShape, scalePrecision } from "../lib/precision";
import type { LikertValue, ScoreEvidence } from "../types/psychology";

const evidence = (values: LikertValue[]): ScoreEvidence[] => values.map((value, index) => ({ questionId: `q${index}`, rawValue: value, scoredValue: value, reverse: false, weight: 1, weightedValue: value }));

test("identical item answers give a zero-width range", () => {
  const result = scalePrecision("s", 50, evidence([2, 2, 2, 2]), 5);
  assert.deepEqual([result.sd, result.low, result.high, result.agreement], [0, 50, 50, "consistent"]);
  assert.deepEqual(result.itemScores, [50, 50, 50, 50]);
});

test("spread answers widen the range and are marked mixed", () => {
  const result = scalePrecision("s", 50, evidence([0, 2, 4]), 5);
  assert.equal(result.sd, 1.63);
  assert.equal(result.agreement, "mixed");
  assert.deepEqual([result.low, result.high], [26, 74]);
  assert.equal(scalePrecision("s", 58, evidence([1, 2, 4]), 5).agreement, "moderate");
});

test("range is clipped to 0–100", () => {
  const result = scalePrecision("s", 92, evidence([4, 4, 3, 0]), 5);
  assert.ok(result.high <= 100 && result.low >= 0);
});

test("profile elevation and scatter", () => {
  assert.deepEqual(profileShape([40, 60]), { elevation: 50, scatter: 10 });
  assert.deepEqual(profileShape([]), { elevation: 0, scatter: 0 });
});
