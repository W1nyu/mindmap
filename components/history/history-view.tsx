"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AttachmentPlane } from "@/components/charts/attachment-plane";
import { ReactionRadar } from "@/components/charts/reaction-radar";
import { TerrainMap } from "@/components/charts/terrain-map";
import { Icon } from "@/components/icon";
import { assessmentModules, moduleIds, type ModuleId } from "@/data/modules";
import type { ModuleResults } from "@/lib/integration";
import { compareSnapshots, snapshotResult, snapshotSeries, type ResultSnapshot } from "@/lib/snapshots";
import { snapshotStore } from "./snapshot-store";

/** 5점 이하의 차이는 같은 사람이 다시 응답해도 생길 수 있는 흔들림으로 보고 ‘비슷함’으로 표시합니다. */
const STABLE_POINTS = 5;
const dateLabel = (iso: string) => new Date(iso).toLocaleString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
const signed = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : "±0");

function ChangeList({ module, before, after }: { module: ModuleId; before: ResultSnapshot; after: ResultSnapshot }) {
  const changes = compareSnapshots(before, after);
  const scales = assessmentModules[module].scales;
  const max = Math.max(10, ...changes.map((item) => Math.abs(item.delta)));
  const moved = changes.filter((item) => Math.abs(item.delta) > STABLE_POINTS).length;
  return <>
    <p className="viz-text">{changes.length}개 척도 중 {moved}개가 {STABLE_POINTS}점보다 크게 달라졌어요. {STABLE_POINTS}점 이하의 차이는 응답 당시의 기분이나 상황으로도 생길 수 있어 ‘비슷함’으로 표시했어요.</p>
    <ul className="deviation-list change-list">{changes.map((item) => {
      const name = scales.find((scale) => scale.id === item.scale)!.name;
      const stable = Math.abs(item.delta) <= STABLE_POINTS;
      return <li key={item.scale} className={stable ? "stable" : ""} data-tip={`${name}: ${item.before} → ${item.after}`}>
        <span className="deviation-name">{name}</span>
        <span className="deviation-track" aria-hidden="true"><i className="deviation-axis" /><span className={item.delta >= 0 ? "pos" : "neg"} style={{ width: `${(Math.abs(item.delta) / max) * 50}%`, [item.delta >= 0 ? "left" : "right"]: "50%" }} /></span>
        <span className="deviation-value">{item.before}→{item.after} <small>{stable ? "비슷함" : signed(item.delta)}</small></span>
      </li>;
    })}</ul>
  </>;
}

/** 0–100 점수를 작은 꺾은선으로 그립니다. 마지막 기록은 점으로 표시합니다. */
function Sparkline({ scores }: { scores: readonly number[] }) {
  const width = 160;
  const height = 36;
  const step = scores.length > 1 ? (width - 8) / (scores.length - 1) : 0;
  const points = scores.map((score, index) => [4 + index * step, height - 4 - (score / 100) * (height - 8)] as const);
  const [lastX, lastY] = points[points.length - 1];
  return <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
    <line x1={0} x2={width} y1={height / 2} y2={height / 2} className="spark-mid" />
    <polyline points={points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")} className="spark-line" />
    <circle cx={lastX} cy={lastY} r={3.5} className="spark-dot" />
  </svg>;
}

function SeriesList({ module, list }: { module: ModuleId; list: readonly ResultSnapshot[] }) {
  const series = useMemo(() => snapshotSeries(list), [list]);
  const scales = assessmentModules[module].scales;
  return <section className="viz-card" aria-labelledby="series-title" style={{ marginTop: 22 }}>
    <div className="viz-heading"><div><h2 id="series-title">척도별 흐름</h2><p className="viz-caption" style={{ marginTop: 2 }}>저장한 {list.length}개 기록을 오래된 순서로 이었어요. 가운데 선은 50점이에요.</p></div></div>
    <ul className="series-list">{series.map((item) => {
      const name = scales.find((scale) => scale.id === item.scale)!.name;
      return <li key={item.scale}>
        <span className="series-name">{name}</span>
        <Sparkline scores={item.scores} />
        <span className="series-range"><span>{item.scores[0]} → <strong>{item.scores[item.scores.length - 1]}</strong></span><small>범위 {item.min}–{item.max}</small></span>
        <span className="sr-only">{name} 점수 흐름: {item.scores.join(", ")}</span>
      </li>;
    })}</ul>
  </section>;
}

/** 모듈마다 가장 오래된 기록(점선 등고선)과 가장 최근 기록(실선)을 한 지형에 겹쳐 봅니다. */
function TerrainChange({ snapshots }: { snapshots: readonly ResultSnapshot[] }) {
  const { latest, earliest, compared } = useMemo(() => {
    const latest: ModuleResults = {};
    const earliest: ModuleResults = {};
    let compared = 0;
    for (const id of moduleIds) {
      const list = snapshots.filter((item) => item.module === id);
      if (list.length === 0) continue;
      Object.assign(latest, { [id]: snapshotResult(list[list.length - 1]) });
      if (list.length > 1) {
        Object.assign(earliest, { [id]: snapshotResult(list[0]) });
        compared += 1;
      }
    }
    return { latest, earliest, compared };
  }, [snapshots]);
  return <section className="viz-card terrain-card" aria-labelledby="terrain-change-title" style={{ marginBottom: 24 }}>
    <div className="viz-heading"><div><h2 id="terrain-change-title">지형의 변화</h2><p className="viz-caption" style={{ marginTop: 2 }}>{compared > 0 ? `실선은 모듈별 가장 최근 기록, 파란 점선은 가장 처음 기록이에요. 봉우리 아래 괄호는 처음 기록과의 차이예요(${STABLE_POINTS}점 이하는 ‘비슷’).` : "한 모듈을 두 번 이상 저장하면 처음 기록이 점선으로 겹쳐 보여요."}</p></div></div>
    <TerrainMap results={latest} ghost={compared > 0 ? earliest : undefined} pendingText="저장한 기록 없음" />
  </section>;
}

export function HistoryView({ initialModule }: { initialModule: ModuleId | null }) {
  const store = snapshotStore.useValue();
  const available = moduleIds.filter((id) => store.value.some((item) => item.module === id));
  const [chosen, setChosen] = useState<ModuleId | null>(initialModule);
  const [pair, setPair] = useState<{ before?: string; after?: string }>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  if (!store.ready) return <p role="status">저장한 기록을 불러오고 있어요.</p>;
  if (available.length === 0) {
    return <div className="empty-panel"><h2>아직 저장한 결과 기록이 없어요</h2><p className="viz-text">모듈 결과 화면에서 ‘결과를 기록에 저장’을 누르면 여기에 쌓여요. 몇 주 뒤 다시 응답해 저장하면 변화를 비교할 수 있어요.</p><Link className="button button-primary" href="/results">나의 마음 지도로 <Icon name="arrow" size={16} /></Link></div>;
  }
  const active = chosen && available.includes(chosen) ? chosen : available[0];
  const list = store.value.filter((item) => item.module === active);
  const before = list.find((item) => item.id === pair.before) ?? list[0];
  const after = list.find((item) => item.id === pair.after) ?? list[list.length - 1];
  const beforeResult = snapshotResult(before);
  const afterResult = snapshotResult(after);

  return <>
    <TerrainChange snapshots={store.value} />
    <div className="tab-row" role="tablist" aria-label="모듈 선택">{available.map((id) => <button key={id} type="button" role="tab" aria-selected={id === active} className="tab-button" onClick={() => { setChosen(id); setPair({}); }}>{assessmentModules[id].title} <small>{store.value.filter((item) => item.module === id).length}</small></button>)}</div>
    <div className="result-two-col">
      <section className="viz-card" aria-labelledby="snapshot-list-title">
        <div className="viz-heading"><div><h2 id="snapshot-list-title">저장한 기록</h2></div><span className="subtle-label">오래된 순 · 최대 30개</span></div>
        <ol className="snapshot-list">{list.map((item, index) => <li key={item.id} className={item.id === before.id || item.id === after.id ? "selected" : ""}>
          <div><strong>{index + 1}번째 기록</strong><time dateTime={item.savedAt}>{dateLabel(item.savedAt)}</time></div>
          <div className="snapshot-actions">
            <button type="button" className="text-link" aria-pressed={item.id === before.id} onClick={() => setPair({ ...pair, before: item.id })}>이전으로</button>
            <button type="button" className="text-link" aria-pressed={item.id === after.id} onClick={() => setPair({ ...pair, after: item.id })}>이후로</button>
            {confirmDelete === item.id ? <><button type="button" className="text-link danger" onClick={() => { snapshotStore.set(store.value.filter((snapshot) => snapshot.id !== item.id)); setConfirmDelete(null); setPair({}); }}>삭제 확인</button><button type="button" className="text-link" onClick={() => setConfirmDelete(null)}>취소</button></>
              : <button type="button" className="text-link" aria-label={`${index + 1}번째 기록 삭제`} onClick={() => setConfirmDelete(item.id)}><Icon name="trash" size={13} /></button>}
          </div>
        </li>)}</ol>
      </section>
      <section className="viz-card" aria-labelledby="compare-title">
        <div className="viz-heading"><div><h2 id="compare-title">무엇이 달라졌을까</h2></div><span className="subtle-label">{list.indexOf(before) + 1}번째 → {list.indexOf(after) + 1}번째</span></div>
        {before.id === after.id ? <p className="viz-text">기록이 하나뿐이거나 같은 기록을 골랐어요. 다시 응답한 뒤 결과를 저장하면 변화를 비교할 수 있어요.</p> : <>
          {beforeResult.module === "reaction" && afterResult.module === "reaction" && <ReactionRadar result={afterResult.result} compare={{ label: `${list.indexOf(before) + 1}번째 기록`, result: beforeResult.result }} />}
          {beforeResult.module === "attachment" && afterResult.module === "attachment" && <><AttachmentPlane anxiety={afterResult.profile.anxiety.score} avoidance={afterResult.profile.avoidance.score} compare={{ anxiety: beforeResult.profile.anxiety.score, avoidance: beforeResult.profile.avoidance.score, label: `${list.indexOf(before) + 1}번째 기록` }} /><p className="viz-caption">채운 점: 이후 기록 · 빈 점과 점선: 이전 기록</p></>}
          <ChangeList module={active} before={before} after={after} />
        </>}
      </section>
    </div>
    {list.length >= 2 && <SeriesList module={active} list={list} />}
    <p className="viz-caption">변화는 같은 질문지 버전의 응답끼리만 비교해요. 점수 변화는 성장이나 퇴보의 판정이 아니라, 그 시기의 나를 돌아보는 단서예요.</p>
  </>;
}
