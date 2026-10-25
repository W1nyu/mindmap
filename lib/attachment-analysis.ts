import type { AttachmentId } from "../data/attachment";
import type { InstrumentResult, LikertInstrument, LikertResponse, ResponseQuality } from "../types/assessment";
import { responseQuality } from "./interpretation";
import { scoreLikertInstrument } from "./likert-engine";

export const ATTACHMENT_SCORING_VERSION = "ecr-v1";

export interface AttachmentAxis {
  /** 0–100 */
  score: number;
  /** 원 척도(1–7) 평균 */
  mean: number;
}

export interface AttachmentProfile {
  result: InstrumentResult<AttachmentId>;
  anxiety: AttachmentAxis;
  avoidance: AttachmentAxis;
  quality: ResponseQuality;
}

/** 순수 함수: 관계 불안·친밀 회피 두 차원의 점수와 원 척도 평균. */
export function analyzeAttachment(responses: readonly LikertResponse[], instrument: LikertInstrument<AttachmentId>): AttachmentProfile {
  const result = scoreLikertInstrument(instrument, responses, ATTACHMENT_SCORING_VERSION);
  const axis = (id: AttachmentId) => {
    const scale = result.scales.find((item) => item.scale === id)!;
    return { score: scale.score, mean: scale.mean };
  };
  return { result, anxiety: axis("attachmentAnxiety"), avoidance: axis("attachmentAvoidance"), quality: responseQuality(responses, instrument) };
}
