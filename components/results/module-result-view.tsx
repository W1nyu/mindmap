"use client";

import Link from "next/link";
import { assessmentModules, formLabels, type FormId, type ModuleId } from "@/data/modules";
import { typeCard } from "@/lib/profile-types";
import { AttachmentResult } from "./attachment-result";
import { Calculation } from "./calculation";
import { DefenseResult } from "./defense-result";
import { EmotionResult } from "./emotion-result";
import { ResultEmptyState, ResultFrame } from "./result-frame";
import { ScorePrecision } from "./score-precision";
import { TraitResult } from "./trait-result";
import { TypeCardView } from "./type-card";
import { useModuleResult } from "./use-module-result";

const descriptions: Record<ModuleId, string> = {
  emotion: "속상한 순간 감정을 다루는 여섯 영역이에요. 점수가 높을수록 그 영역이 어렵다는 뜻이에요.",
  defense: "스트레스 앞에서 자주 꺼내는 방어 방식이에요.",
  traits: "어느 쪽 끝도 더 나은 방향이 아니에요.",
  attachment: "관계 불안과 친밀 회피, 두 축의 위치예요.",
};

export function ModuleResultView({ id, example, form }: { id: ModuleId; example: boolean; form?: FormId }) {
  const { ready, states, result, failed } = useModuleResult(id, example, form);
  if (!example && !ready) return <p role="status">응답을 확인하고 있어요.</p>;
  if (!result) return <ResultEmptyState id={id} failed={failed || states.brief.invalidSavedSession || states.deep.invalidSavedSession} />;
  const assessment = assessmentModules[id];
  const current = assessment.forms[result.form];
  const other = result.form === "brief" ? "deep" : "brief";
  const otherDone = !example && Boolean(states[other].session?.completed);
  return <ResultFrame id={id} form={result.form} example={example} title={`${example ? "예시: " : ""}${assessment.title}`}
    description={`${formLabels[result.form]} · ${current.name} (${current.citation}). ${descriptions[id]} 진단이 아닌 경향이에요.`}
    switcher={otherDone ? <Link className="text-link" href={`/results/${id}?form=${other}`}>{formLabels[other]} 결과 보기</Link>
      : !example ? <Link className="text-link" href={`/questions/${id}?form=${other}`}>{formLabels[other]}({assessment.forms[other].instrument.items.length}문항)도 해 보기</Link> : null}
    calculation={<Calculation result={result} />} storageAvailable={states[result.form].storageAvailable}>
    <TypeCardView card={typeCard(result)} large />
    {result.module === "emotion" && <EmotionResult profile={result.profile} />}
    {result.module === "defense" && <DefenseResult profile={result.profile} />}
    {result.module === "traits" && <TraitResult profile={result.profile} />}
    {result.module === "attachment" && <AttachmentResult profile={result.profile} />}
    <ScorePrecision id={id} result={result} />
  </ResultFrame>;
}
