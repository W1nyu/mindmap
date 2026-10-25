"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { useModuleProgress, type ModuleProgress } from "@/components/use-module-progress";
import { assessmentModules, formIds, formLabels, moduleIds } from "@/data/modules";

function ModuleCard({ progress }: { progress: ModuleProgress }) {
  const assessment = assessmentModules[progress.id];
  return <article className={`module-card module-${progress.id} ${progress.completed ? "is-complete" : ""}`}>
    <div className="module-card-top"><span className="module-region"><i /></span>{progress.completed && <Link className="text-link" href={`/results/${progress.id}`}>결과 보기 <Icon name="chevron" size={14} /></Link>}</div>
    <h2>{assessment.title}</h2>
    <p className="module-tagline">{assessment.tagline}</p>
    <ul className="form-list">{formIds.map((form) => {
      const meta = assessment.forms[form];
      const state = progress.forms[form];
      const status = state.completed ? "완료" : state.answered > 0 ? `${state.answered}/${state.total}` : null;
      return <li key={form}><Link href={`/questions/${progress.id}?form=${form}`} className={`form-option ${form}`}>
        <span className="form-option-head"><strong>{formLabels[form]}</strong>{status && <em className={state.completed ? "done" : ""}>{state.completed && <Icon name="check" size={12} />} {status}</em>}</span>
        <span className="form-option-meta">{meta.name} · {meta.instrument.items.length}문항 · 약 {meta.estimatedMinutes}분</span>
      </Link></li>;
    })}</ul>
  </article>;
}

/** 모듈별 진행 상태. 각 모듈은 간편·심층 중 원하는 검사로 결과를 볼 수 있습니다. */
export function ModuleHub() {
  const { ready, modules, completedCount } = useModuleProgress();
  return <>
    {ready && completedCount > 0 && <p className="hub-summary" role="status">{moduleIds.length}개 중 {completedCount}개 완료</p>}
    <div className="module-grid">{modules.map((progress) => <ModuleCard key={progress.id} progress={progress} />)}</div>
  </>;
}
