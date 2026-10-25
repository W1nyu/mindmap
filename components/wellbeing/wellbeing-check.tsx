"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { WELLBEING_PERIOD_DAYS, wellbeingBands, wellbeingItems, wellbeingMeasurementNote, wellbeingOptions, type WellbeingValue } from "@/data/wellbeing";
import { createCheck, itemAverages, MEANINGFUL_CHANGE, nextCheckDate, wellbeingTrend, type WellbeingCheck } from "@/lib/wellbeing";
import { ItemProfile, WellbeingGauge, WellbeingTrend } from "./wellbeing-charts";
import { wellbeingStore } from "./wellbeing-store";

const longDate = (date: Date) => date.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });

function CheckForm({ onDone, onCancel }: { onDone: (check: WellbeingCheck) => void; onCancel: (() => void) | null }) {
  const [answers, setAnswers] = useState<(WellbeingValue | null)[]>(() => wellbeingItems.map(() => null));
  const answered = answers.filter((value) => value !== null).length;
  const complete = answered === wellbeingItems.length;
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!complete) return;
    onDone(createCheck(answers as WellbeingValue[], new Date(), `w-${crypto.randomUUID()}`));
  }
  return <form className="viz-card wb-form" onSubmit={submit} aria-labelledby="wb-form-title">
    <div className="viz-heading"><div><h2 id="wb-form-title">지난 2주 동안 나는…</h2><p className="viz-caption" style={{ marginTop: 2 }}>각 문장이 얼마나 자주 그랬는지 골라 주세요. 다섯 문장, 1분이면 끝나요.</p></div><span className="subtle-label">{answered} / {wellbeingItems.length}</span></div>
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
      <button type="submit" className="button button-primary" disabled={!complete}>{complete ? "체크 저장하고 결과 보기" : `${wellbeingItems.length - answered}문장 남았어요`}</button>
      {onCancel && <button type="button" className="text-link" onClick={onCancel}>취소</button>}
    </div>
  </form>;
}

export function WellbeingCheckApp() {
  const store = wellbeingStore.useValue();
  const [mode, setMode] = useState<"auto" | "form" | "result">("auto");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [now] = useState(() => Date.now());
  const go = (next: "form" | "result") => {
    setMode(next);
    window.scrollTo({ top: 0 });
  };
  const checks = store.value;
  const points = useMemo(() => wellbeingTrend(checks), [checks]);
  if (!store.ready) return <p role="status">저장된 체크를 확인하고 있어요.</p>;

  const showForm = mode === "form" || (mode === "auto" && checks.length === 0);
  if (showForm) {
    return <CheckForm onCancel={checks.length > 0 ? () => go("result") : null} onDone={(check) => { wellbeingStore.set([check, ...checks]); go("result"); }} />;
  }

  const latest = points[points.length - 1];
  const previous = points.length > 1 ? points[points.length - 2] : null;
  const band = wellbeingBands.find((item) => item.id === latest.band)!;
  const next = nextCheckDate(checks, WELLBEING_PERIOD_DAYS)!;
  const averages = checks.length > 1 ? itemAverages(checks) : null;
  const strongest = wellbeingItems[latest.answers.indexOf(Math.max(...latest.answers) as WellbeingValue)];
  const recent = now < next.getTime();

  return <div className="result-stack">
    <div className="wb-top">
      <section className={`viz-card wb-score-card ${latest.band}`} aria-labelledby="wb-score-title">
        <div className="viz-heading"><div><h2 id="wb-score-title">최근 2주의 웰빙</h2><p className="viz-caption" style={{ marginTop: 2 }}>{longDate(new Date(latest.takenAt))} 체크 · 원점수 {latest.raw}/25</p></div></div>
        <div className="wb-score-line"><strong>{latest.score}</strong><span>/ 100</span>{latest.change !== null && <em className={latest.meaningful ? (latest.change > 0 ? "up" : "down") : ""}>{latest.change > 0 ? "+" : ""}{latest.change}{latest.meaningful ? " · 의미 있는 변화" : " · 비슷한 수준"}</em>}</div>
        <WellbeingGauge point={latest} previous={previous} />
        <h3 className="wb-band-label">{band.label}</h3>
        <p className="viz-text">{band.text}</p>
        {latest.band === "veryLow" && <Link className="button button-secondary" href="/support"><Icon name="heart" size={16} /> 도움 받을 곳 보기</Link>}
      </section>
      <section className="viz-card" aria-labelledby="wb-items-title">
        <div className="viz-heading"><div><h2 id="wb-items-title">다섯 영역</h2><p className="viz-caption" style={{ marginTop: 2 }}>칸 수는 그 상태가 있었던 빈도(0–5)예요.{averages ? " 세로 표시는 지금까지의 평균이에요." : ""}</p></div></div>
        <ItemProfile answers={latest.answers} averages={averages} />
        <div className="wb-item-notes">
          {latest.answers[wellbeingItems.indexOf(strongest)] >= 3 && <p><Icon name="leaf" size={15} /> <span>지금 나를 가장 받쳐 주는 영역은 <strong>{strongest.short}</strong>. 무엇이 이 부분을 지켜 주었는지 떠올려 보세요.</span></p>}
          {latest.lowItems.length > 0 && <p><Icon name="spark" size={15} /> <span>‘가끔’ 이하였던 영역은 <strong>{latest.lowItems.map((id) => wellbeingItems.find((item) => item.id === id)!.short).join(", ")}</strong>. 다음 2주에 조금 더 돌봐 줄 곳이에요.</span></p>}
        </div>
      </section>
    </div>

    <section className="viz-card" aria-labelledby="wb-trend-title">
      <div className="viz-heading"><div><h2 id="wb-trend-title">시간에 따른 변화</h2><p className="viz-caption" style={{ marginTop: 2 }}>성격 경향과 달리 상태는 자주 바뀌어요. 2주마다 체크하면 흐름이 보여요.</p></div><span className="subtle-label">{checks.length}회 체크</span></div>
      {points.length > 1 ? <WellbeingTrend points={points} /> : <p className="viz-text">체크가 두 번 이상 쌓이면 점수의 흐름과 {MEANINGFUL_CHANGE}점 이상의 의미 있는 변화를 선으로 보여드려요. 다음 체크는 <strong>{longDate(next)}</strong> 이후를 권해요.</p>}
    </section>

    <div className="wb-actions">
      <button type="button" className="button button-primary" onClick={() => go("form")}><Icon name="pulse" size={17} /> 새로 체크하기</button>
      <p className="viz-caption">{recent ? `WHO-5는 지난 2주를 묻기 때문에 ${longDate(next)} 이후에 다시 체크하면 겹치지 않아요.` : "지난 체크에서 2주가 지났어요. 지금 체크하면 새로운 2주를 볼 수 있어요."}</p>
    </div>

    <section className="viz-card" aria-labelledby="wb-history-title">
      <div className="viz-heading"><h2 id="wb-history-title">체크 기록</h2></div>
      <ul className="wb-history">{[...points].reverse().map((point) => <li key={point.id}>
        <span className="wb-history-date">{longDate(new Date(point.takenAt))}</span>
        <span className={`wb-history-score ${point.band}`}>{point.score}</span>
        <span className="wb-history-band">{wellbeingBands.find((item) => item.id === point.band)!.label}{point.change !== null ? ` · ${point.change > 0 ? "+" : ""}${point.change}` : ""}</span>
        {confirmDelete === point.id
          ? <span className="wb-history-confirm"><button type="button" className="text-link danger" onClick={() => { wellbeingStore.set(checks.filter((check) => check.id !== point.id)); setConfirmDelete(""); }}>지우기</button><button type="button" className="text-link" onClick={() => setConfirmDelete("")}>취소</button></span>
          : <button type="button" className="icon-button" aria-label={`${longDate(new Date(point.takenAt))} 체크 지우기`} onClick={() => setConfirmDelete(point.id)}><Icon name="trash" size={16} /></button>}
      </li>)}</ul>
    </section>

    <div className="measurement-note"><Icon name="shield" size={16} /><p>{wellbeingMeasurementNote} 점수 구간은 Topp 외(2015) 체계적 고찰에서 널리 쓰는 기준이에요. 문장은 SelfMap이 옮긴 표현이라 공식 한국어판과 다를 수 있어요.</p></div>
  </div>;
}
