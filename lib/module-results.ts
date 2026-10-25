import type { AttachmentId } from "../data/attachment";
import { dsq40Tiers } from "../data/defense-dsq";
import type { EmotionId } from "../data/emotion";
import { assessmentModules, type FormId, type ModuleId } from "../data/modules";
import type { LikertInstrument, LikertResponse } from "../types/assessment";
import type { DefenseId } from "../types/defense";
import type { TraitId } from "../types/traits";
import { analyzeAttachment, type AttachmentProfile } from "./attachment-analysis";
import { analyzeDefenses, tiersFromLevels, type DefenseProfile } from "./defense-analysis";
import { analyzeEmotion, type EmotionProfile } from "./emotion-analysis";
import { analyzeTraits, type TraitProfile } from "./trait-analysis";

export type ModuleResult =
  | { module: "emotion"; form: FormId; profile: EmotionProfile }
  | { module: "defense"; form: FormId; profile: DefenseProfile }
  | { module: "traits"; form: FormId; profile: TraitProfile }
  | { module: "attachment"; form: FormId; profile: AttachmentProfile };

export type ResultOf<M extends ModuleId> = Extract<ModuleResult, { module: M }>;

/** 모듈·검사지별 결정론적 계산의 단일 진입점입니다. 완료되지 않은 응답은 ScoringError로 거부됩니다. */
export function computeModuleResult(module: ModuleId, form: FormId, responses: readonly LikertResponse[]): ModuleResult {
  const instrument = assessmentModules[module].forms[form].instrument;
  switch (module) {
    case "emotion": return { module, form, profile: analyzeEmotion(responses, instrument as LikertInstrument<EmotionId>) };
    case "defense": {
      const defenses = instrument as LikertInstrument<DefenseId>;
      return { module, form, profile: analyzeDefenses(responses, defenses, form === "brief" ? dsq40Tiers : tiersFromLevels(defenses.scaleIds)) };
    }
    case "traits": return { module, form, profile: analyzeTraits(responses, instrument as LikertInstrument<TraitId>) };
    case "attachment": return { module, form, profile: analyzeAttachment(responses, instrument as LikertInstrument<AttachmentId>) };
  }
}

/**
 * 예시용 고정 응답: 척도마다 정한 목표 수준(0–1)에 문항 순서로 정해지는 작은 흔들림(±1)을 더합니다.
 * 같은 입력 → 같은 응답이며, 실제 사용자 응답이 아닙니다. 연결 해석이 두어 개 보이도록 목표를 정했습니다.
 */
const exampleTargets: Record<ModuleId, Record<string, number>> = {
  emotion: { impulse: 0.8, nonacceptance: 0.55, goals: 0.45, awareness: 0.3, strategies: 0.15, clarity: 0.4 },
  defense: { adaptive: 0.8, inhibitory: 0.5, immediate: 0.3 },
  traits: { openness: 0.7, conscientiousness: 0.6, extraversion: 0.35, agreeableness: 0.75, neuroticism: 0.65 },
  attachment: { attachmentAnxiety: 0.8, attachmentAvoidance: 0.3 },
};

export function exampleResponses(module: ModuleId, form: FormId = "brief"): LikertResponse[] {
  const instrument = assessmentModules[module].forms[form].instrument;
  const tiers = form === "brief" ? dsq40Tiers : tiersFromLevels(instrument.scaleIds as readonly DefenseId[]);
  const max = instrument.points - 1;
  let seed = 7;
  return instrument.items.map((item) => {
    seed = (seed * 48271) % 2147483647;
    const key = module === "defense" ? tiers[item.scale as DefenseId] ?? "inhibitory" : item.scale;
    const target = Math.round((exampleTargets[module][key] ?? 0.5) * max) + (seed % 3) - 1;
    const value = Math.min(max, Math.max(0, target));
    return { kind: "likert" as const, questionId: item.id, value: item.reverse ? max - value : value };
  });
}

/** 예시 결과도 같은 계산 함수만 거칩니다. 간편 검사 기준입니다. */
export function computeExampleResult(module: ModuleId): ModuleResult {
  return computeModuleResult(module, "brief", exampleResponses(module));
}
