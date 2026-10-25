"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { TerrainMap } from "@/components/charts/terrain-map";
import { Icon } from "@/components/icon";
import { useAllModuleResults } from "@/components/results/use-module-result";
import { useModuleProgress } from "@/components/use-module-progress";
import { WellbeingSummaryCard } from "@/components/wellbeing/wellbeing-summary";
import { wellbeingStore } from "@/components/wellbeing/wellbeing-store";
import { assessmentModules } from "@/data/modules";

function HomeDashboard() {
  const { modules, completedCount } = useModuleProgress();
  const { results } = useAllModuleResults(false);
  const next = modules.find((item) => !item.completed && item.answered > 0) ?? modules.find((item) => !item.completed);

  return <>
    <div className="dash-hero">
      <h1>나의 마음 지형도</h1>
      {next && <Link className="button button-primary" href={`/questions/${next.id}`}>{next.answered > 0 ? "이어서 하기" : "다음"}: {assessmentModules[next.id].title} <Icon name="arrow" size={16} /></Link>}
    </div>
    <div className="dash-grid">
      <section className="viz-card dash-terrain" aria-label="마음 지형도">
        <TerrainMap results={results} compact />
      </section>
      <div className="dash-side">
        <section className="viz-card" aria-labelledby="dash-modules-title">
          <div className="viz-heading" style={{ marginBottom: 6 }}><h2 id="dash-modules-title">네 지역</h2><span className="subtle-label">{completedCount} / {modules.length}</span></div>
          <ul className="module-checklist">{modules.map((item) => <li key={item.id}><Link href={item.completed ? `/results/${item.id}` : `/questions/${item.id}`}>
            <span className={`check ${item.completed ? "done" : item.answered > 0 ? "partial" : ""}`}>{item.completed ? <Icon name="check" size={14} /> : item.answered > 0 ? `${Math.round((item.answered / item.total) * 100)}` : null}</span>
            <span><strong>{assessmentModules[item.id].title}</strong><small>{item.completed ? "결과 보기" : item.answered > 0 ? `${item.answered}/${item.total}` : `${item.total}문항`}</small></span>
            <Icon name="chevron" size={15} className="chev" />
          </Link></li>)}</ul>
        </section>
        <WellbeingSummaryCard />
      </div>
    </div>
  </>;
}

/** 진행 기록이 있으면 대시보드, 없으면 소개 화면. 저장소는 브라우저에서만 읽으므로 첫 렌더는 소개 화면입니다. */
export function HomeSwitch({ landing }: { landing: ReactNode }) {
  const { ready, modules } = useModuleProgress();
  const checks = wellbeingStore.useValue();
  const returning = ready && checks.ready && (modules.some((item) => item.answered > 0) || checks.value.length > 0);
  return returning ? <HomeDashboard /> : <>{landing}</>;
}
