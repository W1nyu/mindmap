import { traitFacets } from "../data/traits";
import type { InstrumentResult, LikertInstrument, LikertResponse, ResponseQuality } from "../types/assessment";
import type { TraitId, TraitLeaning } from "../types/traits";
import { responseQuality } from "./interpretation";
import { scoreLikertInstrument } from "./likert-engine";

export const TRAIT_SCORING_VERSION = "bfi2-v1";
/** 0–100에서 37 이하·63 이상을 한쪽으로 기운 범위로 봅니다. 그 사이는 양쪽을 오가는 범위입니다. */
export const LOW_LEANING_MAX = 37;
export const HIGH_LEANING_MIN = 63;

export interface TraitProfile {
  result: InstrumentResult<TraitId>;
  leanings: readonly { trait: TraitId; score: number; mean: number; leaning: TraitLeaning }[];
  /** BFI-2 전체판(60문항)에서만 계산하는 15개 하위 측면. 단축형은 측면당 2문항이라 개인 해석에 권장되지 않아 비웁니다. */
  facets: readonly TraitFacetScore[];
  quality: ResponseQuality;
}

export interface TraitFacetScore {
  id: string;
  domain: TraitId;
  name: string;
  mean: number;
  score: number;
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
    facets: instrument.id === "bfi2" ? facetScores(instrument, result) : [],
    quality: responseQuality(responses, instrument),
  };
}

/** 하위 측면 점수: 해당 문항(역채점 반영)의 평균. 영역 점수와 같은 방식입니다. */
function facetScores(instrument: LikertInstrument<TraitId>, result: InstrumentResult<TraitId>): TraitFacetScore[] {
  const scored = new Map(result.scales.flatMap((scale) => scale.evidence.map((item) => [item.questionId, item.scoredValue] as const)));
  const max = instrument.points - 1;
  return traitFacets.map((facet) => {
    const values = facet.items.map((n) => scored.get(instrument.items[n - 1].id)!);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return { id: facet.id, domain: facet.domain, name: facet.name, mean: Math.round((average + 1) * 100) / 100, score: Math.round((average / max) * 100) };
  });
}
