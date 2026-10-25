import type { EmotionId } from "../data/emotion";
import type { InstrumentResult, LikertInstrument, LikertResponse, ResponseQuality } from "../types/assessment";
import { responseQuality } from "./interpretation";
import { scoreLikertInstrument } from "./likert-engine";

export const EMOTION_SCORING_VERSION = "ders-v1";

export interface EmotionProfile {
  result: InstrumentResult<EmotionId>;
  /** DERS 총점(원 척도 합: 문항 수 ~ 문항 수 × 5)과 그 범위, 0–100 위치 */
  total: { sum: number; min: number; max: number; score: number };
  quality: ResponseQuality;
}

/** 순수 함수: 하위척도 점수와 DERS 총점. 점수가 높을수록 조절이 어렵다는 뜻입니다. */
export function analyzeEmotion(responses: readonly LikertResponse[], instrument: LikertInstrument<EmotionId>): EmotionProfile {
  const result = scoreLikertInstrument(instrument, responses, EMOTION_SCORING_VERSION);
  const items = instrument.items.length;
  const sum = result.scales.reduce((total, scale) => total + scale.evidence.reduce((acc, item) => acc + item.scoredValue + 1, 0), 0);
  const min = items;
  const max = items * instrument.points;
  return { result, total: { sum, min, max, score: Math.round(((sum - min) / (max - min)) * 100) }, quality: responseQuality(responses, instrument) };
}
