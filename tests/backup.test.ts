import assert from "node:assert/strict";
import { test } from "node:test";
import { assessmentModules } from "../data/modules";
import { BACKUP_MAX_BYTES, buildBackup, parseBackup } from "../lib/backup";
import { createEntry } from "../lib/journal";
import { parsePracticeLog } from "../lib/practice";
import { createInstrumentSession } from "../lib/session";
import { createSnapshot } from "../lib/snapshots";
import { createCheck } from "../lib/wellbeing";

const traits = assessmentModules.traits.instrument;
const complete = { ...createInstrumentSession(traits), completed: true, answers: Object.fromEntries(traits.items.map((item) => [item.id, 2 as const])) };
const entry = createEntry({ situation: "상황", thought: "", emotions: ["sad"], intensity: 5, need: null, action: "", defenses: [], recovery: "", afterIntensity: null }, "j1", new Date("2026-10-01T00:00:00Z"));

test("a full backup round-trips through JSON", () => {
  const backup = buildBackup({
    sessions: { traits: complete, defense: createInstrumentSession(assessmentModules.defense.instrument) },
    snapshots: [createSnapshot("traits", complete, "s1", new Date("2026-10-02T00:00:00Z"))],
    journal: [entry],
    practiceLog: { "name-it": "2026-10-03" },
    wellbeing: [createCheck([3, 2, 4, 1, 3], new Date("2026-10-03T00:00:00Z"), "w1")],
  }, new Date("2026-10-04T00:00:00Z"));
  const parsed = parseBackup(JSON.stringify(backup));
  assert.ok(parsed);
  assert.deepEqual(parsed.backup, backup);
  assert.deepEqual(parsed.summary, { sessions: 2, snapshots: 1, journal: 1, practiceLog: 1, wellbeing: 1, dropped: 0 });
});

test("backups made before well-being checks existed still import", () => {
  const legacy = buildBackup({ sessions: {}, snapshots: [], journal: [entry], practiceLog: {} }, new Date("2026-10-04T00:00:00Z"));
  const parsed = parseBackup(JSON.stringify(legacy));
  assert.ok(parsed);
  assert.deepEqual(parsed.backup.wellbeing, []);
  assert.equal(parsed.summary.wellbeing, 0);
});

test("wrong format markers, versions, non-JSON and oversized files are rejected outright", () => {
  const backup = buildBackup({ sessions: {}, snapshots: [], journal: [], practiceLog: {} }, new Date());
  for (const raw of ["nope", "[]", JSON.stringify({ ...backup, format: "other" }), JSON.stringify({ ...backup, version: 2 }), JSON.stringify({ ...backup, exportedAt: "x" })]) {
    assert.equal(parseBackup(raw), null);
  }
  assert.equal(parseBackup(" ".repeat(BACKUP_MAX_BYTES + 1)), null);
});

test("invalid parts are dropped and counted while valid parts survive", () => {
  const backup = buildBackup({ sessions: {}, snapshots: [], journal: [], practiceLog: {} }, new Date("2026-10-04T00:00:00Z"));
  const tampered = {
    ...backup,
    sessions: { traits: { ...complete, answers: { nope: 2 } }, reaction: null },
    snapshots: [{ id: "x", module: "traits", savedAt: "bad" }],
    journal: [entry, { ...entry, id: "j2", emotions: [] }],
    practiceLog: { "name-it": "2026-10-03", unknown: "2026-10-03", "pause-90": "soon" },
  };
  const parsed = parseBackup(JSON.stringify(tampered));
  assert.ok(parsed);
  assert.deepEqual(parsed.summary, { sessions: 0, snapshots: 0, journal: 1, practiceLog: 1, wellbeing: 0, dropped: 3 });
  assert.deepEqual(parsePracticeLog(JSON.stringify(tampered.practiceLog)), { "name-it": "2026-10-03" });
  assert.equal(parsePracticeLog("[]"), null);
});
