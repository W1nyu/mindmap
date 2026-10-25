"use client";

import type { ModuleId } from "@/data/modules";
import { AttachmentCalculation, AttachmentResult } from "./attachment-result";
import { DefenseCalculation, DefenseResult } from "./defense-result";
import { ReactionCalculation, ReactionResult } from "./reaction-result";
import { ResultEmptyState, ResultFrame } from "./result-frame";
import { TraitCalculation, TraitResult } from "./trait-result";
import { ScorePrecision } from "./score-precision";
import { useModuleResult } from "./use-module-result";

const titles: Record<ModuleId, { mine: string; example: string; description: string }> = {
  reaction: { mine: "8가지 반응 경향", example: "예시: 8가지 반응 경향", description: "불편한 상황에서 나타나는 반응 경향이에요. 진단이 아닌 경향이에요." },
  defense: { mine: "마음이 나를 지키는 방식", example: "예시: 방어기제 프로필", description: "스트레스 앞에서 자주 꺼내는 방어 방식이에요. 진단이 아닌 경향이에요." },
  traits: { mine: "다섯 가지 성격 경향", example: "예시: 성격 5요인 경향", description: "어느 쪽 끝도 더 나은 방향이 아니에요. 진단이 아닌 경향이에요." },
  attachment: { mine: "가까운 관계에서 나의 거리", example: "예시: 관계 애착 경향", description: "관계 불안과 친밀 회피, 두 축의 위치예요. 진단이 아닌 경향이에요." },
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
  </ResultFrame>;
}
