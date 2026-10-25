"use client";

import { assessmentModules, type ModuleId } from "@/data/modules";
import { AttachmentCalculation, AttachmentResult } from "./attachment-result";
import { DefenseCalculation, DefenseResult } from "./defense-result";
import { ReactionCalculation, ReactionResult } from "./reaction-result";
import { ResultEmptyState, ResultFrame } from "./result-frame";
import { TraitCalculation, TraitResult } from "./trait-result";
import { ScorePrecision } from "./score-precision";
import { StrongStatements } from "./strong-statements";
import { useModuleResult } from "./use-module-result";

const titles: Record<ModuleId, { mine: string; example: string; description: string }> = {
  reaction: { mine: "내 응답에서 살펴보는 8가지 반응 경향", example: "샘플 응답으로 그린 반응 패턴 지도", description: "높고 낮음에 정답은 없어요. 각 점수는 응답의 동의 정도를 계산한 값입니다." },
  defense: { mine: "마음이 나를 지키는 방식", example: "샘플 응답으로 그린 방어기제 프로필", description: "방어기제는 누구에게나 있는 마음의 보호 장치예요. 어떤 방식을 자주 꺼내는지, 그 방식이 무엇을 지켜 주고 어떤 비용을 남기는지 함께 살펴봐요." },
  traits: { mine: "다섯 가지 축으로 본 나의 성향", example: "샘플 응답으로 그린 성격 5요인 경향", description: "다섯 개의 스펙트럼에서 지금의 내가 어디쯤 있는지 보여줘요. 어느 쪽 끝도 더 나은 방향이 아니에요." },
  attachment: { mine: "가까운 관계에서 나의 거리", example: "샘플 응답으로 그린 관계 애착 경향", description: "가까운 사람에게 다가가고 물러서는 방식을 관계 불안과 친밀 회피, 두 축의 위치로 보여줘요. 유형으로 나누지 않아요." },
};

export function ModuleResultView({ id, example }: { id: ModuleId; example: boolean }) {
  const { state, result, failed } = useModuleResult(id, example);
  if (!example && !state.ready) return <p role="status">응답을 확인하고 있어요.</p>;
  if (!result) return <ResultEmptyState id={id} failed={failed || state.invalidSavedSession} />;
  const copy = titles[id];
  const calculation = result.module === "reaction" ? <ReactionCalculation result={result.result} />
    : result.module === "defense" ? <DefenseCalculation profile={result.profile} />
    : result.module === "traits" ? <TraitCalculation profile={result.profile} /> : <AttachmentCalculation profile={result.profile} />;
  return <ResultFrame id={id} example={example} title={example ? copy.example : copy.mine} description={copy.description} calculation={calculation} storageAvailable={state.storageAvailable}>
    {result.module === "reaction" && <ReactionResult result={result.result} quality={result.quality} />}
    {result.module === "defense" && <DefenseResult profile={result.profile} />}
    {result.module === "traits" && <TraitResult profile={result.profile} />}
    {result.module === "attachment" && <AttachmentResult profile={result.profile} />}
    <ScorePrecision id={id} result={result} />
    <StrongStatements id={id} result={result} />
    <p className="viz-caption">{assessmentModules[id].basis}</p>
  </ResultFrame>;
}
