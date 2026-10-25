import assert from "node:assert/strict";
import { test } from "node:test";
import { createEntry, type JournalDraft } from "../lib/journal";
import { intensityChange, localDate, summarizeWeek, weekOf } from "../lib/weekly";

const draft: JournalDraft = { situation: "상황", thought: "", emotions: ["anxious"], intensity: 6, need: "safety", action: "", defenses: ["withdrawal"], recovery: "", afterIntensity: 2 };

test("weekOf returns local Monday–Sunday ranges and moves by whole weeks", () => {
  const thursday = new Date(2026, 9, 22, 15, 0);
  const week = weekOf(thursday);
  assert.equal(week.startDate, "2026-10-19");
  assert.equal(week.endDate, "2026-10-25");
  assert.equal(week.endMs - week.startMs, 7 * 86_400_000);
  assert.equal(weekOf(new Date(2026, 9, 19, 0, 0)).startDate, "2026-10-19");
  assert.equal(weekOf(new Date(2026, 9, 25, 23, 59)).startDate, "2026-10-19");
  assert.equal(weekOf(thursday, -1).startDate, "2026-10-12");
  assert.equal(weekOf(thursday, 1).endDate, "2026-11-01");
});

test("summaries include only items inside the range and count active days", () => {
  const week = weekOf(new Date(2026, 9, 22));
  const entries = [
    createEntry(draft, "in-1", new Date(2026, 9, 19, 9)),
    createEntry({ ...draft, emotions: ["sad", "anxious"], intensity: 8, afterIntensity: null, need: null }, "in-2", new Date(2026, 9, 21, 22)),
    createEntry({ ...draft, intensity: 2 }, "out", new Date(2026, 9, 26, 1)),
  ];
  const practice = { "name-it": "2026-10-20", "pause-90": "2026-10-26", "worry-window": "2026-10-19" };
  const snapshots = [{ id: "s", module: "traits" as const, savedAt: new Date(2026, 9, 23, 12).toISOString(), instrumentVersion: "v", answers: {} }];
  const summary = summarizeWeek(week, entries, practice, snapshots);
  assert.equal(summary.entries, 2);
  assert.equal(summary.averageIntensity, 7);
  assert.equal(summary.averageDrop, 4);
  assert.deepEqual(summary.topEmotion, { id: "anxious", count: 2 });
  assert.deepEqual(summary.topNeed, { id: "safety", count: 1 });
  assert.deepEqual(summary.defenses, [{ id: "withdrawal", count: 2 }]);
  assert.deepEqual(summary.practicesDone, ["name-it", "worry-window"]);
  assert.equal(summary.snapshotsSaved, 1);
  assert.equal(summary.activeDays, 3);
  assert.equal(localDate(new Date(2026, 0, 5)), "2026-01-05");
});

test("intensity change needs both weeks to have entries", () => {
  const week = weekOf(new Date(2026, 9, 22));
  const previous = weekOf(new Date(2026, 9, 22), -1);
  const current = summarizeWeek(week, [createEntry(draft, "a", new Date(2026, 9, 20))], {}, []);
  const before = summarizeWeek(previous, [createEntry({ ...draft, intensity: 9 }, "b", new Date(2026, 9, 13))], {}, []);
  assert.equal(intensityChange(current, before), -3);
  assert.equal(intensityChange(current, summarizeWeek(previous, [], {}, [])), null);
});
