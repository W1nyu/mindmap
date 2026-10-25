"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { assessmentModules, moduleIds, type ModuleId } from "@/data/modules";
import { moduleStores } from "@/lib/module-stores";
import { instrumentResponses } from "@/lib/session";
import type { SessionSnapshot } from "@/lib/session-store";

function ModuleCard({ id, state }: { id: ModuleId; state: SessionSnapshot }) {
  const assessment = assessmentModules[id];
  const total = assessment.instrument.items.length;
  const answered = state.session ? instrumentResponses(assessment.instrument, state.session).length : 0;
  const completed = Boolean(state.session?.completed);
  const status = !state.ready ? "확인 중" : completed ? "완료" : answered > 0 ? `${answered} / ${total} 응답` : "시작 전";
  return <article className={`module-card module-${id} ${completed ? "is-complete" : ""}`}>
    <div className="module-card-top"><span className="module-region"><i /></span><span className={`module-status ${completed ? "done" : answered > 0 ? "progress" : ""}`}>{completed && <Icon name="check" size={12} />} {status}</span></div>
    <h2>{assessment.title}</h2>
    <p className="module-tagline">{assessment.tagline}</p>
    <p className="module-meta">{total}문항 · 약 {assessment.estimatedMinutes}분</p>
    <div className="module-progress" aria-hidden="true"><span style={{ width: `${(answered / total) * 100}%` }} /></div>
    <div className="module-actions">
      <Link className="button button-primary" href={`/questions/${id}`}>{completed ? "응답 수정" : answered > 0 ? "이어서 하기" : "시작하기"} <Icon name="arrow" size={16} /></Link>
      {completed ? <Link className="text-link" href={`/results/${id}`}>결과 보기 <Icon name="chevron" size={14} /></Link>
        : <Link className="text-link" href={`/results/${id}?example=1`}>예시 결과 <Icon name="chevron" size={14} /></Link>}
    </div>
  </article>;
}

/** 모듈별 진행 상태. 각 모듈은 독립적으로 응답하고 결과를 볼 수 있습니다. */
export function ModuleHub() {
  const states: Record<ModuleId, SessionSnapshot> = {
    reaction: moduleStores.reaction.useSession(),
    defense: moduleStores.defense.useSession(),
    traits: moduleStores.traits.useSession(),
    attachment: moduleStores.attachment.useSession(),
  };
  const completedCount = moduleIds.filter((id) => states[id].session?.completed).length;
  return <>
    {completedCount > 0 && <p className="hub-summary" role="status">{moduleIds.length}개 중 {completedCount}개 완료</p>}
    <div className="module-grid">{moduleIds.map((id) => <ModuleCard key={id} id={id} state={states[id]} />)}</div>
  </>;
}
