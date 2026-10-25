"use client";

import { wellbeingBands, wellbeingItems, wellbeingOptions, type WellbeingValue } from "@/data/wellbeing";
import { MEANINGFUL_CHANGE, type WellbeingPoint } from "@/lib/wellbeing";

const bandLabel = (id: string) => wellbeingBands.find((band) => band.id === id)!.label;
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });

/** 0–100 위의 지금 위치. 띠는 해석 구간(≤28, 29–50, 51–100), 옅은 표시는 직전 체크예요. */
export function WellbeingGauge({ point, previous }: { point: WellbeingPoint; previous: WellbeingPoint | null }) {
  return <div className="wb-gauge">
    <div className="wb-gauge-track" aria-hidden="true">
      <span className="zone very-low" style={{ width: "28%" }} />
      <span className="zone low" style={{ width: "22%" }} />
      <span className="zone steady" style={{ width: "50%" }} />
      {previous && <i className="wb-gauge-prev" style={{ left: `${previous.score}%` }} />}
      <i className="wb-gauge-now" style={{ left: `${point.score}%` }} />
    </div>
    <div className="wb-gauge-scale" aria-hidden="true"><span>0</span><span style={{ left: "28%" }}>28</span><span style={{ left: "50%" }}>50</span><span style={{ left: "100%" }}>100</span></div>
    <p className="sr-only">0–100 중 {point.score}. {bandLabel(point.band)} 구간.{previous ? ` 직전 체크는 ${previous.score}.` : ""}</p>
  </div>;
}

/** 다섯 문장별 응답(0–5). 여러 번 체크했다면 평균 위치를 함께 표시해요. */
export function ItemProfile({ answers, averages }: { answers: readonly WellbeingValue[]; averages: readonly { id: string; mean: number }[] | null }) {
  const best = Math.max(...answers);
  return <ul className="wb-items">
    {wellbeingItems.map((item, index) => {
      const value = answers[index];
      const mean = averages?.find((entry) => entry.id === item.id)?.mean;
      const tone = value <= 1 ? "low" : value === best && best >= 3 ? "high" : "";
      return <li key={item.id} className={tone}>
        <span className="wb-item-name">{item.short}</span>
        <span className="wb-item-bar" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((step) => <i key={step} className={step <= value ? "on" : ""} />)}
          {mean !== undefined && <b className="wb-item-mean" style={{ left: `${(mean / 5) * 100}%` }} title={`평균 ${mean}`} />}
        </span>
        <span className="wb-item-value">{wellbeingOptions.find((option) => option.value === value)!.label}</span>
        <span className="sr-only">{`${item.text} ${value}/5${mean !== undefined ? `, 평균 ${mean}` : ""}`}</span>
      </li>;
    })}
  </ul>;
}

const W = 640;
const H = 230;
const PAD = { left: 34, right: 40, top: 18, bottom: 30 };

/** 시간에 따른 점수. 바탕 띠는 해석 구간, 10점 이상 움직인 체크에는 변화 폭을 적어요. */
export function WellbeingTrend({ points }: { points: readonly WellbeingPoint[] }) {
  const shown = points.slice(-24);
  const times = shown.map((point) => Date.parse(point.takenAt));
  const min = Math.min(...times);
  const span = Math.max(...times) - min;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (index: number) => PAD.left + (shown.length === 1 ? innerW / 2 : span === 0 ? (index / (shown.length - 1)) * innerW : ((times[index] - min) / span) * innerW);
  const y = (score: number) => PAD.top + (1 - score / 100) * innerH;
  const path = shown.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(point.score).toFixed(1)}`).join(" ");
  const labelEvery = Math.max(1, Math.ceil(shown.length / 6));
  const describe = shown.map((point) => `${shortDate(point.takenAt)} ${point.score}`).join(", ");

  return <figure className="wb-trend-figure">
    <svg className="wb-trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`최근 체크 점수 변화: ${describe}`}>
      <rect className="zone steady" x={PAD.left} y={y(100)} width={innerW} height={y(50) - y(100)} />
      <rect className="zone low" x={PAD.left} y={y(50)} width={innerW} height={y(28) - y(50)} />
      <rect className="zone very-low" x={PAD.left} y={y(28)} width={innerW} height={y(0) - y(28)} />
      {[0, 28, 50, 100].map((tick) => <g key={tick}><line className="wb-grid" x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} /><text className="wb-axis" x={PAD.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle">{tick}</text></g>)}
      {shown.length > 1 && <path className="wb-line" d={path} />}
      {shown.map((point, index) => <g key={point.id}>
        <circle className={`wb-dot ${point.band}`} cx={x(index)} cy={y(point.score)} r={index === shown.length - 1 ? 6 : 4.5}><title>{`${shortDate(point.takenAt)} · ${point.score}${point.change !== null ? ` (${point.change > 0 ? "+" : ""}${point.change})` : ""}`}</title></circle>
        {point.meaningful && (() => {
          // 바로 앞 점과 가까우면 변화 폭을 점 오른쪽에 적어 겹치지 않게 합니다.
          const crowded = index > 0 && x(index) - x(index - 1) < 40;
          return <text className={`wb-change ${point.change! > 0 ? "up" : "down"}`} x={x(index) + (crowded ? 10 : 0)} y={y(point.score) + (crowded ? 4 : point.change! > 0 ? -12 : 20)} textAnchor={crowded ? "start" : "middle"}>{point.change! > 0 ? "+" : ""}{point.change}</text>;
        })()}
        {(index % labelEvery === 0 || index === shown.length - 1) && <text className="wb-axis" x={x(index)} y={H - 8} textAnchor="middle">{shortDate(point.takenAt)}</text>}
      </g>)}
    </svg>
    <figcaption className="viz-caption">바탕의 세 띠는 해석 구간(28 이하 · 29–50 · 51 이상)이에요. 직전 체크보다 {MEANINGFUL_CHANGE}점 이상 움직인 곳에는 변화 폭을 적었어요.{points.length > shown.length ? ` 최근 ${shown.length}회만 보여줘요.` : ""}</figcaption>
  </figure>;
}
