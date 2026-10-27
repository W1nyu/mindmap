"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { adviceNote, adviceSituations, type AdviceSituationId } from "@/data/advice";
import { assessmentModules } from "@/data/modules";
import { adviceFor } from "@/lib/advice";
import type { ModuleResults } from "@/lib/integration";

/** 마음 프로필 점수로 고른 상황별 조언. 맞춤 조언을 먼저, 누구에게나 맞는 기본 조언을 뒤에 보여 줍니다. */
export function AdviceSection({ results }: { results: ModuleResults }) {
  const [situation, setSituation] = useState<AdviceSituationId>("anger");
  const advice = adviceFor(results).find((item) => item.situation === situation)!;
  const meta = adviceSituations.find((item) => item.id === situation)!;
  return <section aria-labelledby="advice-title">
    <div className="section-heading"><div><h2 id="advice-title">상황별 조언</h2><p className="page-description">내 프로필에서 두드러진 지표에 맞춰 고른 방법이에요. 맞춤 조언은 근거가 된 점수를 함께 보여 줘요.</p></div></div>
    <div className="wb-period advice-tabs" role="group" aria-label="상황">{adviceSituations.map((item) => <button key={item.id} type="button" aria-pressed={situation === item.id} onClick={() => setSituation(item.id)}>{item.title}</button>)}</div>
    <div className="viz-card advice-card">
      <p className="advice-prompt">{meta.prompt}</p>
      <ol className="advice-list">
        {advice.items.map((item) => <li key={item.id} className={item.personal ? "personal" : ""}>
          <div className="advice-head">
            <h3>{item.title}</h3>
            {item.personal ? <span className="advice-tag"><Icon name="spark" size={13} /> 내 결과 기반</span> : <span className="advice-tag base">누구에게나</span>}
          </div>
          <ol className="advice-steps">{item.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          <p className="advice-basis">{item.evidence.length > 0 && <span className="advice-evidence">{item.evidence.join(" · ")}</span>}{item.basis}</p>
        </li>)}
      </ol>
      {advice.waiting.length > 0 && <p className="viz-caption advice-waiting">{advice.waiting.map((id) => assessmentModules[id].title).join(", ")} 검사를 마치면 이 상황의 맞춤 조언이 더 정확해져요.</p>}
      <p className="viz-caption">{adviceNote}</p>
    </div>
  </section>;
}
