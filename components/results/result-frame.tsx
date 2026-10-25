"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { TerrainMap } from "@/components/charts/terrain-map";
import { Icon } from "@/components/icon";
import { assessmentModules, type ModuleId } from "@/data/modules";
import { moduleStores } from "@/lib/module-stores";
import type { ResponseQuality } from "@/types/assessment";
import { ResultActions } from "./result-actions";
import { useModuleResult } from "./use-module-result";

export function ResultEmptyState({ id, failed }: { id: ModuleId; failed: boolean }) {
  const assessment = assessmentModules[id];
  return <div className="empty-state">
    <div className="eyebrow">YOUR INNER LANDSCAPE</div>
    <h1 className="page-title">응답을 마치면 {assessment.title} 결과를 볼 수 있어요</h1>
    <p className="page-description">{failed ? "저장된 응답을 검증하지 못했어요. 질문 화면에서 다시 응답해 주세요." : `${assessment.instrument.items.length}개 질문에 모두 답하고 응답 확인 화면에서 ‘결과 확인’을 눌러주세요.`}</p>
    <div className="hero-actions"><Link href={`/questions/${id}`} className="button button-primary">질문으로 이동 <Icon name="arrow" size={17} /></Link><Link href={`/results/${id}?example=1`} className="text-link">예시 결과 보기</Link></div>
    <p className="page-description">결과는 경향이며, 심리·의학적 진단이 아닙니다.</p>
  </div>;
}

export function QualityNote({ quality }: { quality: ResponseQuality }) {
  const notes = [
    quality.allIdentical && "모든 문항에 같은 답을 골랐어요. 문항 간 차이가 드러나지 않아 결과를 해석하기 어려울 수 있어요.",
    quality.highAgreement && "대부분의 문항에 강하게 동의했어요. 전반적으로 높게 답하는 응답 스타일이 점수를 함께 올렸을 수 있어요. ‘개인 평균 대비’ 차트가 상대적인 차이를 보는 데 도움이 돼요.",
    quality.lowAgreement && "대부분의 문항에 동의하지 않았어요. 전반적으로 낮게 답하는 응답 스타일이 점수를 함께 낮췄을 수 있어요.",
    quality.inconsistentReverse && `같은 내용을 반대 방향으로 물은 문항에 비슷하게 답한 경우가 많았어요(불일치 지수 ${quality.reverseGap?.toFixed(2)}, 0–1). 문항을 빠르게 읽었거나, 상황에 따라 양쪽 모두 맞다고 느꼈을 수 있어요.`,
  ].filter(Boolean) as string[];
  if (notes.length === 0) return null;
  return <div className="quality-note" role="note"><Icon name="spark" size={16} /><div><strong>응답 패턴 참고</strong>{notes.map((note) => <p key={note}>{note}</p>)}<p>결과를 무효로 보지는 않지만, 해석할 때 함께 고려해 주세요. (평균 응답 {quality.meanRaw.toFixed(2)})</p></div></div>;
}

/** 긴 결과 화면에서 바로 이동할 섹션. 값은 각 결과 컴포넌트의 제목 id입니다. */
const sectionJumps: Record<ModuleId, readonly { id: string; label: string }[]> = {
  reaction: [{ id: "radar-title", label: "반응 지도" }, { id: "feature-title", label: "두드러진 경향" }, { id: "flow-title", label: "반응 흐름" }, { id: "interaction-title", label: "차원의 만남" }, { id: "precision-title", label: "점수 확실도" }, { id: "statements-title", label: "동의한 문장" }],
  defense: [{ id: "tier-summary-title", label: "세 수준" }, { id: "balance-title", label: "무게중심" }, { id: "highlight-title", label: "자주 꺼내는 방어" }, { id: "ladder-title", label: "15가지 사다리" }, { id: "deviation-title", label: "내 평균 대비" }, { id: "resource-title", label: "가진 자원" }, { id: "dmrs-title", label: "7단계 위계" }, { id: "precision-title", label: "점수 확실도" }],
  traits: [{ id: "trait-spectrum-title", label: "다섯 스펙트럼" }, { id: "trait-notes-title", label: "강점과 살펴볼 점" }, { id: "precision-title", label: "점수 확실도" }, { id: "statements-title", label: "동의한 문장" }],
  attachment: [{ id: "plane-title", label: "관계 속 위치" }, { id: "axes-title", label: "두 축" }, { id: "precision-title", label: "점수 확실도" }, { id: "statements-title", label: "동의한 문장" }],
};

/** 전체 지형도에서 이 모듈 지역만 확대해 보여줍니다. 같은 계산 결과를 씁니다. */
function RegionTerrain({ id, example }: { id: ModuleId; example: boolean }) {
  const { result } = useModuleResult(id, example);
  const results = useMemo(() => (result ? { [id]: result } : {}), [id, result]);
  if (!result) return null;
  return <section className="viz-card region-terrain" aria-labelledby="region-terrain-title">
    <div className="viz-heading"><div><h2 id="region-terrain-title">지형도 속 {assessmentModules[id].title}</h2><p className="viz-caption" style={{ marginTop: 2 }}>봉우리 높이는 점수예요. 다른 모듈과 함께 보려면 전체 지형도로 가 보세요.</p></div><Link className="text-link no-print" href={`/results${example ? "?example=1" : ""}`}>전체 지형도 <Icon name="chevron" size={13} /></Link></div>
    <TerrainMap results={results} example={example} focusModule={id} />
  </section>;
}

/** 모듈 결과 화면의 공통 머리말·안내·삭제 동작입니다. */
export function ResultFrame({ id, example, title, description, calculation, storageAvailable, children }: {
  id: ModuleId;
  example: boolean;
  title: string;
  description: string;
  calculation: ReactNode;
  storageAvailable: boolean;
  children: ReactNode;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const assessment = assessmentModules[id];
  return <>
    <Link href={`/results${example ? "?example=1" : ""}`} className="text-link back-link no-print"><Icon name="chevron" size={14} style={{ transform: "rotate(180deg)" }} /> 전체 지형도</Link>
    <div className="eyebrow"><span className="tiny-line" /> {assessment.title.toUpperCase()} · YOUR INNER LANDSCAPE</div>
    <div className="section-heading result-header"><div><h1 className="page-title">{title}</h1><p className="page-description">{description}</p></div><span className="example-badge">{example ? "고정 mock 응답 예시" : "내 응답으로 계산"}</span></div>
    <div className="preview-notice"><Icon name="spark" size={18} /><p><strong>{example ? `고정된 ${assessment.instrument.items.length}개 mock 응답을 채점한 예시이며, 사용자 응답 결과가 아닙니다.` : `${assessment.instrument.items.length}개 질문의 응답을 고정된 계산식으로 채점했습니다.`}</strong><br />결과는 상황과 시점에 따라 달라질 수 있는 경향이며, 진단이나 고정된 성격 유형이 아닙니다. 검증된 임상 척도나 모집단 백분위가 아닙니다.</p></div>
    {!example && !storageAvailable && <p className="form-message" role="status">저장 기능을 사용할 수 없어 새로고침하면 응답과 결과가 사라집니다.</p>}
    <ResultActions id={id} example={example} />
    <nav className="section-jump no-print" aria-label="이 결과의 섹션">{sectionJumps[id].map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}<a href="#calculation">계산 근거</a></nav>
    <RegionTerrain id={id} example={example} />
    {children}
    <div className="calculation-note" id="calculation">{calculation}</div>
    <div className="closing-note no-print"><Icon name="leaf" size={18} /><p>지금의 경향을 탐색하는 출발점이에요. 높거나 낮은 점수 모두 부족함을 의미하지 않습니다.</p><Link href={`/questions/${id}`}>{example ? "직접 응답하기" : "응답 수정하기"} <Icon name="arrow" size={17} /></Link></div>
    {!example && <div className="session-actions no-print"><button type="button" className="text-link" onClick={() => setConfirmReset(true)}>이 모듈의 응답과 결과 삭제</button></div>}
    {confirmReset && <div className="reset-confirmation" role="group" aria-label="응답과 결과 삭제 확인"><p>이 탭에 저장된 {assessment.title} 응답과 결과를 지울까요?</p><div className="session-actions"><button type="button" className="button button-primary" onClick={() => { moduleStores[id].clear(); setConfirmReset(false); }}>삭제</button><button type="button" className="text-link" onClick={() => setConfirmReset(false)}>취소</button></div></div>}
  </>;
}
