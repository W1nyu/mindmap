"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { snapshotStore } from "@/components/history/snapshot-store";
import { Icon } from "@/components/icon";
import { EmotionFlow } from "@/components/journal/emotion-flow";
import { journalStore } from "@/components/journal/journal-store";
import { practiceLogStore } from "@/components/practice-board";
import { defenseMeta } from "@/data/defense-mechanisms";
import { emotionOptions, needOptions } from "@/data/journal";
import { practices } from "@/data/practices";
import { intensityChange, summarizeWeek, weekOf } from "@/lib/weekly";

const label = (date: string) => `${Number(date.slice(5, 7))}월 ${Number(date.slice(8, 10))}일`;

/** 한 주 동안의 기록·연습·결과 저장을 돌아봅니다. 모든 계산은 이 브라우저 안에서만 합니다. */
export function WeeklyReview() {
  const journal = journalStore.useValue();
  const practice = practiceLogStore.useValue();
  const snapshots = snapshotStore.useValue();
  const [offset, setOffset] = useState(0);
  const [now] = useState(() => new Date());
  const { current, previous } = useMemo(() => ({
    current: summarizeWeek(weekOf(now, offset), journal.value, practice.value, snapshots.value),
    previous: summarizeWeek(weekOf(now, offset - 1), journal.value, practice.value, snapshots.value),
  }), [now, offset, journal.value, practice.value, snapshots.value]);
  if (!journal.ready || !practice.ready || !snapshots.ready) return <p role="status">기록을 불러오고 있어요.</p>;
  const change = intensityChange(current, previous);
  const weekEntries = journal.value.filter((entry) => { const time = Date.parse(entry.createdAt); return time >= current.range.startMs && time < current.range.endMs; });
  const weekWord = offset === 0 ? "이번 주" : "이 주";
  const empty = current.entries === 0 && current.practicesDone.length === 0 && current.snapshotsSaved === 0;

  return <div className="result-stack">
    <div className="week-nav" role="group" aria-label="주 이동">
      <button type="button" className="text-link" onClick={() => setOffset((value) => value - 1)}><Icon name="chevron" size={14} style={{ transform: "rotate(180deg)" }} /> 이전 주</button>
      <strong>{label(current.range.startDate)} – {label(current.range.endDate)}{offset === 0 ? " · 이번 주" : ""}</strong>
      <button type="button" className="text-link" disabled={offset >= 0} onClick={() => setOffset((value) => Math.min(0, value + 1))}>다음 주 <Icon name="chevron" size={14} /></button>
    </div>
    {empty ? <div className="empty-panel"><h2>이 주에는 남긴 기록이 없어요</h2><p className="viz-text">괜찮아요. 기록이 없는 주도 하나의 흐름이에요. 마음이 크게 움직인 순간이 있었다면 짧게라도 적어 보세요.</p><div className="hero-actions"><Link className="button button-primary" href="/journal">마음 기록 쓰기 <Icon name="arrow" size={16} /></Link><Link className="text-link" href="/practice">실천 카드 보기 <Icon name="chevron" size={14} /></Link></div></div> : <>
      <dl className="stat-tiles week-tiles">
        <div><dt>기록</dt><dd>{current.entries}<small>개 · 지난주 {previous.entries}개</small></dd></div>
        <div><dt>기록하거나 연습한 날</dt><dd>{current.activeDays}<small>/ 7일</small></dd></div>
        <div><dt>평균 강도</dt><dd>{current.averageIntensity ?? "—"}<small>{change === null ? "지난주와 비교할 기록 없음" : `지난주보다 ${change > 0 ? "+" : change < 0 ? "−" : "±"}${Math.abs(change)}`}</small></dd></div>
        <div><dt>가라앉은 정도</dt><dd>{current.averageDrop === null ? "—" : `−${Math.abs(current.averageDrop)}`}<small>나중 강도를 적은 기록 기준</small></dd></div>
      </dl>
      <section className="viz-card" aria-labelledby="week-pattern-title">
        <div className="viz-heading"><div><h2 id="week-pattern-title">{weekWord}에 자주 보인 것</h2></div></div>
        <ul className="week-list">
          <li><span>가장 자주 기록한 감정</span><strong>{current.topEmotion ? `${emotionOptions.find((item) => item.id === current.topEmotion!.id)!.label} · ${current.topEmotion.count}회` : "—"}</strong></li>
          <li><span>가장 자주 바랐던 것</span><strong>{current.topNeed ? `${needOptions.find((item) => item.id === current.topNeed!.id)!.label} · ${current.topNeed.count}회` : "—"}</strong></li>
          <li><span>알아차린 방어 방식</span><strong>{current.defenses.length ? current.defenses.slice(0, 4).map((item) => `${defenseMeta(item.id).name} ${item.count}`).join(" · ") : "—"}</strong></li>
          <li><span>해 본 실천 카드</span><strong>{current.practicesDone.length ? current.practicesDone.map((id) => practices.find((item) => item.id === id)?.title ?? id).join(" · ") : "—"}</strong></li>
          <li><span>저장한 결과 기록</span><strong>{current.snapshotsSaved}개</strong></li>
        </ul>
        <p className="viz-caption">강도의 높고 낮음은 좋고 나쁨이 아니에요. 힘든 일이 많았던 주에는 강도가 높은 게 자연스러워요. 기록을 남겼다는 것 자체가 나를 살핀 시간이에요.</p>
      </section>
      {weekEntries.length > 0 && <section className="viz-card" aria-labelledby="week-flow-title">
        <div className="viz-heading"><div><h2 id="week-flow-title">{weekWord}의 감정과 바람</h2></div></div>
        <EmotionFlow entries={weekEntries} />
      </section>}
      <section className="reflection-card" aria-labelledby="week-question-title">
        <span className="eyebrow small">LOOKING BACK</span>
        <h2 id="week-question-title">{current.topEmotion ? `${weekWord} ‘${emotionOptions.find((item) => item.id === current.topEmotion!.id)!.label}’이(가) 자주 찾아왔어요. 그 감정은 나에게 무엇을 알려 주려 했을까요?` : `${weekWord}를 한 문장으로 표현한다면 어떤 문장일까요?`}</h2>
        <p className="viz-caption">답은 마음 기록에 적어도, 그냥 생각만 해도 괜찮아요.</p>
      </section>
    </>}
    <p className="quiet-note"><Icon name="shield" size={16} /> 주간 요약은 이 브라우저에 저장된 기록으로만 계산되고 어디에도 전송되지 않아요.</p>
  </div>;
}
