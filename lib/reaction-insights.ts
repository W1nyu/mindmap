import { interactionRules, reactionFlows, recoveryTexts, type FlowDimension, type InteractionRule } from "../data/reaction-insights";
import type { DimensionId, ScoringResult } from "../types/psychology";

export const REACTION_INSIGHT_VERSION = "reaction-rules-v1";
export const HIGH_MIN = 63;
export const LOW_MAX = 37;
export const FEATURE_MIN = 50;
export const FEATURE_NEAR_TIE = 5;

export interface ReactionFeature {
  dimension: DimensionId;
  score: number;
  closeToPrevious: boolean;
}

export interface MatchedRule {
  rule: InteractionRule;
  evidence: readonly { dimension: DimensionId; score: number }[];
}

export interface ReactionInsights {
  version: string;
  features: readonly ReactionFeature[];
  rules: readonly MatchedRule[];
  flow: { dimension: FlowDimension; score: number; steps: (typeof reactionFlows)[FlowDimension] } | null;
  recovery: { score: number; level: keyof typeof recoveryTexts; text: string };
}

const flowDimensions = Object.keys(reactionFlows) as FlowDimension[];

/** 순수 함수: 점수 → 상위 특징(근접 동점 표시), 상호작용 규칙, 대표 반응 흐름. 점수를 바꾸지 않습니다. */
export function reactionInsights(result: ScoringResult): ReactionInsights {
  const scoreOf = new Map(result.dimensions.map((item) => [item.dimension, item.score]));
  const ranked = result.dimensions.map((item, index) => ({ item, index }))
    .filter(({ item }) => item.score >= FEATURE_MIN)
    .sort((a, b) => b.item.score - a.item.score || a.index - b.index)
    .slice(0, 3)
    .map(({ item }) => item);
  const features = ranked.map((item, index) => ({
    dimension: item.dimension, score: item.score,
    closeToPrevious: index > 0 && ranked[index - 1].score - item.score <= FEATURE_NEAR_TIE,
  }));

  const rules = interactionRules.filter((rule) => rule.when.every(({ dimension, level }) => {
    const score = scoreOf.get(dimension)!;
    return level === "high" ? score >= HIGH_MIN : score <= LOW_MAX;
  })).map((rule) => ({ rule, evidence: rule.when.map(({ dimension }) => ({ dimension, score: scoreOf.get(dimension)! })) }));

  const topFlow = flowDimensions.map((dimension, index) => ({ dimension, score: scoreOf.get(dimension)!, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0];
  const flow = topFlow.score >= FEATURE_MIN ? { dimension: topFlow.dimension, score: topFlow.score, steps: reactionFlows[topFlow.dimension] } : null;

  const recoveryScore = scoreOf.get("perspectiveRecovery")!;
  const level = recoveryScore >= HIGH_MIN ? "high" : recoveryScore <= LOW_MAX ? "low" : "mixed";
  return { version: REACTION_INSIGHT_VERSION, features, rules, flow, recovery: { score: recoveryScore, level, text: recoveryTexts[level] } };
}
