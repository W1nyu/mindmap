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

/** 예시용 고정 응답: 문항 순서로 정해지는 의사난수(같은 입력 → 같은 응답). 실제 사용자 응답이 아닙니다. */
export function exampleResponses(instrument: LikertInstrument): LikertResponse[] {
  let seed = 7;
  return instrument.items.map((item) => {
    seed = (seed * 48271) % 2147483647;
    const spread = Math.max(1, Math.round((instrument.points - 1) / 2));
    const base = Math.round((instrument.points - 1) / 2);
    const value = Math.min(instrument.points - 1, Math.max(0, base + (seed % (spread * 2 + 1)) - spread));
    return { kind: "likert" as const, questionId: item.id, value };
  });
}

/** 예시 결과도 같은 계산 함수만 거칩니다. 간편 검사 기준입니다. */
export function computeExampleResult(module: ModuleId): ModuleResult {
  return computeModuleResult(module, "brief", exampleResponses(assessmentModules[module].forms.brief.instrument));
}
