"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { TerrainMap } from "@/components/charts/terrain-map";
import { Icon } from "@/components/icon";
import { journalStore } from "@/components/journal/journal-store";
import { MoodCalendar } from "@/components/journal/mood-calendar";
import { ReflectionCard } from "@/components/journal/reflection-card";
import { useAllModuleResults } from "@/components/results/use-module-result";
import { useModuleProgress, type ModuleProgress } from "@/components/use-module-progress";
import { emotionOptions } from "@/data/journal";
import { assessmentModules } from "@/data/modules";
import { recordStreak } from "@/lib/journal-calendar";
import { summarizeWeek, weekOf } from "@/lib/weekly";
import { practiceLogStore } from "@/components/practice-board";
import { snapshotStore } from "@/components/history/snapshot-store";
import { WellbeingSummaryCard } from "@/components/wellbeing/wellbeing-summary";

function greeting(hour: number) {
  if (hour < 5) return "늦은 밤이에요";
  if (hour < 11) return "좋은 아침이에요";
  if (hour < 17) return "오늘 하루는 어떤가요";
  return "편안한 저녁이에요";
}

/** 다음에 하면 좋을 한 가지. 이어서 할 모듈 → 새 모듈 → 기록 → 실천 순서로 고릅니다. */
function NextStep({ modules, journalCount }: { modules: readonly ModuleProgress[]; journalCount: number }) {
  const inProgress = modules.find((item) => !item.completed && item.answered > 0);
  const fresh = [...modules].filter((item) => !item.completed && item.answered === 0).sort((a, b) => assessmentModules[a.id].estimatedMinutes - assessmentModules[b.id].estimatedMinutes)[0];
  let title: string;
  let text: string;
  let href: string;
  let action: string;
  if (inProgress) {
    title = `${assessmentModules[inProgress.id].title}, 이어서 해 볼까요?`;
    text = `${inProgress.total}문항 중 ${inProgress.answered}개에 답했어요. 남은 문항을 마치면 지도에 새 봉우리가 솟아요.`;
    href = `/questions/${inProgress.id}`;
    action = "이어서 하기";
  } else if (fresh) {
    title = `다음 지역: ${assessmentModules[fresh.id].title}`;
    text = `${assessmentModules[fresh.id].tagline}. 약 ${assessmentModules[fresh.id].estimatedMinutes}분이면 끝나요.`;
    href = `/questions/${fresh.id}`;
    action = "시작하기";
  } else if (journalCount === 0) {
    title = "지도를 일상으로 가져와 볼까요";
    text = "설문이 ‘평소의 나’라면, 기록은 ‘그 순간의 나’예요. 오늘 마음이 크게 움직인 순간 하나를 적어 보세요.";
    href = "/journal";
    action = "첫 기록 남기기";
  } else {
    title = "작은 연습 하나";
    text = "결과와 연결된 2–15분짜리 연습 중 하나를 골라 오늘 해 보세요.";
    href = "/practice";
    action = "실천 카드 보기";
  }
  return <section className="next-step-card" aria-labelledby="next-step-title">
    <h2 id="next-step-title">{title}</h2>
    <p>{text}</p>
    <Link className="button" href={href}>{action} <Icon name="arrow" size={16} /></Link>
  </section>;
}

export function HomeDashboard({ onShowIntro }: { onShowIntro: () => void }) {
  const { modules, completedCount } = useModuleProgress();
  const { results } = useAllModuleResults(false);
  const journal = journalStore.useValue();
  const [now] = useState(() => new Date());
  const entries = journal.value;
  const streak = recordStreak(entries, now);
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const thisWeek = entries.filter((entry) => Date.parse(entry.createdAt) >= weekAgo).length;

  return <>
    <div className="dash-hero">
      <div>
        <h1>{greeting(now.getHours())}</h1>
        <p>{completedCount > 0 ? `지도에 ${completedCount}개 지역이 그려져 있어요. 오늘은 어디를 걸어 볼까요?` : "아직 그려진 지역은 없지만, 응답하던 모듈이 기다리고 있어요."}</p>
      </div>
      <div className="hero-actions" style={{ marginTop: 0 }}>
        <Link className="button button-secondary" href="/journal"><Icon name="pen" size={17} /> 기록하기</Link>
        <button type="button" className="text-link" onClick={onShowIntro}>소개 화면 보기</button>
      </div>
    </div>
    <div className="dash-grid">
      <div className="result-stack">
        <section className="viz-card dash-terrain" aria-labelledby="dash-terrain-title">
          <div className="viz-heading"><div><h2 id="dash-terrain-title">나의 마음 지형도</h2><p className="viz-caption" style={{ marginTop: 2 }}>봉우리를 누르면 그 모듈의 자세한 결과로 이동해요.</p></div><Link className="text-link" href="/results">전체 지도 <Icon name="chevron" size={13} /></Link></div>
          <TerrainMap results={results} compact />
        </section>
        <section className="viz-card" aria-labelledby="dash-journal-title">
          <div className="viz-heading"><div><h2 id="dash-journal-title">기록의 리듬</h2><p className="viz-caption" style={{ marginTop: 2 }}>최근 12주 동안 마음 기록을 남긴 날이에요. 칸의 진하기는 기록 수예요.</p></div><Link className="text-link" href="/journal">마음 기록 <Icon name="chevron" size={13} /></Link></div>
          <div className="rhythm-body"><div className="stat-row">
            <div><strong>{entries.length}</strong><span>전체 기록</span></div>
            <div><strong>{thisWeek}</strong><span>최근 7일</span></div>
            <div><strong>{streak}</strong><span>이어서 기록한 날</span></div>
          </div>
          <MoodCalendar entries={entries} /></div>
          {entries.length > 0 && <>
            <h3 style={{ margin: "20px 0 4px", fontSize: 15 }}>최근 기록</h3>
            <ul className="recent-entries">{entries.slice(0, 3).map((entry) => <li key={entry.id}><Link href="/journal">
              <strong>{entry.situation || entry.thought}</strong>
              <small>{new Date(entry.createdAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })} · {entry.emotions.map((id) => emotionOptions.find((item) => item.id === id)?.label ?? id).join(", ")} · 강도 {entry.intensity}</small>
            </Link></li>)}</ul>
          </>}
        </section>
      </div>
      <div className="dash-side">
        <NextStep modules={modules} journalCount={entries.length} />
        <WellbeingSummaryCard />
        <section className="viz-card" aria-labelledby="dash-modules-title">
          <div className="viz-heading" style={{ marginBottom: 6 }}><h2 id="dash-modules-title">네 지역</h2><span className="subtle-label">{completedCount} / {modules.length}</span></div>
          <ul className="module-checklist">{modules.map((item) => <li key={item.id}><Link href={item.completed ? `/results/${item.id}` : `/questions/${item.id}`}>
            <span className={`check ${item.completed ? "done" : item.answered > 0 ? "partial" : ""}`}>{item.completed ? <Icon name="check" size={14} /> : item.answered > 0 ? `${Math.round((item.answered / item.total) * 100)}` : null}</span>
            <span><strong>{assessmentModules[item.id].title}</strong><small>{item.completed ? "완료 · 결과 보기" : item.answered > 0 ? `${item.answered}/${item.total} 응답 중` : `${item.total}문항 · 약 ${assessmentModules[item.id].estimatedMinutes}분`}</small></span>
            <Icon name="chevron" size={15} className="chev" />
          </Link></li>)}</ul>
        </section>
        <ThisWeek now={now} />
        <ReflectionCard />
      </div>
    </div>
  </>;
}

/** 이번 주(월–일) 기록·실천을 한 장으로 요약하고 주간 돌아보기로 이어 줍니다. */
function ThisWeek({ now }: { now: Date }) {
  const journal = journalStore.useValue();
  const practice = practiceLogStore.useValue();
  const snapshots = snapshotStore.useValue();
  const week = summarizeWeek(weekOf(now, 0), journal.value, practice.value, snapshots.value);
  const today = (now.getDay() + 6) % 7;
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - today + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const active = journal.value.some((entry) => { const d = new Date(entry.createdAt); return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate(); })
      || Object.values(practice.value).includes(key);
    return { label: "월화수목금토일"[index], active, today: index === today, future: index > today };
  });
  return <section className="viz-card" aria-labelledby="this-week-title">
    <div className="viz-heading" style={{ marginBottom: 10 }}><h2 id="this-week-title">이번 주</h2><Link className="text-link" href="/review">주간 돌아보기 <Icon name="chevron" size={13} /></Link></div>
    <ol className="week-dots" aria-label={`이번 주 ${week.activeDays}일 기록하거나 연습했어요`}>{days.map((day) => <li key={day.label} className={`${day.active ? "active" : ""} ${day.today ? "today" : ""} ${day.future ? "future" : ""}`}><i aria-hidden="true">{day.active ? <Icon name="check" size={12} /> : null}</i>{day.label}</li>)}</ol>
    <p className="viz-caption">기록 {week.entries}개 · 실천 {week.practicesDone.length}개{week.topEmotion ? ` · 자주 적은 감정 ‘${emotionOptions.find((item) => item.id === week.topEmotion!.id)!.label}’` : ""}</p>
  </section>;
}

/** 진행 기록이 있으면 대시보드, 없으면 소개 화면. 저장소는 브라우저에서만 읽으므로 첫 렌더는 소개 화면입니다. */
export function HomeSwitch({ landing }: { landing: ReactNode }) {
  const { ready, modules } = useModuleProgress();
  const journal = journalStore.useValue();
  const [showIntro, setShowIntro] = useState(false);
  const returning = ready && journal.ready && (modules.some((item) => item.answered > 0) || journal.value.length > 0);
  if (!returning || showIntro) return <>
    {returning && <div className="preview-notice" style={{ marginTop: 0 }}><Icon name="home" size={18} /><p>소개 화면을 보고 있어요. <button type="button" className="inline-link" style={{ border: 0, background: "none", padding: 0, font: "inherit" }} onClick={() => setShowIntro(false)}>내 대시보드로 돌아가기</button></p></div>}
    {landing}
  </>;
  return <HomeDashboard onShowIntro={() => setShowIntro(true)} />;
}
