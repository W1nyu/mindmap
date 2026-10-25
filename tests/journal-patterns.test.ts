import assert from "node:assert/strict";
import { test } from "node:test";
import type { EmotionId, NeedId } from "../data/journal";
import type { JournalEntry } from "../lib/journal";
import { emotionNeedFlow, momentGrid } from "../lib/journal-patterns";

function entry(id: string, emotions: EmotionId[], need: NeedId | null, local: [number, number, number, number] = [2026, 10, 19, 9], intensity = 5): JournalEntry {
  const [y, m, d, h] = local;
  return { id, createdAt: new Date(y, m - 1, d, h).toISOString(), situation: "상황", thought: "", emotions, intensity, need, action: "", defenses: [], recovery: "", afterIntensity: null };
}

test("flow counts one link per emotion of each entry and skips entries without a need", () => {
  const flow = emotionNeedFlow([
    entry("a", ["anxious", "tense"], "safety"),
    entry("b", ["anxious"], "safety"),
    entry("c", ["hurt"], "understanding"),
    entry("d", ["angry"], null),
  ]);
  assert.equal(flow.withoutNeed, 1);
  assert.deepEqual(flow.emotions, [{ id: "anxious", count: 2 }, { id: "hurt", count: 1 }, { id: "tense", count: 1 }]);
  assert.deepEqual(flow.needs, [{ id: "safety", count: 3 }, { id: "understanding", count: 1 }]);
  assert.deepEqual(flow.links, [
    { emotion: "anxious", need: "safety", count: 2 },
    { emotion: "hurt", need: "understanding", count: 1 },
    { emotion: "tense", need: "safety", count: 1 },
  ]);
  const total = (items: readonly { count: number }[]) => items.reduce((sum, item) => sum + item.count, 0);
  assert.equal(total(flow.links), total(flow.emotions));
  assert.equal(total(flow.links), total(flow.needs));
});

test("flow is empty and deterministic for no data", () => {
  assert.deepEqual(emotionNeedFlow([]), { emotions: [], needs: [], links: [], withoutNeed: 0 });
});

test("moment grid has 28 cells and places entries by local weekday and period", () => {
  const grid = momentGrid([
    entry("a", ["anxious"], null, [2026, 10, 19, 9], 4), // 월 오전
    entry("b", ["anxious"], null, [2026, 10, 19, 10], 6), // 월 오전
    entry("c", ["sad"], null, [2026, 10, 25, 23], 8), // 일 저녁
    entry("d", ["sad"], null, [2026, 10, 21, 3], 2), // 수 새벽
  ]);
  assert.equal(grid.length, 28);
  assert.deepEqual(grid.find((cell) => cell.weekday === 0 && cell.period === "morning"), { weekday: 0, period: "morning", count: 2, averageIntensity: 5 });
  assert.equal(grid.find((cell) => cell.weekday === 6 && cell.period === "evening")!.count, 1);
  assert.equal(grid.find((cell) => cell.weekday === 2 && cell.period === "dawn")!.averageIntensity, 2);
  assert.equal(grid.reduce((sum, cell) => sum + cell.count, 0), 4);
});
