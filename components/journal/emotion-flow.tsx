"use client";

import { useState } from "react";
import { emotionOptions, needOptions } from "@/data/journal";
import type { JournalEntry } from "@/lib/journal";
import { dayPeriods, emotionNeedFlow, momentGrid, weekdayLabels } from "@/lib/journal-patterns";

const WIDTH = 500;
const LABEL = 96;
const BAR = 12;
const GAP = 8;
const emotionLabel = (id: string) => emotionOptions.find((item) => item.id === id)?.label ?? id;
const needLabel = (id: string) => needOptions.find((item) => item.id === id)?.label ?? id;

/** 감정 → 바람(욕구) 흐름. 띠의 굵기는 함께 적힌 횟수예요. 노드에 올리면 그 노드의 흐름만 또렷해져요. */
export function EmotionFlow({ entries }: { entries: readonly JournalEntry[] }) {
  const flow = emotionNeedFlow(entries);
  const [focus, setFocus] = useState("");
  if (flow.links.length === 0) {
    return <p className="viz-text">감정과 ‘그때 바랐던 것’을 함께 적은 기록이 쌓이면, 어떤 감정이 어떤 바람과 이어지는지 흐름으로 보여드려요.</p>;
  }
  const total = flow.links.reduce((sum, link) => sum + link.count, 0);
  const rows = Math.max(flow.emotions.length, flow.needs.length);
  const height = Math.max(180, rows * 34);
  const scale = (side: number) => (height - GAP * (side - 1)) / total;
  const leftScale = scale(flow.emotions.length);
  const rightScale = scale(flow.needs.length);
  const unit = Math.min(leftScale, rightScale);
  const place = <T extends string>(nodes: readonly { id: T; count: number }[]) => {
    const used = nodes.reduce((sum, node) => sum + node.count * unit, 0) + GAP * (nodes.length - 1);
    let y = (height - used) / 2;
    return new Map(nodes.map((node) => {
      const top = y;
      y += node.count * unit + GAP;
      return [node.id, { top, size: node.count * unit, cursor: top }] as [T, { top: number; size: number; cursor: number }];
    }));
  };
  const left = place(flow.emotions);
  const right = place(flow.needs);
  const x1 = LABEL + BAR;
  const x2 = WIDTH - LABEL - BAR;
  const mid = (x1 + x2) / 2;
  const ribbons = flow.links.map((link) => {
    const a = left.get(link.emotion)!;
    const b = right.get(link.need)!;
    const size = link.count * unit;
    const ya = a.cursor;
    const yb = b.cursor;
    a.cursor += size;
    b.cursor += size;
    const d = `M${x1},${ya.toFixed(1)} C${mid},${ya.toFixed(1)} ${mid},${yb.toFixed(1)} ${x2},${yb.toFixed(1)} L${x2},${(yb + size).toFixed(1)} C${mid},${(yb + size).toFixed(1)} ${mid},${(ya + size).toFixed(1)} ${x1},${(ya + size).toFixed(1)} Z`;
    return { ...link, d };
  });
  const active = (emotion: string, need: string) => !focus || focus === `e:${emotion}` || focus === `n:${need}`;
  const describe = flow.links.map((link) => `${emotionLabel(link.emotion)} → ${needLabel(link.need)} ${link.count}번`).join(", ");

  return <figure className="flow-figure">
    <svg className="emotion-flow" viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={`감정과 바람의 흐름. ${describe}`}>
      {ribbons.map((ribbon) => <path key={`${ribbon.emotion}-${ribbon.need}`} d={ribbon.d} className={`flow-ribbon ${active(ribbon.emotion, ribbon.need) ? "" : "dim"}`}><title>{`${emotionLabel(ribbon.emotion)} → ${needLabel(ribbon.need)} · ${ribbon.count}번`}</title></path>)}
      {flow.emotions.map((node) => {
        const box = left.get(node.id)!;
        return <g key={node.id} className="flow-node" onMouseEnter={() => setFocus(`e:${node.id}`)} onMouseLeave={() => setFocus("")}>
          <rect x={LABEL} y={box.top} width={BAR} height={Math.max(2, box.size)} rx={3} className="flow-bar emotion" />
          <text x={LABEL - 10} y={box.top + box.size / 2} textAnchor="end" dominantBaseline="middle" className="flow-label">{emotionLabel(node.id)} <tspan className="flow-count">{node.count}</tspan></text>
        </g>;
      })}
      {flow.needs.map((node) => {
        const box = right.get(node.id)!;
        return <g key={node.id} className="flow-node" onMouseEnter={() => setFocus(`n:${node.id}`)} onMouseLeave={() => setFocus("")}>
          <rect x={x2} y={box.top} width={BAR} height={Math.max(2, box.size)} rx={3} className="flow-bar need" />
          <text x={x2 + BAR + 10} y={box.top + box.size / 2} dominantBaseline="middle" className="flow-label">{needLabel(node.id)} <tspan className="flow-count">{node.count}</tspan></text>
        </g>;
      })}
    </svg>
    <figcaption className="viz-caption">왼쪽은 적은 감정, 오른쪽은 그때 바랐던 것이에요. 띠가 굵을수록 함께 적힌 적이 많아요.{flow.withoutNeed > 0 ? ` 바란 것을 고르지 않은 기록 ${flow.withoutNeed}개는 빠져 있어요.` : ""}</figcaption>
  </figure>;
}

/** 요일 × 시간대에 기록이 얼마나 모이는지. 칸의 진하기는 기록 수, 숫자는 평균 강도예요. */
export function MomentGrid({ entries }: { entries: readonly JournalEntry[] }) {
  const cells = momentGrid(entries);
  const max = Math.max(1, ...cells.map((cell) => cell.count));
  const busiest = cells.reduce((best, cell) => (cell.count > best.count ? cell : best), cells[0]);
  return <figure className="moment-figure">
    <div className="moment-grid" role="table" aria-label="요일과 시간대별 기록 수">
      <div role="row" className="moment-row head"><span role="columnheader" />{weekdayLabels.map((day) => <span key={day} role="columnheader">{day}</span>)}</div>
      {dayPeriods.map((period) => <div key={period.id} role="row" className="moment-row">
        <span role="rowheader">{period.label}</span>
        {weekdayLabels.map((day, weekday) => {
          const cell = cells.find((item) => item.weekday === weekday && item.period === period.id)!;
          const level = cell.count === 0 ? 0 : Math.max(1, Math.ceil((cell.count / max) * 4));
          return <span key={day} role="cell" className="moment-cell" data-level={level} title={`${day} ${period.label} · 기록 ${cell.count}개${cell.averageIntensity !== null ? ` · 평균 강도 ${cell.averageIntensity}` : ""}`}>
            {cell.count > 0 ? cell.averageIntensity : ""}<span className="sr-only">{cell.count > 0 ? `기록 ${cell.count}개` : "기록 없음"}</span>
          </span>;
        })}
      </div>)}
    </div>
    <figcaption className="viz-caption">{busiest.count > 0 ? `${weekdayLabels[busiest.weekday]}요일 ${dayPeriods.find((item) => item.id === busiest.period)!.label}에 기록이 가장 많아요(${busiest.count}개). ` : ""}칸 안의 숫자는 그 시간대 기록의 평균 강도예요.</figcaption>
  </figure>;
}
