import { defenseMeta, defenseTiers } from "../data/defense-mechanisms";
import type { InstrumentResult, LikertInstrument, LikertResponse, ResponseQuality } from "../types/assessment";
import type { DefenseId, DefenseTierId } from "../types/defense";
import { largestRemainder, responseQuality } from "./interpretation";
import { scoreLikertInstrument } from "./likert-engine";

export const DEFENSE_SCORING_VERSION = "dsq-v1";
/** 두드러진 방어 후보의 최소 점수와 근접 동점 기준입니다. */
export const HIGHLIGHT_MIN_SCORE = 50;
export const NEAR_TIE_POINTS = 5;

export type DefenseTierMap = Partial<Record<DefenseId, DefenseTierId>>;

export interface DefenseTierScore {
  tier: DefenseTierId;
  score: number;
  /** 원 척도(1–9) 단위의 스타일 평균: 속한 방어 점수(두 문항 평균)의 평균 */
  mean: number;
  defenses: readonly DefenseId[];
}

export interface DefenseHighlight {
  defense: DefenseId;
  tier: DefenseTierId;
  score: number;
  mean: number;
  closeToPrevious: boolean;
}

export interface DefenseProfile {
  result: InstrumentResult<DefenseId>;
  tierOf: DefenseTierMap;
  tiers: readonly DefenseTierScore[];
  composition: readonly { tier: DefenseTierId; share: number }[] | null;
  highlights: readonly DefenseHighlight[];
  resources: readonly DefenseId[];
  quality: ResponseQuality;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/** DSQ-60처럼 요인 키가 따로 없을 때는 DMRS 단계로 세 스타일을 나눕니다(7 성숙 · 5–6 신경증적 · 1–4 미성숙). */
export function tiersFromLevels(ids: readonly DefenseId[]): DefenseTierMap {
  return Object.fromEntries(ids.map((id) => {
    const level = defenseMeta(id).level;
    return [id, level === 7 ? "adaptive" : level >= 5 ? "inhibitory" : "immediate"];
  }));
}

/** 순수 함수: 방어 점수 → 스타일 점수, 상대 구성비, 두드러진 방어, 가진 자원. */
export function analyzeDefenses(responses: readonly LikertResponse[], instrument: LikertInstrument<DefenseId>, tierOf: DefenseTierMap): DefenseProfile {
  const result = scoreLikertInstrument(instrument, responses, DEFENSE_SCORING_VERSION);
  const tiers = defenseTiers.map(({ id }) => {
    const scales = result.scales.filter((scale) => tierOf[scale.scale] === id);
    const score = scales.length ? Math.round(scales.reduce((sum, scale) => sum + scale.score, 0) / scales.length) : 0;
    const mean = scales.length ? round2(scales.reduce((sum, scale) => sum + scale.mean, 0) / scales.length) : 0;
    return { tier: id, score, mean, defenses: scales.map((scale) => scale.scale) };
  });
  const total = tiers.reduce((sum, tier) => sum + tier.score, 0);
  const composition = total > 0 ? (() => {
    const shares = largestRemainder(tiers.map((tier) => tier.score));
    return tiers.map((tier, index) => ({ tier: tier.tier, share: shares[index] }));
  })() : null;

  const candidates = result.scales.filter((scale) => scale.score >= HIGHLIGHT_MIN_SCORE)
    .map((scale, index) => ({ scale, index }))
    .sort((a, b) => b.scale.score - a.scale.score || a.index - b.index)
    .map(({ scale }) => scale);
  const highlights = candidates.slice(0, 3).map((scale, index, list) => ({
    defense: scale.scale, tier: tierOf[scale.scale]!, score: scale.score, mean: scale.mean,
    closeToPrevious: index > 0 && list[index - 1].score - scale.score <= NEAR_TIE_POINTS,
  }));
  const resources = candidates.filter((scale) => tierOf[scale.scale] === "adaptive").slice(0, 3).map((scale) => scale.scale);

  return { result, tierOf, tiers, composition, highlights, resources, quality: responseQuality(responses, instrument) };
}
