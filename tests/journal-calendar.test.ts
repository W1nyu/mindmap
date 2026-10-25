import assert from "node:assert/strict";
import { test } from "node:test";
import type { JournalEntry } from "../lib/journal";
import { journalCalendar, recordStreak } from "../lib/journal-calendar";

function entry(id: string, local: [number, number, number, number], intensity: number): JournalEntry {
  const [y, m, d, h] = local;
  return { id, createdAt: new Date(y, m - 1, d, h).toISOString(), situation: "상황", thought: "", emotions: ["anxious"], intensity, need: null, action: "", defenses: [], recovery: "", afterIntensity: null };
}

test("calendar is a Monday-first grid ending with the current week", () => {
  const today = new Date(2026, 9, 22, 15); // 2026-10-22 목요일
  const days = journalCalendar([], today, 4);
  assert.equal(days.length, 28);
  assert.equal(new Date(`${days[0].date}T00:00:00`).getDay(), 1);
  assert.equal(days.filter((day) => day.today).length, 1);
  assert.equal(days.find((day) => day.today)?.date, "2026-10-22");
  assert.deepEqual(days.slice(-3).map((day) => day.future), [true, true, true]);
});

test("days count local records, average intensity, and cap the level at 4", () => {
  const today = new Date(2026, 9, 22, 20);
  const entries = [
    entry("a", [2026, 10, 21, 9], 4), entry("b", [2026, 10, 21, 22], 7),
    ...[1, 2, 3, 4, 5].map((n) => entry(`c${n}`, [2026, 10, 20, 8 + n], 5)),
  ];
  const days = journalCalendar(entries, today, 2);
  const tuesday = days.find((day) => day.date === "2026-10-20")!;
  const wednesday = days.find((day) => day.date === "2026-10-21")!;
  assert.equal(tuesday.count, 5);
  assert.equal(tuesday.level, 4);
  assert.equal(wednesday.count, 2);
  assert.equal(wednesday.averageIntensity, 5.5);
  assert.equal(days.find((day) => day.today)!.count, 0);
});

test("streak counts back from today, or from yesterday when today is still empty", () => {
  const today = new Date(2026, 9, 22, 12);
  const entries = [entry("a", [2026, 10, 21, 9], 3), entry("b", [2026, 10, 20, 9], 3), entry("c", [2026, 10, 18, 9], 3)];
  assert.equal(recordStreak(entries, today), 2);
  assert.equal(recordStreak([...entries, entry("d", [2026, 10, 22, 8], 1)], today), 3);
  assert.equal(recordStreak([], today), 0);
});
