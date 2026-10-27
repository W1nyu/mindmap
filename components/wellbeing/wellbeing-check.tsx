"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { wellbeingBands, wellbeingItems, wellbeingOptions, wellbeingPeriods, type WellbeingPeriod, type WellbeingValue } from "@/data/wellbeing";
import { addCheck, createCheck, itemAverages, wellbeingTrend, type WellbeingCheck } from "@/lib/wellbeing";
import { ItemProfile, WellbeingGauge, WellbeingTrend } from "./wellbeing-charts";
import { wellbeingStore } from "./wellbeing-store";

const longDate = (date: Date) => date.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
/** 체크는 ‘오늘’ 하루 단위로만 받습니다. 이전에 저장된 이번 주·지난 2주 기록은 기록과 추이에서 그대로 보여요. */
function CheckForm({ onDone, onCancel }: { onDone: (check: WellbeingCheck) => void; onCancel: (() => void) | null }) {
  const [answers, setAnswers] = useState<(WellbeingValue | null)[]>(() => wellbeingItems.map(() => null));
  const answered = answers.filter((value) => value !== null).length;
  const complete = answered === wellbeingItems.length;
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!complete) return;
    onDone(createCheck(answers as WellbeingValue[], new Date(), `w-${crypto.randomUUID()}`, "day"));
  }
  return <form className="viz-card wb-form" onSubmit={submit} aria-labelledby="wb-form-title">
    <div className="viz-heading"><div><h2 id="wb-form-title">{wellbeingPeriods.day.heading}</h2><p className="viz-caption" style={{ marginTop: 2 }}>오늘 하루 얼마나 자주 그랬는지 골라 주세요.</p></div><span className="subtle-label">{answered} / {wellbeingItems.length}</span></div>
    <ol className="wb-questions">
      {wellbeingItems.map((item, index) => <li key={item.id}>
        <fieldset>
          <legend><span className="wb-q-number">{index + 1}</span>{item.text}</legend>
          <div className="wb-options">
            {wellbeingOptions.map((option) => <label key={option.value} className={answers[index] === option.value ? "selected" : ""}>
              <input type="radio" name={item.id} value={option.value} checked={answers[index] === option.value} onChange={() => setAnswers((list) => list.map((value, at) => (at === index ? option.value : value)))} />
              <span>{option.label}</span>
            </label>)}
          </div>
        </fieldset>
      </li>)}
    </ol>
    <div className="session-actions">
      <button type="submit" className="button button-primary" disabled={!complete}>{complete ? "체크 저장" : `${wellbeingItems.length - answered}문장 남았어요`}</button>
      {onCancel && <button type="button" className="text-link" onClick={onCancel}>취소</button>}
    </div>
    <p className="viz-caption">하루에 한 번 기록해요. 오늘 다시 체크하면 오늘 기록이 새 응답으로 바뀌어요.</p>
  </form>;
}

export function WellbeingCheckApp() {
  const store = wellbeingStore.useValue();
  const [mode, setMode] = useState<"auto" | "form" | "result">("auto");
  const [filter, setFilter] = useState<WellbeingPeriod | "all">("all");
  const [confirmDelete, setConfirmDelete] = useState("");
  const go = (next: "form" | "result") => {
    setMode(next);
    window.scrollTo({ top: 0 });
  };
  const checks = store.value;
  const allPoints = useMemo(() => wellbeingTrend(checks), [checks]);
  const periodsUsed = useMemo(() => [...new Set(checks.map((check) => check.period))], [checks]);
  const trendPoints = useMemo(() => wellbeingTrend(checks, filter === "all" ? undefined : filter), [checks, filter]);
  if (!store.ready) return <p role="status">저장된 체크를 확인하고 있어요.</p>;

  const latest = allPoints[allPoints.length - 1];
  const showForm = mode === "form" || (mode === "auto" && checks.length === 0);
  if (showForm) {
    return <CheckForm onCancel={checks.length > 0 ? () => go("result") : null} onDone={(check) => { wellbeingStore.set(addCheck(checks, check)); go("result"); }} />;
  }

  const samePeriod = wellbeingTrend(checks, latest.period);
  const previous = samePeriod.length > 1 ? samePeriod[samePeriod.length - 2] : null;
  const change = samePeriod[samePeriod.length - 1];
  const band = wellbeingBands.find((item) => item.id === latest.band)!;
  const averages = checks.length > 1 ? itemAverages(checks) : null;
  const strongest = wellbeingItems[latest.answers.indexOf(Math.max(...latest.answers) as WellbeingValue)];

  return <div className="result-stack">
    <div className="wb-actions">
      <button type="button" className="button button-primary" onClick={() => go("form")}><Icon name="pulse" size={17} /> 새로 체크하기</button>
      <p className="viz-caption">매일 비슷한 때에 오늘을 체크하면 변화가 잘 보여요.</p>
    </div>
    <div className="wb-top">
      <section className={`viz-card wb-score-card ${latest.band}`} aria-labelledby="wb-score-title">
        <div className="viz-heading"><div><h2 id="wb-score-title">{wellbeingPeriods[latest.period].label}의 상태</h2><p className="viz-caption" style={{ marginTop: 2 }}>{longDate(new Date(latest.takenAt))} 체크 · 원점수 {latest.raw}/25</p></div></div>
        <div className="wb-score-line"><strong>{latest.score}</strong><span>/ 100</span>{change.change !== null && <em className={change.meaningful ? (change.change > 0 ? "up" : "down") : ""}>{change.change > 0 ? "+" : ""}{change.change}{change.meaningful ? " · 큰 변화" : " · 비슷한 수준"}</em>}</div>
        <WellbeingGauge point={latest} previous={previous} />
        <h3 className="wb-band-label">{band.label}</h3>
        <p className="viz-text">{band.text}</p>
      </section>
      <section className="viz-card" aria-labelledby="wb-items-title">
        <div className="viz-heading"><div><h2 id="wb-items-title">다섯 영역</h2>{averages && <p className="viz-caption" style={{ marginTop: 2 }}>세로 표시는 평균이에요.</p>}</div></div>
        <ItemProfile answers={latest.answers} averages={averages} />
        <div className="wb-item-notes">
          {latest.answers[wellbeingItems.indexOf(strongest)] >= 3 && <p><Icon name="leaf" size={15} /> <span>지금 나를 가장 받쳐 주는 영역은 <strong>{strongest.short}</strong>.</span></p>}
          {latest.lowItems.length > 0 && <p><Icon name="spark" size={15} /> <span>‘가끔’ 이하였던 영역은 <strong>{latest.lowItems.map((id) => wellbeingItems.find((item) => item.id === id)!.short).join(", ")}</strong>. 조금 더 돌봐 줄 곳이에요.</span></p>}
        </div>
      </section>
    </div>

    <section className="viz-card" aria-labelledby="wb-trend-title">
      <div className="viz-heading"><div><h2 id="wb-trend-title">시간에 따른 변화</h2></div>
        {periodsUsed.length > 1 ? <div className="wb-period small" role="group" aria-label="보는 기간">{(["all", ...periodsUsed] as const).map((id) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>{id === "all" ? "전체" : wellbeingPeriods[id].label}</button>)}</div>
          : <span className="subtle-label">{checks.length}회 체크</span>}</div>
      {trendPoints.length > 1 ? <WellbeingTrend points={trendPoints} /> : <p className="viz-text">두 번 이상 체크하면 변화가 선으로 보여요.</p>}
    </section>

    <section className="viz-card" aria-labelledby="wb-history-title">
      <div className="viz-heading"><h2 id="wb-history-title">체크 기록</h2></div>
      <ul className="wb-history">{[...allPoints].reverse().map((point) => <li key={point.id}>
        <span className="wb-history-date">{longDate(new Date(point.takenAt))} <small>{wellbeingPeriods[point.period].label}</small></span>
        <span className={`wb-history-score ${point.band}`}>{point.score}</span>
        <span className="wb-history-band">{wellbeingBands.find((item) => item.id === point.band)!.label}</span>
        {confirmDelete === point.id
          ? <span className="wb-history-confirm"><button type="button" className="text-link danger" onClick={() => { wellbeingStore.set(checks.filter((check) => check.id !== point.id)); setConfirmDelete(""); }}>지우기</button><button type="button" className="text-link" onClick={() => setConfirmDelete("")}>취소</button></span>
          : <button type="button" className="icon-button" aria-label={`${longDate(new Date(point.takenAt))} 체크 지우기`} onClick={() => setConfirmDelete(point.id)}><Icon name="trash" size={16} /></button>}
      </li>)}</ul>
    </section>

    <p className="viz-caption">WHO-5 웰빙 지표(WHO, 1998; Topp 외, 2015) · 원 척도는 2주를 묻지만 하루 단위로 기록하게 했어요. 같은 기간끼리 10점 이상 움직이면 ‘큰 변화’로 표시해요.</p>
  </div>;
}
