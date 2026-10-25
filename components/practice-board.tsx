"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { useAllModuleResults } from "@/components/results/use-module-result";
import { assessmentModules, moduleIds } from "@/data/modules";
import { practices, type Practice } from "@/data/practices";
import { localDateStamp } from "@/components/journal/journal-store";
import { createLocalStore } from "@/lib/local-store";
import { parsePracticeLog, PRACTICE_LOG_KEY, recommendPractices, type PracticeLog, type PracticeRecommendation } from "@/lib/practice";

export const practiceLogStore = createLocalStore<PracticeLog>(PRACTICE_LOG_KEY, parsePracticeLog, {});

function PracticeCard({ practice, reasons, doneOn, onToggle }: { practice: Practice; reasons?: PracticeRecommendation["reasons"]; doneOn?: string; onToggle: () => void }) {
  return <article className={`practice-card ${doneOn ? "done" : ""}`}>
    <div className="practice-top"><span className="practice-minutes"><Icon name="clock" size={13} /> 약 {practice.minutes}분</span>{doneOn && <span className="practice-done-label"><Icon name="check" size={12} /> {doneOn.slice(5).replace("-", "월 ")}일에 해 봤어요</span>}</div>
    <h3>{practice.title}</h3>
    <p className="practice-why">{practice.why}</p>
    <ol className="practice-steps">{practice.steps.map((step) => <li key={step}>{step}</li>)}</ol>
    {reasons && reasons.length > 0 && <p className="practice-reasons">추천 근거 · {reasons.map((reason) => `${assessmentModules[reason.module].scales.find((scale) => scale.id === reason.scale)!.name} ${reason.score}${reason.level === "high" ? "(높음)" : "(낮음)"}`).join(", ")}</p>}
    <div className="practice-bottom"><span className="practice-basis">{practice.basis}</span><button type="button" className="text-link" onClick={onToggle} aria-pressed={Boolean(doneOn)}>{doneOn ? "기록 지우기" : "오늘 해 봤어요"}</button></div>
  </article>;
}

export function PracticeBoard() {
  const { ready, results } = useAllModuleResults(false);
  const log = practiceLogStore.useValue();
  const recommendations = useMemo(() => recommendPractices(results), [results]);
  const [maxMinutes, setMaxMinutes] = useState<number | null>(null);
  if (!ready || !log.ready) return <p role="status">결과를 확인하고 있어요.</p>;
  const completed = moduleIds.filter((id) => results[id]).length;
  const recommendedIds = new Set(recommendations.map((item) => item.practice.id));
  const fits = (practice: Practice) => maxMinutes === null || practice.minutes <= maxMinutes;
  const rest = practices.filter((item) => !recommendedIds.has(item.id));
  const others = (completed === 0 ? practices : rest).filter(fits);
  const doneCount = Object.keys(log.value).length;
  const toggle = (id: string) => {
    const next = { ...log.value };
    if (next[id]) delete next[id];
    else next[id] = localDateStamp();
    practiceLogStore.set(next);
  };
  return <>
    {completed === 0 ? <div className="empty-panel"><h2>결과에 맞춘 추천은 모듈을 마치면 열려요</h2><p className="viz-text">지금은 모든 연습을 둘러볼 수 있어요. 모듈을 하나라도 마치면 점수와 연결된 연습을 근거와 함께 먼저 보여드려요.</p><Link className="button button-primary" href="/questions">모듈 고르기 <Icon name="arrow" size={16} /></Link></div>
      : <section aria-labelledby="recommended-title"><div className="section-heading"><div><span className="eyebrow small">FOR ME</span><h2 id="recommended-title">나에게 맞춘 연습 {recommendations.length}개</h2><p>점수가 63 이상이거나 37 이하인 척도와 연결된 연습이에요. 연결된 근거가 많은 순서로 보여줘요.</p></div></div>
        {recommendations.length > 0 ? <div className="practice-grid">{recommendations.map((item) => <PracticeCard key={item.practice.id} practice={item.practice} reasons={item.reasons} doneOn={log.value[item.practice.id]} onToggle={() => toggle(item.practice.id)} />)}</div>
          : <p className="viz-text">두드러진 점수와 연결된 연습이 없어요. 아래에서 끌리는 연습을 자유롭게 골라 보세요.</p>}
      </section>}
    <section aria-labelledby="all-title"><div className="section-heading"><div><h2 id="all-title">{completed === 0 ? "모든 연습" : "다른 연습"}</h2><p>지금까지 {doneCount}가지 연습을 해 봤어요. 시간이 짧은 연습부터 골라 볼 수도 있어요.</p></div>
        <div className="view-switch" role="group" aria-label="걸리는 시간으로 거르기">{[null, 3, 5].map((value) => <button key={String(value)} type="button" aria-pressed={maxMinutes === value} onClick={() => setMaxMinutes(value)}>{value === null ? "전체" : `${value}분 이내`}</button>)}</div></div>
      {others.length === 0 && <p className="viz-text">이 시간 안에 할 수 있는 다른 연습이 없어요. ‘전체’를 눌러 모두 보세요.</p>}
      <div className="practice-grid">{others.map((practice) => <PracticeCard key={practice.id} practice={practice} doneOn={log.value[practice.id]} onToggle={() => toggle(practice.id)} />)}</div>
    </section>
    <p className="quiet-note"><Icon name="shield" size={16} /> ‘해 봤어요’ 기록은 이 기기의 브라우저에만 저장돼요.{log.available ? "" : " 지금은 저장 기능을 쓸 수 없어 새로고침하면 사라져요."}</p>
  </>;
}
