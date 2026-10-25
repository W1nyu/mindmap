import type { EmotionId, NeedId } from "../data/journal";
import type { DefenseId } from "../types/defense";
import { journalStats, type JournalEntry } from "./journal";
import type { PracticeLog } from "./practice";
import type { ResultSnapshot } from "./snapshots";

/** 한 주의 범위. 경계는 화면에서 로컬 시간 기준 월요일 0시로 계산해 넘깁니다. */
export interface WeekRange {
  /** 로컬 날짜 YYYY-MM-DD (월요일) */
  startDate: string;
  /** 로컬 날짜 YYYY-MM-DD (일요일) */
  endDate: string;
  startMs: number;
  endMs: number;
}

export interface WeekSummary {
  range: WeekRange;
  entries: number;
  averageIntensity: number | null;
  averageDrop: number | null;
  topEmotion: { id: EmotionId; count: number } | null;
  topNeed: { id: NeedId; count: number } | null;
  defenses: readonly { id: DefenseId; count: number }[];
  practicesDone: readonly string[];
  snapshotsSaved: number;
  activeDays: number;
}

const pad = (value: number) => String(value).padStart(2, "0");
export const localDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** 기준 시각이 속한 주(월–일)의 로컬 범위. offset으로 이전·다음 주로 이동합니다. */
export function weekOf(reference: Date, offset = 0): WeekRange {
  const start = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const weekday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - weekday + offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const last = new Date(end);
  last.setDate(last.getDate() - 1);
  return { startDate: localDate(start), endDate: localDate(last), startMs: start.getTime(), endMs: end.getTime() };
}

/** 순수 함수: 범위 안의 기록·연습·결과 저장을 요약합니다. 연습 기록은 로컬 날짜 문자열로 비교합니다. */
export function summarizeWeek(range: WeekRange, entries: readonly JournalEntry[], practiceLog: PracticeLog, snapshots: readonly ResultSnapshot[]): WeekSummary {
  const inRange = (iso: string) => {
    const time = Date.parse(iso);
    return time >= range.startMs && time < range.endMs;
  };
  const weekEntries = entries.filter((entry) => inRange(entry.createdAt));
  const stats = journalStats(weekEntries);
  const days = new Set(weekEntries.map((entry) => localDate(new Date(entry.createdAt))));
  const practicesDone = Object.entries(practiceLog).filter(([, date]) => date >= range.startDate && date <= range.endDate).map(([id]) => id).sort();
  for (const date of Object.values(practiceLog)) if (date >= range.startDate && date <= range.endDate) days.add(date);
  return {
    range,
    entries: weekEntries.length,
    averageIntensity: stats.averageIntensity,
    averageDrop: stats.averageDrop,
    topEmotion: stats.emotions[0] ?? null,
    topNeed: stats.needs[0] ?? null,
    defenses: stats.defenses,
    practicesDone,
    snapshotsSaved: snapshots.filter((snapshot) => inRange(snapshot.savedAt)).length,
    activeDays: days.size,
  };
}

/** 두 주의 평균 강도 차이(이번 주 − 지난주). 어느 한쪽이라도 기록이 없으면 null. */
export function intensityChange(current: WeekSummary, previous: WeekSummary): number | null {
  if (current.averageIntensity === null || previous.averageIntensity === null) return null;
  return Math.round((current.averageIntensity - previous.averageIntensity) * 10) / 10;
}
