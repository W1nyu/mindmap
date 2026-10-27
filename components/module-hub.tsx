"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { useModuleProgress, type ModuleProgress } from "@/components/use-module-progress";
import { assessmentModules, formIds, formLabels } from "@/data/modules";

/** 검사 하나: 첫 화면과 같은 가지 모양. 간편·심층 검사지로 바로 들어가고, 진행 상태를 함께 보여줍니다. */
function ModuleBranch({ progress }: { progress: ModuleProgress }) {
  const assessment = assessmentModules[progress.id];
  return <article className={`branch module-${progress.id} ${progress.completed ? "is-complete" : ""}`}>
    <svg className="branch-stroke" viewBox="0 0 40 120" aria-hidden="true"><path d="M6 0C6 50 34 60 34 120" /></svg>
    <div>
      <div className="branch-head"><h2>{assessment.title}</h2>{progress.completed && <Link className="text-link" href={`/results/${progress.id}`}>결과 보기 <Icon name="chevron" size={14} /></Link>}</div>
      <p>{assessment.tagline}</p>
      <ul className="branch-forms">{formIds.map((form) => {
        const meta = assessment.forms[form];
        const state = progress.forms[form];
        const status = state.completed ? "완료" : state.answered > 0 ? `${state.answered}/${state.total} 응답` : `${meta.instrument.items.length}문항, 약 ${meta.estimatedMinutes}분`;
        return <li key={form}><Link href={`/questions/${progress.id}?form=${form}`} className={state.completed ? "done" : state.answered > 0 ? "partial" : ""}>
          {state.completed && <Icon name="check" size={14} />}<strong>{formLabels[form]}</strong><span>{status}</span>
        </Link></li>;
      })}</ul>
      <p className="branch-basis">{assessment.forms.brief.name}, {assessment.forms.deep.name}</p>
    </div>
  </article>;
}

/** 모듈별 진행 상태. 각 모듈은 간편·심층 중 원하는 검사로 결과를 볼 수 있습니다. */
export function ModuleHub() {
  const { modules } = useModuleProgress();
  return <div className="branch-list hub-branches">{modules.map((progress) => <ModuleBranch key={progress.id} progress={progress} />)}</div>;
}
