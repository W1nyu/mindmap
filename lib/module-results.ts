import { attachmentMockResponses, defenseMockResponses, mockResponses, traitMockResponses } from "../data/mock-responses";
import type { ModuleId } from "../data/modules";
import { reactionInstrument } from "../data/questions";
import type { LikertResponse, ResponseQuality } from "../types/assessment";
import type { ScoringResult } from "../types/psychology";
import { analyzeAttachment, type AttachmentProfile } from "./attachment-analysis";
import { analyzeDefenses, type DefenseProfile } from "./defense-analysis";
import { responseQuality } from "./interpretation";
import { scoreQuestionnaire } from "./scoring";
import { analyzeTraits, type TraitProfile } from "./trait-analysis";

export type ModuleResult =
  | { module: "reaction"; result: ScoringResult; quality: ResponseQuality }
  | { module: "defense"; profile: DefenseProfile }
  | { module: "traits"; profile: TraitProfile }
  | { module: "attachment"; profile: AttachmentProfile };

export type ResultOf<M extends ModuleId> = Extract<ModuleResult, { module: M }>;

/** 모듈별 결정론적 계산의 단일 진입점입니다. 완료되지 않은 응답은 ScoringError로 거부됩니다. */
export function computeModuleResult(module: ModuleId, responses: readonly LikertResponse[]): ModuleResult {
  switch (module) {
    case "reaction": return { module, result: scoreQuestionnaire(responses), quality: responseQuality(responses, reactionInstrument) };
    case "defense": return { module, profile: analyzeDefenses(responses) };
    case "traits": return { module, profile: analyzeTraits(responses) };
    case "attachment": return { module, profile: analyzeAttachment(responses) };
  }
}

const mockInputs: Record<ModuleId, readonly LikertResponse[]> = {
  reaction: mockResponses,
  defense: defenseMockResponses,
  traits: traitMockResponses,
  attachment: attachmentMockResponses,
};

/** 고정 mock 응답도 같은 계산 함수만 거칩니다. */
export function computeExampleResult(module: ModuleId): ModuleResult {
  return computeModuleResult(module, mockInputs[module]);
}

/** 결과에 담긴 계산 근거(문항 ID·원응답)에서 응답 목록을 다시 만듭니다. */
export function moduleResponses(result: ModuleResult): LikertResponse[] {
  const scales = result.module === "reaction" ? result.result.dimensions : result.profile.result.scales;
  return scales.flatMap((scale) => scale.evidence.map((item) => ({ kind: "likert" as const, questionId: item.questionId, value: item.rawValue })));
}
