import type { JournalEntry } from "./journal";

/** 기록 달력: 최근 몇 주의 날짜별 기록 수와 평균 강도. 색은 기록 횟수만 나타내며 감정의 좋고 나쁨을 뜻하지 않습니다. */
export interface CalendarDay {
  date: string;
  count: number;
  averageIntensity: number | null;
  /** 0 기록 없음, 1–4 기록 수(4 이상은 4) */
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
  today: boolean;
}

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * 월요일로 시작하는 주 단위 격자(열 = 주, 행 = 요일). 마지막 열은 오늘이 든 주이고, 오늘 뒤 날짜는 future로 표시합니다.
 * 날짜는 기기의 지역 시간대로 나눕니다.
 */
export function journalCalendar(entries: readonly JournalEntry[], today: Date, weeks = 12): CalendarDay[] {
  const byDay = new Map<string, { count: number; intensity: number }>();
  for (const entry of entries) {
    const key = localDateKey(new Date(entry.createdAt));
    const day = byDay.get(key) ?? { count: 0, intensity: 0 };
    day.count += 1;
    day.intensity += entry.intensity;
    byDay.set(key, day);
  }
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekday = (start.getDay() + 6) % 7; // 월요일 0
  start.setDate(start.getDate() - weekday - (weeks - 1) * 7);
  const todayKey = localDateKey(today);
  const days: CalendarDay[] = [];
  for (let index = 0; index < weeks * 7; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const key = localDateKey(date);
    const record = byDay.get(key);
    const count = record?.count ?? 0;
    days.push({
      date: key, count,
      averageIntensity: record ? Math.round((record.intensity / record.count) * 10) / 10 : null,
      level: Math.min(4, count) as CalendarDay["level"],
      future: key > todayKey,
      today: key === todayKey,
    });
  }
  return days;
}

/** 오늘을 포함해 끊기지 않고 기록한 날 수. 오늘 아직 기록이 없으면 어제부터 셉니다. */
export function recordStreak(entries: readonly JournalEntry[], today: Date): number {
  const days = new Set(entries.map((entry) => localDateKey(new Date(entry.createdAt))));
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!days.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
