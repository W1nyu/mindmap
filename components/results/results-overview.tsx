"use client";

import Link from "next/link";
import { AttachmentPlane } from "@/components/charts/attachment-plane";
import { TerrainMap } from "@/components/charts/terrain-map";
import { Icon } from "@/components/icon";
import { defenseMeta, tierMeta } from "@/data/defense-mechanisms";
import { dimensions } from "@/data/dimensions";
import { assessmentModules, moduleIds, type ModuleId } from "@/data/modules";
import { traitMeta } from "@/data/traits";
import type { ModuleResult } from "@/lib/module-results";
import { BalanceSection } from "./balance-section";
import { useAllModuleResults } from "./use-module-result";

function ModuleSummary({ result, example }: { result: ModuleResult; example: boolean }) {
  const href = `/results/${result.module}${example ? "?example=1" : ""}`;
  const title = assessmentModules[result.module].title;
  let body;
  if (result.module === "reaction") {
    body = <ul className="score-list compact">{result.result.dimensions.map((item) => <li key={item.dimension}><div><span>{dimensions.find((dimension) => dimension.id === item.dimension)!.shortName}</span><strong>{item.score}</strong></div><div className="score-track" aria-hidden="true"><span style={{ width: `${item.score}%` }} /></div></li>)}</ul>;
  } else if (result.module === "defense") {
    const { profile } = result;
    body = <>
      {profile.composition && <div className="composition-bar small" role="img" aria-label={profile.composition.map((item) => `${tierMeta(item.tier).name} ${item.share}%`).join(", ")}>{profile.composition.filter((item) => item.share > 0).map((item) => <span key={item.tier} className={`tier-${item.tier}`} style={{ flexGrow: item.share }} />)}</div>}
      <ul className="summary-facts">{profile.tiers.map((tier) => <li key={tier.tier} className={`tier-${tier.tier}`}><i aria-hidden="true" />{tierMeta(tier.tier).name}<strong>{tier.score}</strong></li>)}</ul>
      {profile.highlights.length > 0 && <p className="summary-line">자주 꺼내는 방어 · {profile.highlights.map((item) => `${defenseMeta(item.defense).name} ${item.score}`).join(", ")}</p>}
    </>;
  } else if (result.module === "attachment") {
    body = <div className="mini-plane"><AttachmentPlane anxiety={result.profile.anxiety.score} avoidance={result.profile.avoidance.score} compact /><ul className="summary-facts"><li>관계 불안<strong>{result.profile.anxiety.score}</strong></li><li>친밀 회피<strong>{result.profile.avoidance.score}</strong></li></ul></div>;
  } else {
    body = <ul className="mini-traits">{result.profile.leanings.map((item) => <li key={item.trait}><span>{traitMeta.find((trait) => trait.id === item.trait)!.shortName}</span><span className="trait-track mini" aria-hidden="true"><span className="trait-marker" style={{ left: `${item.score}%` }} /></span><strong>{item.score}</strong></li>)}</ul>;
  }
  return <article className={`summary-card module-${result.module}`}><div className="viz-heading"><h3 className="module-title"><i aria-hidden="true" />{title}</h3><Link className="text-link" href={href}>자세히 <Icon name="chevron" size={13} /></Link></div>{body}</article>;
}

function PendingSummary({ id }: { id: ModuleId }) {
  const assessment = assessmentModules[id];
  return <article className="summary-card pending"><div className="viz-heading"><h3>{assessment.title}</h3><span className="subtle-label">{assessment.instrument.items.length}문항</span></div><Link className="button button-secondary" href={`/questions/${id}`}>시작하기 <Icon name="arrow" size={15} /></Link></article>;
}

export function ResultsOverview({ example }: { example: boolean }) {
  const { ready, results } = useAllModuleResults(example);
  if (!ready) return <p role="status">응답을 확인하고 있어요.</p>;
  const completed = moduleIds.filter((id) => results[id]);
  return <>
    <div className="section-heading result-header"><div><h1 className="page-title">{example ? "예시 마음 지형도" : "나의 마음 지형도"}</h1><p className="page-description">봉우리가 높을수록 그 경향이 응답에 자주 드러났어요. 진단이 아닌 경향이에요.</p></div>{example && <span className="example-badge">예시</span>}</div>
    {completed.length === 0 && !example ? <div className="empty-panel"><h2>아직 결과가 없어요</h2><p className="viz-text">모듈 하나만 마쳐도 첫 봉우리가 솟아요.</p><div className="hero-actions"><Link className="button button-primary" href="/questions">시작하기 <Icon name="arrow" size={16} /></Link><Link className="text-link" href="/results?example=1">예시 보기</Link></div></div> : <>
      <section className="viz-card terrain-card" aria-label="마음 지형도">
        <TerrainMap results={results} example={example} interactive />
      </section>
      <BalanceSection results={results} />
      <section aria-labelledby="summary-title"><div className="section-heading"><div><h2 id="summary-title">모듈별 결과</h2></div></div>
        <div className="summary-grid">{moduleIds.map((id) => results[id] ? <ModuleSummary key={id} result={results[id]!} example={example} /> : <PendingSummary key={id} id={id} />)}</div>
      </section>
    </>}
  </>;
}
