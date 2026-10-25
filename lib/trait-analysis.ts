import type { InstrumentResult, LikertInstrument, LikertResponse, ResponseQuality } from "../types/assessment";
import type { TraitId, TraitLeaning } from "../types/traits";
import { responseQuality } from "./interpretation";
import { scoreLikertInstrument } from "./likert-engine";

export const TRAIT_SCORING_VERSION = "ipip-v1";
/** 0–100에서 37 이하·63 이상을 한쪽으로 기운 범위로 봅니다. 그 사이는 양쪽을 오가는 범위입니다. */
export const LOW_LEANING_MAX = 37;
export const HIGH_LEANING_MIN = 63;

export interface TraitProfile {
  result: InstrumentResult<TraitId>;
  leanings: readonly { trait: TraitId; score: number; mean: number; leaning: TraitLeaning }[];
  quality: ResponseQuality;
}

export function traitLeaning(score: number): TraitLeaning {
  if (score <= LOW_LEANING_MAX) return "low";
  if (score >= HIGH_LEANING_MIN) return "high";
  return "mixed";
}

export function analyzeTraits(responses: readonly LikertResponse[], instrument: LikertInstrument<TraitId>): TraitProfile {
  const result = scoreLikertInstrument(instrument, responses, TRAIT_SCORING_VERSION);
  return {
    result,
    leanings: result.scales.map((scale) => ({ trait: scale.scale, score: scale.score, mean: scale.mean, leaning: traitLeaning(scale.score) })),
    quality: responseQuality(responses, instrument),
  };
}
