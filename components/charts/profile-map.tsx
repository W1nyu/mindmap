"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import type { ModuleResults } from "@/lib/integration";
import { profileGroups, profileLinks, type ProfileLink } from "@/lib/profile-map";

const HEADER = 46;
const ROW = 36;
const GAP = 14;
const GUTTER = 80;

/** 행마다 세로 중심 좌표를 미리 정해 두면 HTML 목록과 오른쪽 연결선이 정확히 맞습니다. */
function layout(groups: ReturnType<typeof profileGroups>) {
  const centers = new Map<string, number>();
  let y = 0;
  for (const group of groups) {
    y += HEADER;
    const count = Math.max(1, group.rows.length);
    group.rows.forEach((row, index) => centers.set(row.id, y + index * ROW + ROW / 2));
    y += count * ROW + GAP;
  }
  return { centers, height: y - GAP };
}

function arcPath(y1: number, y2: number, lane: number) {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  const reach = Math.min(GUTTER - 8, 16 + (bottom - top) * 0.12 + lane * 8);
  return `M2,${top} C${reach},${top} ${reach},${bottom} 2,${bottom}`;
}

/**
 * 통합 프로필. 네 검사의 지표를 같은 0–100 막대 위에 놓고, 오른쪽 선으로 함께 두드러진 지표를 잇습니다.
 * 초록 선은 함께 보이는 자원, 주황 선은 함께 살펴볼 흐름이에요. 지표나 연결에 올리면 관련된 것만 또렷해져요.
 */
export function ProfileMap({ results, example = false, compact = false }: { results: ModuleResults; example?: boolean; compact?: boolean }) {
  const groups = useMemo(() => profileGroups(results), [results]);
  const links = useMemo(() => profileLinks(results, groups), [results, groups]);
  const { centers, height } = useMemo(() => layout(groups), [groups]);
  const [active, setActive] = useState<{ row?: string; link?: number }>({});

  const linkOn = (link: ProfileLink, index: number) => (active.link !== undefined ? active.link === index : active.row ? link.from === active.row || link.to === active.row : true);
  const relatedRows = new Set(links.flatMap((link, index) => (linkOn(link, index) && (active.row || active.link !== undefined) ? [link.from, link.to] : [])));
  const rowOn = (id: string) => (!active.row && active.link === undefined) || active.row === id || relatedRows.has(id);
  const suffix = example ? "?example=1" : "";

  return <figure className={`profile-map ${compact ? "compact" : ""}`}>
    <div className="pm-body" style={{ height }} onMouseLeave={() => setActive({})}>
      <div className="pm-list">
        {groups.map((group) => <section key={group.module} className={`pm-group module-${group.module}`} style={{ marginBottom: GAP }} aria-label={group.title}>
          <div className="pm-head" style={{ height: HEADER }}>
            <h3><i aria-hidden="true" />{group.title}</h3>
            {group.done ? <span className="pm-direction">{group.direction}</span> : null}
            {group.done && !compact && <Link className="pm-more" href={`/results/${group.module}${suffix}`} aria-label={`${group.title} 자세히`}><Icon name="chevron" size={14} /></Link>}
          </div>
          {group.done ? group.rows.map((row) => <div key={row.id} className={`pm-row ${rowOn(row.id) ? "" : "dim"}`} style={{ height: ROW }} tabIndex={0}
            onMouseEnter={() => setActive({ row: row.id })} onFocus={() => setActive({ row: row.id })} onBlur={() => setActive({})}>
            <span className="pm-label" title={row.label}><span className="full">{row.label}</span><span className="short">{row.short}</span></span>
            <span className="pm-track" aria-hidden="true">
              <span className="pm-mid" />
              {row.reference !== undefined && <span className="pm-ref" style={{ left: `${row.reference}%` }} />}
              <span className="pm-bar" style={{ width: `${Math.max(1.5, row.score)}%` }} />
            </span>
            <span className="pm-value">{row.mean.toFixed(1)}</span>
            <span className="sr-only">{`${row.label} 평균 ${row.mean.toFixed(1)} / ${row.points}, 0–100 점수 ${row.score}`}</span>
          </div>) : <div className="pm-pending" style={{ height: ROW }}>
            <span>검사 전</span>
            {!example && <Link className="text-link" href={`/questions/${group.module}`}>검사하기 <Icon name="chevron" size={13} /></Link>}
          </div>}
        </section>)}
      </div>
      <svg className="pm-links" viewBox={`0 0 ${GUTTER} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        {links.map((link, index) => {
          const y1 = centers.get(link.from)!;
          const y2 = centers.get(link.to)!;
          return <g key={`${link.ruleId}-${index}`} className={`pm-link ${link.kind} ${linkOn(link, index) ? "" : "dim"}`}>
            <path d={arcPath(y1, y2, index % 3)} />
            <circle cx={2} cy={y1} r={3} />
            <circle cx={2} cy={y2} r={3} />
          </g>;
        })}
      </svg>
    </div>
    {!compact && <figcaption className="pm-legend">
      <span><i className="pm-key bar" />막대: 0–100으로 옮긴 점수 · 숫자: 원 척도 평균 · 가운데 점선: 척도 중간</span>
      {groups.some((group) => group.module === "attachment" && group.done) && <span><i className="pm-key ref" />애착: ECR-R 표본 평균</span>}
      <span><i className="pm-key resource" />함께 보이는 자원</span>
      <span><i className="pm-key pattern" />함께 살펴볼 흐름</span>
    </figcaption>}
    {!compact && <div className="pm-connections">
      <h3>지표 사이의 연결</h3>
      {links.length > 0 ? <ul>{links.map((link, index) => <li key={`${link.ruleId}-${index}`} className={`${link.kind} ${active.link === index ? "on" : ""}`}
        onMouseEnter={() => setActive({ link: index })} onMouseLeave={() => setActive({})} onFocus={() => setActive({ link: index })} onBlur={() => setActive({})} tabIndex={0}>
        <span className="pm-chip">{link.kind === "resource" ? "자원" : "살펴볼 흐름"}</span>
        <strong>{link.title}</strong>
        <p>{link.text}</p>
        <small>{link.evidence.map((item) => `${item.label} ${item.score}`).join(" · ")}</small>
      </li>)}</ul> : <p className="viz-text">{groups.filter((group) => group.done).length < 2 ? "검사를 두 개 이상 마치면 지표 사이의 연결이 보여요." : "지금은 서로 다른 검사에서 함께 두드러진 지표 조합이 없어요."}</p>}
    </div>}
  </figure>;
}
