"use client";

import Link from "next/link";
import { useState } from "react";
import { AttachmentPlane } from "@/components/charts/attachment-plane";
import { MindMap } from "@/components/charts/mind-map";
import { TerrainMap } from "@/components/charts/terrain-map";
import { Icon } from "@/components/icon";
import { defenseMeta, tierMeta } from "@/data/defense-mechanisms";
import { dimensions } from "@/data/dimensions";
import { assessmentModules, moduleIds, type ModuleId } from "@/data/modules";
import { traitMeta } from "@/data/traits";
import { balanceZone } from "@/lib/defense-analysis";
import { integratedInsights, type ModuleResults } from "@/lib/integration";
import { buildMindMap } from "@/lib/mind-map";
import type { ModuleResult } from "@/lib/module-results";
import { AiExplainCard } from "./ai-explain-card";
import { BalanceSection } from "./balance-section";
import { TerrainStory } from "./terrain-story";
import { ShareLinkButton } from "./share-link-button";
import { SummaryImageButton } from "./summary-image-button";
import { useAllModuleResults } from "./use-module-result";

function ModuleSummary({ result, example, linked }: { result: ModuleResult; example: boolean; linked: boolean }) {
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
      {profile.balance && <p className="summary-line">무게중심 <strong>{profile.balance.position}</strong> · {balanceZone(profile.balance.position).label}</p>}
      {profile.highlights.length > 0 && <p className="summary-line">자주 꺼내는 방어 · {profile.highlights.map((item) => `${defenseMeta(item.defense).name} ${item.score}`).join(", ")}</p>}
    </>;
  } else if (result.module === "attachment") {
    body = <div className="mini-plane"><AttachmentPlane anxiety={result.profile.anxiety.score} avoidance={result.profile.avoidance.score} compact /><ul className="summary-facts"><li>관계 불안<strong>{result.profile.anxiety.score}</strong></li><li>친밀 회피<strong>{result.profile.avoidance.score}</strong></li></ul></div>;
  } else {
    body = <ul className="mini-traits">{result.profile.leanings.map((item) => <li key={item.trait}><span>{traitMeta.find((trait) => trait.id === item.trait)!.shortName}</span><span className="trait-track mini" aria-hidden="true"><span className="trait-marker" style={{ left: `${item.score}%` }} /></span><strong>{item.score}</strong></li>)}</ul>;
  }
  return <article className={`summary-card module-${result.module}`}><div className="viz-heading"><h3 className="module-title"><i aria-hidden="true" />{title}</h3>{linked && <Link className="text-link" href={href}>자세히 <Icon name="chevron" size={13} /></Link>}</div>{body}</article>;
}

function PendingSummary({ id, shared }: { id: ModuleId; shared: boolean }) {
  const assessment = assessmentModules[id];
  if (shared) return <article className="summary-card pending"><div className="viz-heading"><h3>{assessment.title}</h3><span className="subtle-label">공유되지 않음</span></div><p className="viz-text">이 모듈의 결과는 링크에 담기지 않았어요.</p></article>;
  return <article className="summary-card pending"><div className="viz-heading"><h3>{assessment.title}</h3><span className="subtle-label">응답 전</span></div><p className="viz-text">{assessment.tagline}. 약 {assessment.estimatedMinutes}분이면 지도에 이 가지가 더해져요.</p><Link className="button button-primary" href={`/questions/${id}`}>시작하기 <Icon name="arrow" size={15} /></Link></article>;
}

export type OverviewVariant = "mine" | "example" | "shared";

const headings: Record<OverviewVariant, { title: string; notice: string }> = {
  mine: { title: "나의 마음 지형도", notice: "결과는 상황과 시점에 따라 달라질 수 있는 경향이며, 진단이나 고정된 성격 유형이 아닙니다. 맞지 않는다고 느끼는 해석은 흘려보내도 괜찮아요." },
  example: { title: "샘플 응답으로 그린 마음 지형도", notice: "결과는 상황과 시점에 따라 달라질 수 있는 경향이며, 진단이나 고정된 성격 유형이 아닙니다. 맞지 않는다고 느끼는 해석은 흘려보내도 괜찮아요." },
  shared: { title: "공유받은 마음 지형도", notice: "링크에 담긴 응답으로 지금 이 브라우저에서 계산한 결과예요. 어디에도 저장되지 않아요. 진단이 아닌 경향이니, 결과의 주인과 함께 이야기하며 살펴봐 주세요." },
};

export function ResultsOverview({ example }: { example: boolean }) {
  const { ready, results } = useAllModuleResults(example);
  if (!ready) return <p role="status">응답을 확인하고 있어요.</p>;
  return <OverviewBody results={results} variant={example ? "example" : "mine"} />;
}

/** 마음 지도 본문. 공유 화면에서는 저장·AI·상세 이동을 끄고 같은 계산 결과만 보여줍니다. */
export function OverviewBody({ results, variant }: { results: ModuleResults; variant: OverviewVariant }) {
  const example = variant === "example";
  const shared = variant === "shared";
  const completed = moduleIds.filter((id) => results[id]);
  const integration = integratedInsights(results);
  const branches = buildMindMap(results);
  const heading = headings[variant];
  const [view, setView] = useState<"terrain" | "branches">("terrain");
  const [highlight, setHighlight] = useState<readonly string[]>([]);

  return <>
    <div className="section-heading result-header"><div><h1 className="page-title">{heading.title}</h1><p className="page-description">반응 패턴, 방어기제, 성격 경향, 관계 애착을 하나의 지형으로 이어 봤어요. 마친 모듈만 봉우리가 솟고, 나머지 지역은 언제든 채울 수 있어요.</p></div><span className="example-badge">{example ? "샘플 응답 예시" : shared ? "공유 링크로 받은 결과" : `${completed.length} / ${moduleIds.length} 지역 완성`}</span></div>
    <div className="preview-notice"><Icon name="shield" size={18} /><p><strong>모든 점수는 고정된 계산식과 규칙으로 만들어졌어요.</strong> {heading.notice}</p></div>
    {completed.length === 0 && variant === "mine" ? <div className="empty-panel"><h2>아직 지도에 그릴 결과가 없어요</h2><p className="viz-text">모듈 하나만 마쳐도 첫 봉우리가 솟아요. 가장 짧은 관계 애착 모듈은 약 2분이면 끝나요.</p><div className="hero-actions"><Link className="button button-primary" href="/questions/attachment">2분 모듈로 시작 <Icon name="arrow" size={16} /></Link><Link className="text-link" href="/results?example=1">예시 지형도 보기 <Icon name="chevron" size={14} /></Link></div></div> : <>
      <div className="result-actions no-print">
        {!shared && <SummaryImageButton results={results} branches={branches} example={example} />}
        {variant === "mine" && <ShareLinkButton results={results} />}
      </div>
      <section className="viz-card terrain-card" aria-labelledby="terrain-title"><div className="viz-heading"><div><h2 id="terrain-title">{view === "terrain" ? "마음 지형도" : "가지 지도"}</h2><p className="viz-caption" style={{ marginTop: 2 }}>{view === "terrain" ? (shared ? "공유된 모듈만 봉우리가 솟아요." : "봉우리를 누르면 설명이, 점선 길은 모듈을 가로지르는 연결이에요.") : (shared ? "공유된 모듈만 가지가 그려져요." : "가지를 누르면 자세한 결과로 이동해요.")}</p></div>
        <div className="view-switch no-print" role="group" aria-label="지도 보기 방식"><button type="button" aria-pressed={view === "terrain"} onClick={() => setView("terrain")}>지형도</button><button type="button" aria-pressed={view === "branches"} onClick={() => setView("branches")}>가지 지도</button></div></div>
        {view === "terrain" ? <TerrainMap results={results} example={example} interactive={!shared} highlight={highlight} /> : <div style={{ padding: "0 26px 20px" }}><MindMap branches={branches} example={example} interactive={!shared} /></div>}
      </section>
      {view === "terrain" && <TerrainStory results={results} onHighlight={setHighlight} />}
      <BalanceSection results={results} />
      <section aria-labelledby="integration-title">
        <div className="section-heading"><div><h2 id="integration-title">모듈을 가로지르는 연결</h2><p>서로 다른 모듈의 점수가 함께 높거나(63 이상) 낮을 때(37 이하)만 보여주는 해석 가설이에요.</p></div></div>
        {integration.matched.length > 0 ? <div className="interaction-grid">{integration.matched.map(({ rule, evidence }) => <article key={rule.id} className={`interaction-card ${rule.kind}`}>
          <span className="interaction-kind">{rule.kind === "resource" ? "자원" : "살펴볼 패턴"}</span>
          <h3>{rule.title}</h3><p>{rule.text}</p>
          <p className="interaction-strategy"><Icon name="spark" size={14} /> {rule.strategy}</p>
          <p className="interaction-evidence">근거: {evidence.map((item) => `${assessmentModules[item.module].title} · ${assessmentModules[item.module].scales.find((scale) => scale.id === item.scale)!.name} ${item.score}`).join(" / ")}</p>
        </article>)}</div> : <p className="viz-text">{integration.evaluated > 0 ? "지금 응답에서는 모듈 간에 함께 두드러진 조합이 없어요." : "모듈을 두 개 이상 마치면 서로 연결된 해석이 열려요."}</p>}
        {integration.waiting > 0 && <p className="viz-caption">다른 모듈을 마치면 {integration.waiting}개의 연결 해석을 더 확인할 수 있어요.</p>}
      </section>
      {variant === "mine" && <AiExplainCard results={results} />}
      <section aria-labelledby="summary-title"><div className="section-heading"><div><h2 id="summary-title">모듈별 요약</h2></div></div>
        <div className="summary-grid">{moduleIds.map((id) => results[id] ? <ModuleSummary key={id} result={results[id]!} example={example} linked={!shared} /> : <PendingSummary key={id} id={id} shared={shared} />)}</div>
      </section>
    </>}
    {shared ? <div className="closing-note no-print"><Icon name="leaf" size={18} /><p>나의 마음 지도도 그려 보고 싶다면 시작해 보세요. 응답은 내 브라우저에만 저장돼요.</p><Link href="/questions">나도 해 보기 <Icon name="arrow" size={17} /></Link></div> : <nav className="next-steps no-print" aria-label="다음으로 해볼 수 있는 것">
      <Link href="/practice"><Icon name="leaf" size={18} /><span><strong>실천 카드</strong>결과에 맞춘 작은 연습</span></Link>
      <Link href="/journal"><Icon name="spark" size={18} /><span><strong>마음 기록</strong>오늘의 반응을 흐름으로 적기</span></Link>
      <Link href="/results/history"><Icon name="clock" size={18} /><span><strong>기록과 변화</strong>저장한 결과를 시간에 따라 비교</span></Link>
      <Link href="/learn"><Icon name="question" size={18} /><span><strong>방어기제 사전</strong>15가지 방식의 뜻과 예</span></Link>
    </nav>}
  </>;
}
