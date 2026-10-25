"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/icon";
import { defenseTiers } from "@/data/defense-mechanisms";
import { assessmentModules, moduleIds, type ModuleId } from "@/data/modules";
import { terrainRegions, terrainSites } from "@/data/terrain-layout";
import { traitMeta } from "@/data/traits";
import type { ModuleResults } from "@/lib/integration";
import { bandLabels, scoreBand } from "@/lib/interpretation";
import { buildTerrain, TERRAIN_LEVELS, type TerrainPeak, type TerrainRoute } from "@/lib/terrain";

const WIDTH = 1000;
const HEIGHT = 620;
const noop = () => () => {};

/** 서버와 브라우저의 부동소수 차이로 hydration이 어긋나지 않도록 지형은 브라우저에서만 계산합니다. */
function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** 5점 이하는 다시 응답해도 생길 수 있는 흔들림으로 보고 ‘비슷’으로 표시합니다(기록 비교 화면과 같은 기준). */
function deltaLabel(delta: number) {
  if (Math.abs(delta) <= 5) return "비슷";
  return delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`;
}

function peakDescription(peak: TerrainPeak): string {
  if (peak.module === "defense") return defenseTiers.find((tier) => tier.id === peak.scale)?.description ?? "";
  if (peak.module === "traits") {
    const meta = traitMeta.find((trait) => trait.id === peak.scale);
    if (meta) return `${meta.description}. 낮은 쪽은 ‘${meta.lowPole}’, 높은 쪽은 ‘${meta.highPole}’에 가까워요. 어느 쪽도 더 나은 방향은 아니에요.`;
  }
  return assessmentModules[peak.module].scales.find((scale) => scale.id === peak.scale)?.description ?? "";
}

function routePath(from: TerrainPeak, to: TerrainPeak) {
  const x1 = from.x * WIDTH;
  const y1 = from.y * HEIGHT;
  const x2 = to.x * WIDTH;
  const y2 = to.y * HEIGHT;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const length = Math.hypot(x2 - x1, y2 - y1) || 1;
  // 직선 대신 살짝 휜 길. 휘는 방향은 좌표로만 정해집니다.
  const bend = 0.18 * length;
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${(mx - ((y2 - y1) / length) * bend).toFixed(1)},${(my + ((x2 - x1) / length) * bend).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

function regionCenter(module: ModuleId) {
  const sites = terrainSites.filter((site) => site.module === module);
  const xs = sites.map((site) => site.x * WIDTH);
  const ys = sites.map((site) => site.y * HEIGHT);
  return { cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2, rx: (Math.max(...xs) - Math.min(...xs)) / 2 + 60, ry: (Math.max(...ys) - Math.min(...ys)) / 2 + 46 };
}

function PeakPanel({ peak, previous, routes, peaks, example, interactive, onSelect }: {
  peak: TerrainPeak | null;
  previous?: number;
  routes: readonly TerrainRoute[];
  peaks: readonly TerrainPeak[];
  example: boolean;
  interactive: boolean;
  onSelect: (id: string) => void;
}) {
  if (!peak) {
    const top = [...peaks].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, 3);
    return <aside className="terrain-panel" aria-live="polite">
      <h3>지도를 읽는 법</h3>
      <p>봉우리가 높을수록 그 경향이 응답에 자주 드러났다는 뜻이에요. 높고 낮음은 좋고 나쁨이 아니라, 지금 내 마음에서 눈에 띄는 지형일 뿐이에요.</p>
      {top.length > 0 && <>
        <button type="button" className="button button-secondary" onClick={() => onSelect(top[0].id)}><Icon name="compass" size={17} /> 높은 봉우리부터 둘러보기</button>
        <p className="panel-hint">가장 높이 솟은 곳</p>
        <ul className="panel-routes">{top.map((item) => <li key={item.id} className={`module-${item.module}`}><button type="button" className="text-link" onClick={() => onSelect(item.id)}>{item.label} · {item.score}</button><b>{assessmentModules[item.module].title}</b></li>)}</ul>
      </>}
      {routes.length > 0 && <p className="panel-hint">점선 길은 서로 다른 모듈의 점수가 함께 두드러질 때 이어지는 해석 가설이에요.</p>}
    </aside>;
  }
  const related = routes.filter((route) => route.from === peak.id || route.to === peak.id);
  const order = [...peaks].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const position = order.findIndex((item) => item.id === peak.id);
  const href = `/results/${peak.module}${example ? "?example=1" : ""}`;
  return <aside className={`terrain-panel module-${peak.module}`} aria-live="polite">
    <span className="panel-module"><i />{assessmentModules[peak.module].title}</span>
    <h3>{peak.label}</h3>
    <div className="panel-score"><strong>{peak.score}</strong><span>/ 100 · {bandLabels[scoreBand(peak.score)]}</span></div>
    <div className="panel-bar" aria-hidden="true"><span style={{ width: `${peak.score}%` }} /></div>
    {previous !== undefined && <p className="panel-hint">이전 기록 {previous} → 지금 {peak.score} ({deltaLabel(peak.score - previous)})</p>}
    <p>{peakDescription(peak)}</p>
    {related.length > 0 && <ul className="panel-routes">{related.map((route) => <li key={route.ruleId + route.from + route.to}><b>{route.kind === "resource" ? "함께 보이는 자원" : "함께 살펴볼 흐름"}</b>{route.title}</li>)}</ul>}
    <div className="tour-nav">
      <button type="button" className="text-link" disabled={position <= 0} onClick={() => onSelect(order[position - 1].id)}><Icon name="chevron" size={13} style={{ transform: "rotate(180deg)" }} /> 더 높은 곳</button>
      <span>{position + 1} / {order.length}</span>
      <button type="button" className="text-link" disabled={position >= order.length - 1} onClick={() => onSelect(order[position + 1].id)}>다음 봉우리 <Icon name="chevron" size={13} /></button>
    </div>
    <div className="hero-actions" style={{ marginTop: 0 }}>
      {interactive && <Link className="text-link" href={href}>{assessmentModules[peak.module].title} 자세히 <Icon name="chevron" size={13} /></Link>}
      <button type="button" className="text-link" onClick={() => onSelect("")}>선택 해제</button>
    </div>
  </aside>;
}

/**
 * 마음 지형도. 척도 점수가 봉우리 높이가 되고, 모듈마다 한 지역을 차지합니다.
 * compact는 홈 대시보드용(설명 패널 없음, 봉우리를 누르면 결과로 이동).
 */
/** 방향키로 가장 가까운 봉우리를 고릅니다. 진행 방향의 거리에 옆 방향 거리를 두 배로 더해 가장 자연스러운 이웃을 찾습니다. */
function neighbor(peaks: readonly TerrainPeak[], from: TerrainPeak, key: string): TerrainPeak | undefined {
  const axis = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[key];
  if (!axis) return undefined;
  let best: TerrainPeak | undefined;
  let bestCost = Infinity;
  for (const peak of peaks) {
    const dx = (peak.x - from.x) * (WIDTH / HEIGHT);
    const dy = peak.y - from.y;
    const forward = dx * axis[0] + dy * axis[1];
    if (forward <= 0.01) continue;
    const cost = forward + 2 * Math.abs(dx * axis[1] - dy * axis[0]);
    if (cost < bestCost) { bestCost = cost; best = peak; }
  }
  return best;
}

/** 한 모듈 지역만 확대해 보여줄 때의 viewBox */
function regionViewBox(module: ModuleId) {
  const sites = terrainSites.filter((site) => site.module === module);
  const minX = Math.max(0, Math.min(...sites.map((site) => site.x)) * WIDTH - 110);
  const maxX = Math.min(WIDTH, Math.max(...sites.map((site) => site.x)) * WIDTH + 110);
  const minY = Math.max(0, Math.min(...sites.map((site) => site.y)) * HEIGHT - 80);
  const maxY = Math.min(HEIGHT, Math.max(...sites.map((site) => site.y)) * HEIGHT + 70);
  return `${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX - minX).toFixed(0)} ${(maxY - minY).toFixed(0)}`;
}

export function TerrainMap({ results, example = false, interactive = true, compact = false, ghost, pendingText, focusModule, highlight }: { results: ModuleResults; example?: boolean; interactive?: boolean; compact?: boolean; ghost?: ModuleResults; pendingText?: string; focusModule?: ModuleId; highlight?: readonly string[] }) {
  const mounted = useMounted();
  const uid = useId();
  const router = useRouter();
  const model = useMemo(() => (mounted ? buildTerrain(results, WIDTH, HEIGHT) : null), [mounted, results]);
  const ghostModel = useMemo(() => (mounted && ghost ? buildTerrain(ghost, WIDTH, HEIGHT) : null), [mounted, ghost]);
  const ghostScore = new Map(ghostModel?.peaks.map((peak) => [peak.id, peak.score]));
  const [selectedId, setSelectedId] = useState("");
  const [hoverId, setHoverId] = useState("");
  const peaks = model?.peaks ?? [];
  const byId = new Map(peaks.map((peak) => [peak.id, peak]));
  const selected = byId.get(selectedId) ?? null;
  const focusId = hoverId || selectedId;
  const connected = new Set(model?.routes.filter((route) => route.from === focusId || route.to === focusId).flatMap((route) => [route.from, route.to]));
  const completed = new Set(peaks.map((peak) => peak.module));
  const majorStart = TERRAIN_LEVELS.length - 4;
  const summary = peaks.length ? peaks.map((peak) => `${assessmentModules[peak.module].title} ${peak.label} ${peak.score}`).join(", ") : "아직 완료한 모듈이 없어 봉우리가 없습니다";

  const svg = <svg className={`terrain ${focusModule ? "focused" : ""}`} viewBox={focusModule ? regionViewBox(focusModule) : `0 0 ${WIDTH} ${HEIGHT}`} role={focusModule ? "img" : "group"} aria-label={`마음 지형도. ${summary}`}>
    <defs>
      {moduleIds.map((id) => <radialGradient key={id} id={`glow-${id}`} className={`module-${id}`}><stop offset="0%" stopColor="var(--module-color)" stopOpacity=".34" /><stop offset="100%" stopColor="var(--module-color)" stopOpacity="0" /></radialGradient>)}
    </defs>
    {peaks.map((peak) => <circle key={`g-${peak.id}`} className="terrain-glow" cx={peak.x * WIDTH} cy={peak.y * HEIGHT} r={30 + peak.score * 0.9} fill={`url(#glow-${peak.module})`} />)}
    {ghostModel?.contours.filter((_, index) => index % 2 === 1).map((contour) => <path key={`ghost-${contour.level}`} d={contour.d} className="terrain-ghost" />)}
    {model?.contours.map((contour) => {
      const index = TERRAIN_LEVELS.indexOf(contour.level as (typeof TERRAIN_LEVELS)[number]);
      return <path key={contour.level} d={contour.d} className={`terrain-contour ${index % 2 === 1 ? "major" : ""} ${index >= majorStart ? "top" : ""}`} style={{ opacity: 0.45 + (index / TERRAIN_LEVELS.length) * 0.55, animationDelay: `${index * 55}ms` }} />;
    })}
    {!focusModule && terrainRegions.map((region) => {
      const done = completed.has(region.module);
      return <text key={region.module} className={`terrain-region ${done ? "" : "pending"}`} x={region.x * WIDTH} y={region.y * HEIGHT} textAnchor="middle" dominantBaseline="middle">{assessmentModules[region.module].title}</text>;
    })}
    {mounted && !focusModule && moduleIds.filter((id) => !completed.has(id)).map((id) => {
      const area = regionCenter(id);
      const label = <text className="terrain-pending-text" x={area.cx} y={area.cy} textAnchor="middle" dominantBaseline="middle">{pendingText ?? (interactive && !example ? `응답 전 · 약 ${assessmentModules[id].estimatedMinutes}분이면 솟아올라요` : "공유되지 않은 지역")}</text>;
      return <g key={`p-${id}`}>
        <ellipse className="terrain-pending-area" cx={area.cx} cy={area.cy} rx={area.rx} ry={area.ry} />
        {interactive && !example && !pendingText ? <a href={`/questions/${id}`} aria-label={`${assessmentModules[id].title} 시작하기`}>{label}</a> : label}
      </g>;
    })}
    {model?.routes.map((route) => {
      const from = byId.get(route.from);
      const to = byId.get(route.to);
      if (!from || !to) return null;
      const dim = focusId && route.from !== focusId && route.to !== focusId;
      return <path key={route.ruleId + route.from + route.to} d={routePath(from, to)} className={`terrain-route ${route.kind} ${dim ? "dim" : ""}`} />;
    })}
    {peaks.map((peak) => {
      const x = peak.x * WIDTH;
      const y = peak.y * HEIGHT;
      const faded = focusId ? focusId !== peak.id && !connected.has(peak.id) : Boolean(highlight?.length && !highlight.includes(peak.id));
      const isSelected = selectedId === peak.id;
      const choose = () => setSelectedId(isSelected ? "" : peak.id);
      if (focusModule) return <g key={peak.id} className={`terrain-peak static module-${peak.module}`} aria-hidden="true">
        <path className="marker" d={`M${x},${y - 10} L${x + 9},${y + 6} L${x - 9},${y + 6} Z`} strokeLinejoin="round" />
        <text className="peak-label" x={x} y={y - 17} textAnchor="middle">{peak.label}</text>
        <text className="peak-score" x={x} y={y + 25} textAnchor="middle">{peak.score}</text>
      </g>;
      return <g key={peak.id} id={`${uid}-${peak.id}`} className={`terrain-peak module-${peak.module} ${isSelected ? "selected" : ""} ${faded ? "faded" : ""}`} tabIndex={0} role="button" aria-pressed={compact ? undefined : isSelected}
        aria-label={`${assessmentModules[peak.module].title} ${peak.label} ${peak.score}점, ${bandLabels[scoreBand(peak.score)]}`}
        onMouseEnter={() => setHoverId(peak.id)} onMouseLeave={() => setHoverId("")} onFocus={() => setHoverId(peak.id)} onBlur={() => setHoverId("")}
        onClick={() => (compact ? router.push(`/results/${peak.module}${example ? "?example=1" : ""}`) : choose())}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (compact) router.push(`/results/${peak.module}${example ? "?example=1" : ""}`); else choose(); return; }
          const next = neighbor(peaks, peak, event.key);
          if (next) { event.preventDefault(); (document.getElementById(`${uid}-${next.id}`) as unknown as SVGGElement | null)?.focus(); }
        }}>
        <circle className="hit" cx={x} cy={y} r={30} />
        <path className="marker" d={`M${x},${y - 10} L${x + 9},${y + 6} L${x - 9},${y + 6} Z`} strokeLinejoin="round" />
        <text className="peak-label" x={x} y={y - 17} textAnchor="middle">{peak.label}</text>
        <text className="peak-score" x={x} y={y + 25} textAnchor="middle">{peak.score}{ghostScore.has(peak.id) ? ` (${deltaLabel(peak.score - ghostScore.get(peak.id)!)})` : ""}</text>
      </g>;
    })}
  </svg>;

  const legend = <div className="terrain-legend">
    {moduleIds.map((id) => <span key={id} className={`module-${id}`}><i />{assessmentModules[id].title}{!completed.has(id) && mounted ? " (응답 전)" : ""}</span>)}
    {ghostModel && <span><i className="route-key ghost" />이전 기록의 등고선</span>}
    {(model?.routes.length ?? 0) > 0 && <><span><i className="route-key" />함께 보이는 자원</span><span><i className="route-key pattern" />함께 살펴볼 흐름</span></>}
  </div>;

  if (focusModule) return <div className="terrain-scroll compact focus">{svg}</div>;

  if (compact) return <>
    <div className="terrain-scroll compact">{svg}</div>
    {legend}
  </>;

  return <>
    <div className="terrain-layout">
      <div className="terrain-scroll">{svg}</div>
      <p className="terrain-swipe no-print"><Icon name="arrow" size={14} /> 지도를 좌우로 밀어 전체를 볼 수 있어요</p>
      <PeakPanel peak={selected} previous={selected ? ghostScore.get(selected.id) : undefined} routes={model?.routes ?? []} peaks={peaks} example={example} interactive={interactive} onSelect={setSelectedId} />
    </div>
    {legend}
    <table className="sr-only"><caption>마음 지형도 봉우리 점수</caption><thead><tr><th>모듈</th><th>척도</th><th>점수</th></tr></thead><tbody>{peaks.map((peak) => <tr key={peak.id}><td>{assessmentModules[peak.module].title}</td><td>{peak.label}</td><td>{peak.score}</td></tr>)}</tbody></table>
  </>;
}
