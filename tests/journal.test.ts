import assert from "node:assert/strict";
import { test } from "node:test";
import { createEntry, draftErrors, journalStats, parseJournal, validateEntry, type JournalDraft } from "../lib/journal";

const draft: JournalDraft = {
  situation: " 회의에서 내 의견이 넘어갔다 ", thought: "내 말은 중요하지 않구나", emotions: ["hurt", "irritated"], intensity: 7,
  need: "recognition", action: "말없이 노트북만 봤다", defenses: ["withdrawal"], recovery: "", afterIntensity: 3,
};

test("drafts need a situation or thought and at least one emotion, within limits", () => {
  assert.deepEqual(draftErrors(draft), []);
  assert.equal(draftErrors({ ...draft, situation: "  ", thought: "" }).length, 1);
  assert.equal(draftErrors({ ...draft, emotions: [] }).length, 1);
  assert.ok(draftErrors({ ...draft, emotions: ["hurt", "sad", "angry", "tense"] }).length > 0);
  assert.ok(draftErrors({ ...draft, defenses: ["denial", "denial"] }).length > 0);
  assert.ok(draftErrors({ ...draft, intensity: 11 }).length > 0);
  assert.ok(draftErrors({ ...draft, afterIntensity: 2.5 }).length > 0);
  assert.ok(draftErrors({ ...draft, situation: "가".repeat(301) }).length > 0);
  assert.ok(draftErrors({ ...draft, need: "money" as never }).length > 0);
  assert.throws(() => createEntry({ ...draft, emotions: [] }, "x", new Date()));
});

test("entries are trimmed, timestamped and round-trip through storage validation", () => {
  const entry = createEntry(draft, "j-1", new Date("2026-10-20T09:30:00Z"));
  assert.equal(entry.situation, "회의에서 내 의견이 넘어갔다");
  assert.equal(entry.createdAt, "2026-10-20T09:30:00.000Z");
  assert.deepEqual(validateEntry(JSON.parse(JSON.stringify(entry))), entry);
  assert.equal(validateEntry({ ...entry, emotions: ["unknown"] }), null);
  assert.equal(validateEntry({ ...entry, createdAt: "yesterday" }), null);
  assert.equal(validateEntry({ ...entry, thought: 3 }), null);
  assert.deepEqual(validateEntry({ ...entry, extra: "<script>" }), entry);
});

test("parseJournal keeps valid unique entries newest-first and rejects non-arrays", () => {
  const older = createEntry(draft, "a", new Date("2026-10-01T00:00:00Z"));
  const newer = createEntry({ ...draft, emotions: ["anxious"] }, "b", new Date("2026-10-02T00:00:00Z"));
  const parsed = parseJournal(JSON.stringify([older, { broken: true }, newer, { ...older, situation: "dup" }]));
  assert.deepEqual(parsed?.map((entry) => entry.id), ["b", "a"]);
  assert.equal(parseJournal("{}"), null);
  assert.equal(parseJournal("not json"), null);
  assert.deepEqual(parseJournal("[]"), []);
});

test("journal stats count, average and group by UTC date deterministically", () => {
  const entries = [
    createEntry(draft, "a", new Date("2026-10-01T01:00:00Z")),
    createEntry({ ...draft, emotions: ["hurt"], intensity: 4, afterIntensity: null, defenses: [], need: null }, "b", new Date("2026-10-01T05:00:00Z")),
    createEntry({ ...draft, emotions: ["anxious", "hurt"], intensity: 9, afterIntensity: 8, defenses: ["withdrawal", "denial"] }, "c", new Date("2026-10-03T05:00:00Z")),
  ];
  const stats = journalStats(entries);
  assert.equal(stats.count, 3);
  assert.equal(stats.averageIntensity, 6.7);
  assert.equal(stats.averageDrop, 2.5);
  assert.equal(stats.recordedAfter, 2);
  assert.deepEqual(stats.emotions, [{ id: "hurt", count: 3 }, { id: "anxious", count: 1 }, { id: "irritated", count: 1 }]);
  assert.deepEqual(stats.defenses, [{ id: "withdrawal", count: 2 }, { id: "denial", count: 1 }]);
  assert.deepEqual(stats.needs, [{ id: "recognition", count: 2 }]);
  assert.deepEqual(stats.daily, [{ date: "2026-10-01", count: 2, intensity: 5.5, after: 3 }, { date: "2026-10-03", count: 1, intensity: 9, after: 8 }]);
  assert.deepEqual(journalStats([]), { count: 0, averageIntensity: null, averageDrop: null, recordedAfter: 0, emotions: [], defenses: [], needs: [], daily: [] });
});

test("defense sources split into both, questionnaire-only and journal-only in defense order", async () => {
  const { compareDefenseSources } = await import("../lib/journal");
  const scores = new Map<string, number>([["withdrawal", 67], ["anticipation", 83], ["denial", 17], ["projection", 50]]);
  const recorded = [{ id: "denial" as const, count: 3 }, { id: "withdrawal" as const, count: 2 }];
  assert.deepEqual(compareDefenseSources(scores, recorded), { both: ["withdrawal"], profileOnly: ["anticipation", "projection"], journalOnly: ["denial"] });
  assert.deepEqual(compareDefenseSources(new Map(), []), { both: [], profileOnly: [], journalOnly: [] });
});

test("journal filters combine emotion, defense and text conditions", async () => {
  const { filterEntries, emptyFilter } = await import("../lib/journal");
  const entries = [
    createEntry(draft, "a", new Date("2026-10-01T00:00:00Z")),
    createEntry({ ...draft, emotions: ["anxious"], defenses: ["denial"], situation: "Presentation day" }, "b", new Date("2026-10-02T00:00:00Z")),
  ];
  assert.equal(filterEntries(entries, emptyFilter).length, 2);
  assert.deepEqual(filterEntries(entries, { ...emptyFilter, emotion: "hurt" }).map((entry) => entry.id), ["a"]);
  assert.deepEqual(filterEntries(entries, { ...emptyFilter, defense: "denial" }).map((entry) => entry.id), ["b"]);
  assert.deepEqual(filterEntries(entries, { ...emptyFilter, text: "presentation" }).map((entry) => entry.id), ["b"]);
  assert.deepEqual(filterEntries(entries, { emotion: "hurt", defense: "denial", text: "" }), []);
});
