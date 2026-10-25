import { balanceZones, defenseMechanisms, defenseTiers } from "../data/defense-mechanisms";
import { defenseInstrument } from "../data/defense-questions";
import type { InstrumentResult, LikertInstrument, LikertResponse, ResponseQuality } from "../types/assessment";
import type { DefenseId, DefenseTierId } from "../types/defense";
import { largestRemainder, responseQuality } from "./interpretation";
import { scoreLikertInstrument } from "./likert-engine";

export const DEFENSE_SCORING_VERSION = "defense-profile-v1";
/** 두드러진 방어 후보의 최소 점수(평균 응답 2 이상)와 근접 동점 기준입니다. */
export const HIGHLIGHT_MIN_SCORE = 50;
export const NEAR_TIE_POINTS = 5;

export interface DefenseTierScore {
  tier: DefenseTierId;
  score: number;
  /** 반올림 전 0–1 평균. 무게중심과 구성비 계산에만 사용합니다. */
  mean: number;
  defenses: readonly DefenseId[];
}

export interface DefenseBalance {
  /** (3A + 2I + 1M) / (A + I + M), 소수 둘째 자리 */
  value: number;
  /** 1–3을 0–100으로 옮긴 정수 위치 */
  position: number;
}

export interface RelativeDefense {
  defense: DefenseId;
  score: number;
  deviation: number;
}

export interface DefenseHighlight {
  defense: DefenseId;
  tier: DefenseTierId;
  score: number;
  closeToPrevious: boolean;
}

export interface DefenseProfile {
  result: InstrumentResult<DefenseId>;
  tiers: readonly DefenseTierScore[];
  composition: readonly { tier: DefenseTierId; share: number }[] | null;
  balance: DefenseBalance | null;
  personalMean: number;
  relative: readonly RelativeDefense[];
  highlights: readonly DefenseHighlight[];
  similarBeyondHighlights: number;
  resources: readonly DefenseId[];
  quality: ResponseQuality;
}

const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits;
const tierOf = new Map<DefenseId, DefenseTierId>(defenseMechanisms.map((item) => [item.id, item.tier]));

/** 순수 함수: 방어기제 점수 → 수준 점수, 무게중심, 구성비, 개인 평균 대비, 두드러진 방어. */
export function analyzeDefenses(
  responses: readonly LikertResponse[],
  instrument: LikertInstrument<DefenseId> = defenseInstrument,
): DefenseProfile {
  const result = scoreLikertInstrument(instrument, responses, DEFENSE_SCORING_VERSION);

  const tiers = defenseTiers.map(({ id }) => {
    const scales = result.scales.filter((scale) => tierOf.get(scale.scale) === id);
    const weightedSum = scales.reduce((sum, scale) => sum + scale.weightedSum, 0);
    const weightSum = scales.reduce((sum, scale) => sum + scale.weightSum, 0);
    const mean = weightSum > 0 ? weightedSum / weightSum / 4 : 0;
    return { tier: id, score: Math.round(mean * 100), mean, defenses: scales.map((scale) => scale.scale) };
  });

  const totalMean = tiers.reduce((sum, tier) => sum + tier.mean, 0);
  const levelOf = new Map(defenseTiers.map((tier) => [tier.id, tier.level]));
  let balance: DefenseBalance | null = null;
  let composition: DefenseProfile["composition"] = null;
  if (totalMean > 0) {
    const value = tiers.reduce((sum, tier) => sum + levelOf.get(tier.tier)! * tier.mean, 0) / totalMean;
    balance = { value: round(value, 2), position: Math.round(((value - 1) / 2) * 100) };
    const shares = largestRemainder(tiers.map((tier) => tier.mean));
    composition = tiers.map((tier, index) => ({ tier: tier.tier, share: shares[index] }));
  }

  const mean = result.scales.reduce((sum, scale) => sum + scale.score, 0) / result.scales.length;
  const relative = result.scales.map((scale) => ({ defense: scale.scale, score: scale.score, deviation: round(scale.score - mean, 1) }));

  const candidates = result.scales.filter((scale) => scale.score >= HIGHLIGHT_MIN_SCORE)
    .map((scale, index) => ({ scale, index }))
    .sort((a, b) => b.scale.score - a.scale.score || a.index - b.index)
    .map(({ scale }) => scale);
  const highlights = candidates.slice(0, 3).map((scale, index, list) => ({
    defense: scale.scale, tier: tierOf.get(scale.scale)!, score: scale.score,
    closeToPrevious: index > 0 && list[index - 1].score - scale.score <= NEAR_TIE_POINTS,
  }));
  const last = highlights[highlights.length - 1];
  const similarBeyondHighlights = highlights.length === 3
    ? candidates.slice(3).filter((scale) => last.score - scale.score <= NEAR_TIE_POINTS).length : 0;
  const resources = candidates.filter((scale) => tierOf.get(scale.scale) === "adaptive").slice(0, 3).map((scale) => scale.scale);

  return {
    result, tiers, composition, balance, personalMean: round(mean, 1), relative,
    highlights, similarBeyondHighlights, resources, quality: responseQuality(responses, instrument),
  };
}

/** 위치(0–100)가 속한 무게중심 구간. 구간 경계는 25·50·75입니다. */
export function balanceZone(position: number) {
  return [...balanceZones].reverse().find((zone) => position >= zone.min) ?? balanceZones[0];
}
