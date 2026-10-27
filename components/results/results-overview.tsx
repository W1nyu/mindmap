"use client";

import Link from "next/link";
import { ProfileMap } from "@/components/charts/profile-map";
import { PageHero } from "@/components/page-hero";
import { moduleIds } from "@/data/modules";
import { AdviceSection } from "./advice-section";
import { BalanceSection } from "./balance-section";
import { TypeCardDeck } from "./type-card";
import { useAllModuleResults } from "./use-module-result";

export function ResultsOverview({ example }: { example: boolean }) {
  const { ready, results } = useAllModuleResults(example);
  if (!ready) return <p role="status">응답을 확인하고 있어요.</p>;
  const completed = moduleIds.filter((id) => results[id]);
  const empty = completed.length === 0 && !example;
  return <>
    <PageHero title={example ? "예시 마음 프로필" : "나의 마음 프로필"} className="results-hero"
      top={example && <span className="example-badge">예시 응답</span>}
      description={<p>{empty ? "검사 하나만 마쳐도 프로필이 그려져요." : "네 검사의 지표를 한 장에 모으고, 함께 두드러진 지표를 선으로 이었어요. 진단이 아닌 지금의 경향이에요."}</p>}>
      {empty ? <div className="hero-actions"><Link className="button button-bright" href="/questions">검사 시작하기</Link><Link className="atlas-example" href="/results?example=1">예시 결과 보기</Link></div>
        : <TypeCardDeck results={results} example={example} />}
    </PageHero>
    {!empty && <>
      <section className="viz-card" aria-labelledby="profile-title">
        <div className="viz-heading"><div><h2 id="profile-title">통합 프로필</h2></div></div>
        <ProfileMap results={results} example={example} />
      </section>
      <BalanceSection results={results} />
      <AdviceSection results={results} />
    </>}
  </>;
}
