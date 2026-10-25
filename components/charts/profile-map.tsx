"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import type { ModuleResults } from "@/lib/integration";
import { profileGroups, profileLinks, type ProfileGroup, type ProfileLink, type ProfileRow } from "@/lib/profile-map";

/** 바퀴 크기. viewBox 단위입니다. */
const SIZE = 480;
const C = SIZE / 2;
const R_IN = 58;
const R_OUT = 158;
const LABEL_R = R_OUT + 14;
/** 검사 사이의 빈칸(지표 하나 폭 대비 비율) */
const GROUP_GAP = 0.55;

const polar = (r: number, angle: number): [number, number] => [C + r * Math.sin(angle), C - r * Math.cos(angle)];
const f = (n: number) => n.toFixed(1);

/** 안쪽 반지름 r0에서 바깥 반지름 r1까지, 각도 a0→a1의 부채꼴 띠 */
function sector(r0: number, r1: number, a0: number, a1: number) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = polar(r0, a0);
  const [x1, y1] = polar(r1, a0);
  const [x2, y2] = polar(r1, a1);
  const [x3, y3] = polar(r0, a1);
  return `M${f(x0)},${f(y0)} L${f(x1)},${f(y1)} A${r1},${r1} 0 ${large} 1 ${f(x2)},${f(y2)} L${f(x3)},${f(y3)} A${r0},${r0} 0 ${large} 0 ${f(x0)},${f(y0)} Z`;
}

interface Slice {
  row: ProfileRow | null;
  group: ProfileGroup;
  a0: number;
  a1: number;
  mid: number;
}

/** 지표마다 같은 각도를 주고, 검사 사이에 작은 빈칸을 둡니다. 검사 전인 지표도 자리를 잡아 둡니다. */
function layout(groups: readonly ProfileGroup[]): Slice[] {
  const units = groups.reduce((sum, group) => sum + group.slots, 0) + GROUP_GAP * groups.length;
  const unit = (Math.PI * 2) / units;
  const slices: Slice[] = [];
  let angle = (GROUP_GAP / 2) * unit;
  for (const group of groups) {
    for (let index = 0; index < group.slots; index += 1) {
      const a0 = angle + unit * 0.06;
      const a1 = angle + unit * 0.94;
      slices.push({ row: group.rows[index] ?? null, group, a0, a1, mid: (a0 + a1) / 2 });
      angle += unit;
    }
    angle += GROUP_GAP * unit;
  }
  return slices;
}

function labelPosition(mid: number) {
  const [x, y] = polar(LABEL_R, mid);
  const sin = Math.sin(mid);
  const cos = Math.cos(mid);
  return { x, y, anchor: sin > 0.2 ? "start" : sin < -0.2 ? "end" : "middle", baseline: cos > 0.6 ? "auto" : cos < -0.6 ? "hanging" : "middle" } as const;
}

/**
 * 통합 프로필 바퀴. 지표 하나가 부채꼴 하나이고, 바깥으로 길수록 점수가 높아요(0–100).
 * 색은 검사, 가운데를 지나는 곡선은 서로 다른 검사에서 함께 두드러진 지표의 연결이에요.
 */
export function ProfileMap({ results, example = false, compact = false }: { results: ModuleResults; example?: boolean; compact?: boolean }) {
  const groups = useMemo(() => profileGroups(results), [results]);
  const links = useMemo(() => profileLinks(results, groups), [results, groups]);
  const slices = useMemo(() => layout(groups), [groups]);
  const [hover, setHover] = useState<{ row?: string; link?: number }>({});
  const [pinned, setPinned] = useState("");
  const activeRow = hover.row ?? (hover.link === undefined ? pinned || undefined : undefined);
  const midOf = new Map(slices.flatMap((slice) => (slice.row ? [[slice.row.id, slice.mid] as const] : [])));

  const linkOn = (link: ProfileLink, index: number) => (hover.link !== undefined ? hover.link === index : activeRow ? link.from === activeRow || link.to === activeRow : true);
  const focused = activeRow !== undefined || hover.link !== undefined;
  const related = new Set(links.flatMap((link, index) => (focused && linkOn(link, index) ? [link.from, link.to] : [])));
  const rowOn = (id: string) => !focused || id === activeRow || related.has(id);
  const suffix = example ? "?example=1" : "";
  const done = groups.flatMap((group) => group.rows);
  const selected = done.find((row) => row.id === activeRow);
  const selectedGroup = selected ? groups.find((group) => group.module === selected.module)! : null;
  const pendingGroups = groups.filter((group) => !group.done);

  const wheel = <svg className="pw-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={done.map((row) => `${row.label} ${row.mean.toFixed(1)}/${row.max}`).join(", ") || "아직 마친 검사가 없어요"} onMouseLeave={() => setHover({})}>
    {[0.5, 1].map((ratio) => <circle key={ratio} cx={C} cy={C} r={R_IN + (R_OUT - R_IN) * ratio} className={`pw-ring ${ratio === 0.5 ? "mid" : ""}`} />)}
    {slices.map((slice, index) => {
      const row = slice.row;
      const moduleClass = `module-${slice.group.module}`;
      if (!row) return <path key={`p-${index}`} d={sector(R_IN, R_OUT, slice.a0, slice.a1)} className={`pw-pending ${moduleClass}`} />;
      const length = R_IN + (R_OUT - R_IN) * Math.max(0.02, row.score / 100);
      const label = labelPosition(slice.mid);
      const reference = row.reference === undefined ? null : R_IN + (R_OUT - R_IN) * (row.reference / 100);
      return <g key={row.id} className={`pw-slice ${moduleClass} ${rowOn(row.id) ? "" : "dim"} ${row.id === activeRow ? "on" : ""}`}
        tabIndex={0} role="button" aria-label={`${row.label} 평균 ${row.mean.toFixed(1)} / ${row.max}`} aria-pressed={pinned === row.id}
        onMouseEnter={() => setHover({ row: row.id })} onFocus={() => setHover({ row: row.id })} onBlur={() => setHover({})}
        onClick={() => setPinned((current) => (current === row.id ? "" : row.id))}>
        <path d={sector(R_IN, R_OUT, slice.a0, slice.a1)} className="pw-track" />
        <path d={sector(R_IN, length, slice.a0, slice.a1)} className="pw-bar" />
        {reference !== null && <path d={sector(reference - 1, reference + 1, slice.a0, slice.a1)} className="pw-ref" />}
        <text x={f(label.x)} y={f(label.y)} textAnchor={label.anchor} dominantBaseline={label.baseline} className="pw-label">{row.short}</text>
      </g>;
    })}
    {pendingGroups.map((group) => {
      const span = slices.filter((item) => item.group === group);
      const label = labelPosition((span[0].a0 + span[span.length - 1].a1) / 2);
      return <text key={`pl-${group.module}`} x={f(label.x)} y={f(label.y)} textAnchor={label.anchor} dominantBaseline={label.baseline} className="pw-label pending">{group.title} · 검사 전</text>;
    })}
    {links.map((link, index) => {
      const [x1, y1] = polar(R_IN - 3, midOf.get(link.from)!);
      const [x2, y2] = polar(R_IN - 3, midOf.get(link.to)!);
      return <g key={`${link.ruleId}-${index}`} className={`pw-link ${link.kind} ${linkOn(link, index) ? "" : "dim"}`}>
        <path d={`M${f(x1)},${f(y1)} Q${C},${C} ${f(x2)},${f(y2)}`} />
        <circle cx={f(x1)} cy={f(y1)} r={3.5} />
        <circle cx={f(x2)} cy={f(y2)} r={3.5} />
      </g>;
    })}
  </svg>;

  const legend = <ul className="pw-legend">{groups.map((group) => <li key={group.module} className={`module-${group.module} ${group.done ? "" : "pending"}`}>
    <i aria-hidden="true" />
    {group.done && !compact ? <Link href={`/results/${group.module}${suffix}`}>{group.title}</Link> : <span>{group.title}</span>}
    <small>{group.done ? group.direction : "검사 전"}</small>
  </li>)}</ul>;

  if (compact) return <figure className="profile-wheel compact">{wheel}{legend}</figure>;

  return <figure className="profile-wheel">
    <div className="pw-main">
      <div className="pw-chart">{wheel}</div>
      <aside className="pw-panel" aria-live="polite">
        {selected && selectedGroup ? <>
          <span className={`pw-panel-module module-${selected.module}`}><i aria-hidden="true" />{selectedGroup.title}</span>
          <h3>{selected.label}</h3>
          <p className="pw-panel-score"><strong>{selected.mean.toFixed(1)}</strong> / {selected.max} <small>· 0–100 점수 {selected.score}</small></p>
          <span className={`pw-panel-bar module-${selected.module}`} aria-hidden="true"><span style={{ width: `${selected.score}%` }} /></span>
          <p className="pw-panel-direction">{selectedGroup.direction}</p>
          {links.filter((link) => link.from === selected.id || link.to === selected.id).map((link, index) => <p key={index} className={`pw-panel-link ${link.kind}`}><b>{link.kind === "resource" ? "자원" : "살펴볼 흐름"}</b> {link.title}</p>)}
          <Link className="text-link" href={`/results/${selected.module}${suffix}`}>{selectedGroup.title} 자세히 <Icon name="chevron" size={13} /></Link>
        </> : <>
          <h3>읽는 법</h3>
          <p>부채꼴 하나가 지표 하나예요. 바깥으로 길수록 점수가 높고, 점선 원은 척도의 중간이에요. 지표를 누르거나 마우스를 올리면 자세히 보여요.</p>
          {legend}
          <p className="pw-key"><i className="resource" />함께 보이는 자원 <i className="pattern" />함께 살펴볼 흐름</p>
        </>}
      </aside>
    </div>
    <div className="pm-connections">
      <h3>지표 사이의 연결</h3>
      {links.length > 0 ? <ul>{links.map((link, index) => <li key={`${link.ruleId}-${index}`} className={`${link.kind} ${hover.link === index ? "on" : ""}`}
        onMouseEnter={() => setHover({ link: index })} onMouseLeave={() => setHover({})} onFocus={() => setHover({ link: index })} onBlur={() => setHover({})} tabIndex={0}>
        <span className="pm-chip">{link.kind === "resource" ? "자원" : "살펴볼 흐름"}</span>
        <strong>{link.title}</strong>
        <p>{link.text}</p>
        <small>{link.evidence.map((item) => `${item.label} ${item.score}`).join(" · ")}</small>
      </li>)}</ul> : <p className="viz-text">{groups.filter((group) => group.done).length < 2 ? "검사를 두 개 이상 마치면 지표 사이의 연결이 보여요." : "지금은 서로 다른 검사에서 함께 두드러진 지표 조합이 없어요."}</p>}
    </div>
  </figure>;
}
