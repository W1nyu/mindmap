"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { assessmentModules, formLabels, type FormId, type ModuleId } from "@/data/modules";
import { moduleStores } from "@/lib/module-stores";
import type { ResponseQuality } from "@/types/assessment";

export function ResultEmptyState({ id, failed }: { id: ModuleId; failed: boolean }) {
  const assessment = assessmentModules[id];
  return <div className="empty-state">
    <h1 className="page-title">응답을 마치면 {assessment.title} 결과를 볼 수 있어요</h1>
    <p className="page-description">{failed ? "저장된 응답을 확인하지 못했어요. 다시 응답해 주세요." : `간편 검사(${assessment.forms.brief.instrument.items.length}문항)만 마쳐도 결과가 열려요.`}</p>
    <div className="hero-actions"><Link href={`/questions/${id}`} className="button button-primary">검사 시작 <Icon name="arrow" size={17} /></Link><Link href={`/results/${id}?example=1`} className="text-link">예시 보기</Link></div>
  </div>;
}

export function QualityNote({ quality }: { quality: ResponseQuality }) {
  const notes = [
    quality.allIdentical && "모든 문항에 같은 답을 골랐어요. 문항 간 차이가 드러나지 않아 결과를 해석하기 어려울 수 있어요.",
    quality.highAgreement && "대부분의 문항에 가장 높은 쪽으로 답했어요. 전반적으로 높게 답하는 응답 스타일이 점수를 함께 올렸을 수 있어요.",
    quality.lowAgreement && "대부분의 문항에 동의하지 않았어요. 전반적으로 낮게 답하는 응답 스타일이 점수를 함께 낮췄을 수 있어요.",
    quality.inconsistentReverse && `같은 내용을 반대 방향으로 물은 문항에 비슷하게 답한 경우가 많았어요(불일치 지수 ${quality.reverseGap?.toFixed(2)}, 0–1). 문항을 빠르게 읽었거나, 상황에 따라 양쪽 모두 맞다고 느꼈을 수 있어요.`,
  ].filter(Boolean) as string[];
  if (notes.length === 0) return null;
  return <div className="quality-note" role="note"><Icon name="spark" size={16} /><div><strong>응답 패턴 참고</strong>{notes.map((note) => <p key={note}>{note}</p>)}</div></div>;
}

/** 모듈 결과 화면의 공통 머리말·안내·삭제 동작입니다. */
export function ResultFrame({ id, form, example, title, description, switcher, calculation, storageAvailable, children }: {
  id: ModuleId;
  form: FormId;
  example: boolean;
  switcher: ReactNode;
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
    <div className="section-heading result-header"><div><h1 className="page-title">{title}</h1><p className="page-description">{description}</p>{switcher && <p className="form-switch">{switcher}</p>}</div>{example && <span className="example-badge">예시</span>}</div>
    {!example && !storageAvailable && <p className="form-message" role="status">저장 기능을 사용할 수 없어 새로고침하면 응답과 결과가 사라집니다.</p>}
    {children}
    <div className="calculation-note" id="calculation">{calculation}</div>
    <div className="closing-note no-print"><p>높거나 낮은 점수 모두 부족함을 뜻하지 않아요.</p><Link href={`/questions/${id}?form=${form}`}>{example ? "직접 검사하기" : "응답 수정하기"} <Icon name="arrow" size={17} /></Link></div>
    {!example && <div className="session-actions no-print"><button type="button" className="text-link" onClick={() => setConfirmReset(true)}>이 {formLabels[form]} 응답 삭제</button></div>}
    {confirmReset && <div className="reset-confirmation" role="group" aria-label="응답과 결과 삭제 확인"><p>{assessment.title} {formLabels[form]} 응답과 결과를 지울까요?</p><div className="session-actions"><button type="button" className="button button-primary" onClick={() => { moduleStores[id][form].clear(); setConfirmReset(false); }}>삭제</button><button type="button" className="text-link" onClick={() => setConfirmReset(false)}>취소</button></div></div>}
  </>;
}
