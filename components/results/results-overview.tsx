"use client";

import Link from "next/link";
import { ProfileMap } from "@/components/charts/profile-map";
import { Icon } from "@/components/icon";
import { moduleIds } from "@/data/modules";
import { BalanceSection } from "./balance-section";
import { TypeCardDeck } from "./type-card";
import { useAllModuleResults } from "./use-module-result";

export function ResultsOverview({ example }: { example: boolean }) {
  const { ready, results } = useAllModuleResults(example);
  if (!ready) return <p role="status">응답을 확인하고 있어요.</p>;
  const completed = moduleIds.filter((id) => results[id]);
  return <>
    <div className="section-heading result-header"><div><h1 className="page-title">{example ? "예시 마음 프로필" : "나의 마음 프로필"}</h1><p className="page-description">네 검사의 지표를 한 축에 모으고, 함께 두드러진 지표를 선으로 이었어요. 진단이 아닌 경향이에요.</p></div>{example && <span className="example-badge">예시</span>}</div>
    {completed.length === 0 && !example ? <div className="empty-panel"><h2>아직 결과가 없어요</h2><p className="viz-text">검사 하나만 마쳐도 프로필이 그려져요.</p><div className="hero-actions"><Link className="button button-primary" href="/questions">검사 시작 <Icon name="arrow" size={16} /></Link><Link className="text-link" href="/results?example=1">예시 보기</Link></div></div> : <>
      <TypeCardDeck results={results} example={example} />
      <section className="viz-card" aria-labelledby="profile-title">
        <div className="viz-heading"><div><h2 id="profile-title">통합 프로필</h2></div></div>
        <ProfileMap results={results} example={example} />
      </section>
      <BalanceSection results={results} />
    </>}
  </>;
}
