import assert from "node:assert/strict";
import { test } from "node:test";
import { WELLBEING_VERSION, type WellbeingValue } from "../data/wellbeing";
import { createCheck, itemAverages, nextCheckDate, parseChecks, scoreWellbeing, wellbeingBand, wellbeingTrend, type WellbeingCheck } from "../lib/wellbeing";

const check = (id: string, date: string, answers: WellbeingValue[]): WellbeingCheck => ({ id, takenAt: new Date(date).toISOString(), version: WELLBEING_VERSION, answers });

test("score is raw sum times four with reference bands at 28 and 50", () => {
  assert.deepEqual(scoreWellbeing([5, 5, 5, 5, 5]), { raw: 25, score: 100, band: "steady", lowItems: [] });
  assert.equal(scoreWellbeing([3, 3, 3, 2, 2]).score, 52);
  assert.equal(wellbeingBand(52), "steady");
  assert.equal(wellbeingBand(50), "low");
  assert.equal(wellbeingBand(29), "low");
  assert.equal(wellbeingBand(28), "veryLow");
  assert.deepEqual(scoreWellbeing([1, 0, 4, 2, 5]).lowItems, ["cheerful", "calm"]);
});

test("score rejects incomplete or out-of-range answers", () => {
  assert.throws(() => scoreWellbeing([1, 2, 3, 4]));
  assert.throws(() => scoreWellbeing([1, 2, 3, 4, 6]));
  assert.throws(() => scoreWellbeing([1, 2, 3, 4, 1.5]));
});

test("trend is chronological and flags changes of 10 or more", () => {
  const points = wellbeingTrend([
    check("c", "2026-10-20T09:00:00Z", [3, 3, 3, 3, 3]), // 60
    check("a", "2026-09-20T09:00:00Z", [2, 2, 2, 2, 2]), // 40
    check("b", "2026-10-05T09:00:00Z", [2, 2, 2, 2, 3]), // 44
  ]);
  assert.deepEqual(points.map((point) => [point.id, point.score, point.change, point.meaningful]), [["a", 40, null, false], ["b", 44, 4, false], ["c", 60, 16, true]]);
});

test("parse keeps valid checks newest first and drops broken ones", () => {
  const good = check("a", "2026-10-01T00:00:00Z", [1, 2, 3, 4, 5]);
  const newer = createCheck([0, 0, 0, 0, 0], new Date("2026-10-10T00:00:00Z"), "b");
  const parsed = parseChecks(JSON.stringify([good, { ...good, id: "x", answers: [9, 9, 9, 9, 9] }, newer, { ...good, version: "old" }, good]));
  assert.deepEqual(parsed!.map((item) => item.id), ["b", "a"]);
  assert.equal(parseChecks("{"), null);
  assert.equal(parseChecks("{}"), null);
});

test("next check date and item averages", () => {
  const checks = [check("a", "2026-10-01T12:00:00", [1, 2, 3, 4, 5]), check("b", "2026-10-11T12:00:00", [3, 2, 3, 4, 0])];
  assert.equal(nextCheckDate(checks, 14)!.getDate(), 25);
  assert.equal(nextCheckDate([], 14), null);
  assert.deepEqual(itemAverages(checks).map((item) => item.mean), [2, 2, 3, 4, 2.5]);
});
