"use client";

import { useState } from "react";
import { journalCalendar } from "@/lib/journal-calendar";
import type { JournalEntry } from "@/lib/journal";

const weekdays = ["월", "", "수", "", "금", "", "일"];

/** 최근 몇 주의 기록 달력. 칸의 진하기는 그날 남긴 기록 수입니다(감정의 좋고 나쁨이 아님). */
export function MoodCalendar({ entries, weeks = 12 }: { entries: readonly JournalEntry[]; weeks?: number }) {
  const [today] = useState(() => new Date());
  const days = journalCalendar(entries, today, weeks);
  const recorded = days.filter((day) => day.count > 0).length;
  return <figure style={{ margin: 0 }}>
    <div className="mood-calendar" role="img" aria-label={`최근 ${weeks}주 동안 ${recorded}일 기록했어요.`}>
      <div className="mood-calendar-days" aria-hidden="true">{weekdays.map((day, index) => <span key={index}>{day}</span>)}</div>
      <div className="mood-calendar-grid">{days.map((day) => <i key={day.date} data-level={day.level} className={`${day.future ? "future" : ""} ${day.today ? "today" : ""}`}
        title={day.future ? undefined : `${day.date} · ${day.count ? `기록 ${day.count}개 · 평균 강도 ${day.averageIntensity}` : "기록 없음"}`} />)}</div>
    </div>
    <figcaption className="mood-scale"><span>적음</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} data-level={level} />)}<span>많음</span></figcaption>
  </figure>;
}
