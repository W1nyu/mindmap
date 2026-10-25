import { attachmentCombos, attachmentInstrument, type AttachmentId } from "../data/attachment";
import type { InstrumentResult, LikertInstrument, LikertResponse, ResponseQuality } from "../types/assessment";
import type { TraitLeaning } from "../types/traits";
import { responseQuality } from "./interpretation";
import { scoreLikertInstrument } from "./likert-engine";
import { traitLeaning } from "./trait-analysis";

export const ATTACHMENT_SCORING_VERSION = "attachment-profile-v1";

export interface AttachmentProfile {
  result: InstrumentResult<AttachmentId>;
  anxiety: { score: number; leaning: TraitLeaning };
  avoidance: { score: number; leaning: TraitLeaning };
  /** 두 차원이 모두 한쪽으로 기울었을 때만 있는 결합 설명 */
  combined: string | null;
  quality: ResponseQuality;
}

/** 순수 함수: 두 차원 점수와 기울기(≤37 / 38–62 / ≥63). 유형으로 분류하지 않습니다. */
export function analyzeAttachment(responses: readonly LikertResponse[], instrument: LikertInstrument<AttachmentId> = attachmentInstrument): AttachmentProfile {
  const result = scoreLikertInstrument(instrument, responses, ATTACHMENT_SCORING_VERSION);
  const score = (id: AttachmentId) => result.scales.find((scale) => scale.scale === id)!.score;
  const anxiety = { score: score("attachmentAnxiety"), leaning: traitLeaning(score("attachmentAnxiety")) };
  const avoidance = { score: score("attachmentAvoidance"), leaning: traitLeaning(score("attachmentAvoidance")) };
  const combined = anxiety.leaning !== "mixed" && avoidance.leaning !== "mixed" ? attachmentCombos[`${anxiety.leaning}-${avoidance.leaning}`] ?? null : null;
  return { result, anxiety, avoidance, combined, quality: responseQuality(responses, instrument) };
}
