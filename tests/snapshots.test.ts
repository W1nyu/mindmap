import assert from "node:assert/strict";
import { test } from "node:test";
import { assessmentModules } from "../data/modules";
import { createInstrumentSession } from "../lib/session";
import { MAX_SNAPSHOTS_PER_MODULE, compareSnapshots, createSnapshot, parseSnapshots, snapshotResult, snapshotSeries, validateSnapshot } from "../lib/snapshots";
import type { LikertValue } from "../types/assessment";

function completed(module: "reaction" | "defense" | "traits", value: (index: number) => LikertValue) {
  const instrument = assessmentModules[module].instrument;
  return { ...createInstrumentSession(instrument), completed: true, answers: Object.fromEntries(instrument.items.map((item, index) => [item.id, value(index)])) };
}

test("snapshots store answers of completed sessions only and recompute identical results", () => {
  const session = completed("traits", () => 2);
  const snapshot = createSnapshot("traits", session, "s1", new Date("2026-10-01T00:00:00Z"));
  assert.equal(snapshot.instrumentVersion, assessmentModules.traits.instrument.version);
  assert.deepEqual(validateSnapshot(JSON.parse(JSON.stringify(snapshot))), snapshot);
  const result = snapshotResult(snapshot);
  assert.ok(result.module === "traits" && result.profile.result.scales.every((scale) => scale.score === 50));
  assert.throws(() => createSnapshot("traits", { ...session, completed: false }, "s2", new Date()));
  assert.throws(() => createSnapshot("traits", { ...session, answers: {} }, "s2", new Date()));
});

test("invalid, old-version or incomplete stored snapshots are dropped", () => {
  const good = createSnapshot("defense", completed("defense", () => 1), "ok", new Date("2026-10-02T00:00:00Z"));
  const firstId = Object.keys(good.answers)[0];
  const rest = Object.fromEntries(Object.entries(good.answers).slice(1));
  const parsed = parseSnapshots(JSON.stringify([
    good, { ...good, id: "old", instrumentVersion: "selfmap-defense-44-v0" }, { ...good, id: "partial", answers: rest },
    { ...good, id: "bad-value", answers: { ...good.answers, [firstId]: 9 } }, { ...good, id: "bad-module", module: "iq" }, null,
  ]));
  assert.deepEqual(parsed?.map((item) => item.id), ["ok"]);
  assert.equal(parseSnapshots("{}"), null);
});

test("comparison reports per-scale deltas in module order and rejects mixed modules", () => {
  const before = createSnapshot("traits", completed("traits", () => 2), "a", new Date("2026-10-01T00:00:00Z"));
  const after = createSnapshot("traits", completed("traits", (index) => (assessmentModules.traits.instrument.items[index].reverse ? 0 : 4)), "b", new Date("2026-10-08T00:00:00Z"));
  const changes = compareSnapshots(before, after);
  assert.deepEqual(changes.map((item) => item.scale), [...assessmentModules.traits.instrument.scaleIds]);
  assert.ok(changes.every((item) => item.before === 50 && item.after === 100 && item.delta === 50));
  const other = createSnapshot("defense", completed("defense", () => 2), "c", new Date());
  assert.throws(() => compareSnapshots(before, other));
});

test("normalization keeps the newest 30 per module, sorted oldest-first, without duplicate IDs", () => {
  const session = completed("traits", () => 3);
  const many = Array.from({ length: 35 }, (_, index) => createSnapshot("traits", session, `t${index}`, new Date(Date.UTC(2026, 0, 1 + index))));
  const parsed = parseSnapshots(JSON.stringify([...many, many[34]]))!;
  assert.equal(parsed.length, MAX_SNAPSHOTS_PER_MODULE);
  assert.equal(parsed[0].id, "t5");
  assert.equal(parsed[parsed.length - 1].id, "t34");
});

test("answer comparison ignores key order", async () => {
  const { sameAnswers } = await import("../lib/snapshots");
  assert.equal(sameAnswers({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
  assert.equal(sameAnswers({ a: 1, b: 2 }, { a: 1, b: 3 }), false);
  assert.equal(sameAnswers({ a: 1 }, { a: 1, b: 2 }), false);
});

test("series lists every scale in module order with scores oldest first", () => {
  const late = createSnapshot("traits", completed("traits", () => 4), "late", new Date("2026-10-03T00:00:00Z"));
  const early = createSnapshot("traits", completed("traits", () => 0), "early", new Date("2026-10-01T00:00:00Z"));
  const mid = createSnapshot("traits", completed("traits", () => 2), "mid", new Date("2026-10-02T00:00:00Z"));
  const series = snapshotSeries([late, early, mid]);
  assert.deepEqual(series.map((item) => item.scale), [...assessmentModules.traits.instrument.scaleIds]);
  for (const item of series) {
    assert.equal(item.scores.length, 3);
    assert.equal(item.scores[1], 50);
    assert.equal(item.min, Math.min(...item.scores));
    assert.equal(item.max, Math.max(...item.scores));
  }
  assert.deepEqual(snapshotSeries([]), []);
  assert.throws(() => snapshotSeries([late, createSnapshot("defense", completed("defense", () => 1), "x", new Date())]));
});

