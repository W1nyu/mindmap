"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { createLocalStore } from "@/lib/local-store";
import { sders, stateEmotionMeta, stateEmotionOptions } from "@/data/emotion-state";
import { createEmotionStateCheck, EMOTION_STATE_STORAGE_KEY, emotionStateTrend, normalizeEmotionStateChecks, parseEmotionStateChecks, type EmotionStateCheck, type EmotionStatePoint } from "@/lib/emotion-state";

/** 지금 이 순간의 정서조절 기록. 변화를 보려는 것이라 이 기기(localStorage)에 남깁니다. */
const emotionStateStore = createLocalStore<EmotionStateCheck[]>(EMOTION_STATE_STORAGE_KEY, parseEmotionStateChecks, []);

const dateTime = (iso: string) => new Date(iso).toLocaleString("ko-KR", { month: "long", day: "numeric", weekday: "short", hour: "numeric", minute: "2-digit" });
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
const metaOf = (id: string) => stateEmotionMeta.find((meta) => meta.id === id)!;

function CheckForm({ onDone, onCancel }: { onDone: (check: EmotionStateCheck) => void; onCancel: (() => void) | null }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => sders.items.map(() => null));
  const answered = answers.filter((value) => value !== null).length;
  const complete = answered === sders.items.length;
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!complete) return;
    onDone(createEmotionStateCheck(answers as number[], new Date(), `s-${crypto.randomUUID()}`));
  }
  return <form className="viz-card wb-form" onSubmit={submit} aria-labelledby="sd-form-title">
    <div className="viz-heading"><div><h2 id="sd-form-title">지금 이 순간 내 감정에 얼마나 해당하나요?</h2><p className="viz-caption" style={{ marginTop: 2 }}>‘이렇게 느끼는 것’은 지금 느끼는 감정을 말해요. 떠오르는 대로 골라 주세요.</p><p className="viz-caption sd-scale-key">1 전혀 아니다 · 3 어느 정도 그렇다 · 5 완전히 그렇다</p></div><span className="subtle-label">{answered} / {sders.items.length}</span></div>
    <ol className="wb-questions">
      {sders.items.map((item, index) => <li key={item.id}>
        <fieldset>
          <legend><span className="wb-q-number">{index + 1}</span>{item.text}</legend>
          <div className="wb-options sd-options">
            {stateEmotionOptions.map((option) => <label key={option.value} className={answers[index] === option.value ? "selected" : ""}>
              <input type="radio" name={item.id} value={option.value} checked={answers[index] === option.value} onChange={() => setAnswers((list) => list.map((value, at) => (at === index ? option.value : value)))} />
              <span><b>{option.value + 1}</b><small className="sd-option-label">{option.label}</small></span>
            </label>)}
          </div>
        </fieldset>
      </li>)}
    </ol>
    <div className="session-actions">
      <button type="submit" className="button button-primary" disabled={!complete}>{complete ? "기록 저장" : `${sders.items.length - answered}문장 남았어요`}</button>
      {onCancel && <button type="button" className="text-link" onClick={onCancel}>취소</button>}
    </div>
  </form>;
}

/** 하위척도 평균(1–5). 높을수록 지금 그 부분이 어렵다는 뜻이에요. 세로 표시는 지금까지의 평균. */
function SubscaleBars({ point, averages }: { point: EmotionStatePoint; averages: Record<string, number> | null }) {
  return <ul className="sd-bars">
    {point.subscales.map((scale) => {
      const meta = metaOf(scale.id);
      const average = averages?.[scale.id];
      return <li key={scale.id} className={`sd-${scale.id}`}>
        <span className="sd-bar-name">{meta.shortName}<small>{meta.description}</small></span>
        <span className="sd-bar-track" aria-hidden="true">
          <i style={{ width: `${scale.score}%` }} />
          {average !== undefined && <b style={{ left: `${((average - 1) / 4) * 100}%` }} />}
        </span>
        <span className="sd-bar-value">{scale.mean.toFixed(1)}</span>
        <span className="sr-only">{`${meta.name} 평균 ${scale.mean.toFixed(1)} / 5${average !== undefined ? `, 지금까지 평균 ${average.toFixed(1)}` : ""}`}</span>
      </li>;
    })}
  </ul>;
}

const W = 640;
const H = 230;
const PAD = { left: 34, right: 16, top: 16, bottom: 30 };

/** 하위척도 평균(1–5)이 시간에 따라 움직이는 모습. */
function SubscaleTrend({ points }: { points: readonly EmotionStatePoint[] }) {
  const shown = points.slice(-24);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (index: number) => PAD.left + (shown.length === 1 ? innerW / 2 : (index / (shown.length - 1)) * innerW);
  const y = (mean: number) => PAD.top + (1 - (mean - 1) / 4) * innerH;
  const labelEvery = Math.max(1, Math.ceil(shown.length / 6));
  return <figure className="wb-trend-figure">
    <svg className="wb-trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`하위척도 변화: ${stateEmotionMeta.map((meta) => `${meta.shortName} ${shown.map((point) => point.subscales.find((scale) => scale.id === meta.id)!.mean.toFixed(1)).join("→")}`).join(", ")}`}>
      {[1, 2, 3, 4, 5].map((tick) => <g key={tick}><line className="wb-grid" x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} /><text className="wb-axis" x={PAD.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle">{tick}</text></g>)}
      {stateEmotionMeta.map((meta) => {
        const means = shown.map((point) => point.subscales.find((scale) => scale.id === meta.id)!.mean);
        return <g key={meta.id} className={`sd-series sd-${meta.id}`}>
          {shown.length > 1 && <path d={means.map((mean, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(mean).toFixed(1)}`).join(" ")} />}
          {means.map((mean, index) => <circle key={shown[index].id} cx={x(index)} cy={y(mean)} r={index === shown.length - 1 ? 5 : 3.5}><title>{`${shortDate(shown[index].takenAt)} · ${meta.shortName} ${mean.toFixed(1)}`}</title></circle>)}
        </g>;
      })}
      {shown.map((point, index) => (index % labelEvery === 0 || index === shown.length - 1) && <text key={point.id} className="wb-axis" x={x(index)} y={H - 8} textAnchor="middle">{shortDate(point.takenAt)}</text>)}
    </svg>
    <figcaption className="sd-legend">{stateEmotionMeta.map((meta) => <span key={meta.id} className={`sd-${meta.id}`}><i aria-hidden="true" />{meta.shortName}</span>)}</figcaption>
  </figure>;
}

export function EmotionStateCheckApp() {
  const store = emotionStateStore.useValue();
  const [mode, setMode] = useState<"auto" | "form" | "result">("auto");
  const [confirmDelete, setConfirmDelete] = useState("");
  const go = (next: "form" | "result") => {
    setMode(next);
    window.scrollTo({ top: 0 });
  };
  const checks = store.value;
  const points = useMemo(() => emotionStateTrend(checks), [checks]);
  if (!store.ready) return <p role="status">저장된 기록을 확인하고 있어요.</p>;

  if (mode === "form" || (mode === "auto" && checks.length === 0)) {
    return <CheckForm onCancel={checks.length > 0 ? () => go("result") : null} onDone={(check) => { emotionStateStore.set(normalizeEmotionStateChecks([check, ...checks])); go("result"); }} />;
  }

  const latest = points[points.length - 1];
  const averages = points.length > 1
    ? Object.fromEntries(stateEmotionMeta.map((meta) => [meta.id, points.reduce((sum, point) => sum + point.subscales.find((scale) => scale.id === meta.id)!.mean, 0) / points.length]))
    : null;
  const sorted = [...latest.subscales].sort((a, b) => a.mean - b.mean);
  const easiest = sorted[0];
  const hardest = sorted[sorted.length - 1];

  return <div className="result-stack">
    <div className="wb-actions">
      <button type="button" className="button button-primary" onClick={() => go("form")}><Icon name="pulse" size={17} /> 새로 기록하기</button>
      <p className="viz-caption">감정이 크게 움직인 순간이나 하루 중 같은 때에 기록하면 패턴이 보여요.</p>
    </div>
    <section className="viz-card" aria-labelledby="sd-now-title">
      <div className="viz-heading"><div><h2 id="sd-now-title">지금의 정서조절</h2><p className="viz-caption" style={{ marginTop: 2 }}>{dateTime(latest.takenAt)} 기록 · 총점 {latest.total} / 105</p></div><span className="subtle-label">평균 1–5</span></div>
      <SubscaleBars point={latest} averages={averages} />
      <div className="wb-item-notes">
        <p><Icon name="leaf" size={15} /> <span>지금 가장 잘 되고 있는 부분은 <strong>{metaOf(easiest.id).shortName}</strong> ({easiest.mean.toFixed(1)}).</span></p>
        {hardest.mean >= 2.5 && <p><Icon name="spark" size={15} /> <span>지금 조금 더 버거운 부분은 <strong>{metaOf(hardest.id).shortName}</strong> ({hardest.mean.toFixed(1)}). 이 순간의 상태라 시간이 지나면 달라질 수 있어요.</span></p>}
      </div>
      <p className="viz-caption">높을수록 지금 그 부분이 어렵다는 뜻이에요.{averages ? " 세로 표시는 지금까지의 평균이에요." : ""}</p>
    </section>

    <section className="viz-card" aria-labelledby="sd-trend-title">
      <div className="viz-heading"><h2 id="sd-trend-title">시간에 따른 변화</h2><span className="subtle-label">{checks.length}회 기록</span></div>
      {points.length > 1 ? <SubscaleTrend points={points} /> : <p className="viz-text">두 번 이상 기록하면 네 하위척도의 변화가 선으로 보여요.</p>}
    </section>

    <section className="viz-card" aria-labelledby="sd-history-title">
      <div className="viz-heading"><h2 id="sd-history-title">기록</h2></div>
      <ul className="wb-history">{[...points].reverse().map((point) => <li key={point.id}>
        <span className="wb-history-date">{dateTime(point.takenAt)}</span>
        <span className="wb-history-score">{point.total}</span>
        <span className="wb-history-band">{point.subscales.map((scale) => `${metaOf(scale.id).shortName} ${scale.mean.toFixed(1)}`).join(" · ")}</span>
        {confirmDelete === point.id
          ? <span className="wb-history-confirm"><button type="button" className="text-link danger" onClick={() => { emotionStateStore.set(checks.filter((check) => check.id !== point.id)); setConfirmDelete(""); }}>지우기</button><button type="button" className="text-link" onClick={() => setConfirmDelete("")}>취소</button></span>
          : <button type="button" className="icon-button" aria-label={`${dateTime(point.takenAt)} 기록 지우기`} onClick={() => setConfirmDelete(point.id)}><Icon name="trash" size={16} /></button>}
      </li>)}</ul>
    </section>

    <p className="viz-caption">상태 정서조절곤란 척도 S-DERS(Lavender 외, 2017) · 21문항, 1–5점, 하위척도 합(정서 자각은 역채점). 공식 절단점은 없어서 내 기록끼리 비교해요. 진단이 아니에요.</p>
  </div>;
}
