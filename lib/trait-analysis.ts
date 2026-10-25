import { traitInstrument } from "../data/traits";
import type { InstrumentResult, LikertInstrument, LikertResponse, ResponseQuality } from "../types/assessment";
import type { TraitId, TraitLeaning } from "../types/traits";
import { responseQuality } from "./interpretation";
import { scoreLikertInstrument } from "./likert-engine";

export const TRAIT_SCORING_VERSION = "trait-profile-v1";
/** 평균 응답 1.5 미만/2.5 초과에 해당하는 경계. 그 사이는 양쪽을 오가는 범위로 봅니다. */
export const LOW_LEANING_MAX = 37;
export const HIGH_LEANING_MIN = 63;

export interface TraitProfile {
  result: InstrumentResult<TraitId>;
  leanings: readonly { trait: TraitId; score: number; leaning: TraitLeaning }[];
  quality: ResponseQuality;
}

export function traitLeaning(score: number): TraitLeaning {
  if (score <= LOW_LEANING_MAX) return "low";
  if (score >= HIGH_LEANING_MIN) return "high";
  return "mixed";
}

export function analyzeTraits(responses: readonly LikertResponse[], instrument: LikertInstrument<TraitId> = traitInstrument): TraitProfile {
  const result = scoreLikertInstrument(instrument, responses, TRAIT_SCORING_VERSION);
  return {
    result,
    leanings: result.scales.map((scale) => ({ trait: scale.scale, score: scale.score, leaning: traitLeaning(scale.score) })),
    quality: responseQuality(responses, instrument),
  };
}
