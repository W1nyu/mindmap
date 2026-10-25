import { dmrsLevels } from "../data/defense-levels";
import { defenseMeta } from "../data/defense-mechanisms";
import type { ScaleScore } from "../types/assessment";
import type { DefenseId, DmrsLevel } from "../types/defense";
import { largestRemainder } from "./interpretation";

export interface DmrsLevelScore {
  level: DmrsLevel;
  /** 이 검사지에서 묻는 수준인지 */
  measured: boolean;
  /** 속한 방어 점수의 평균(반올림). 묻지 않는 수준은 null */
  score: number | null;
  /** 모든 방어 점수 합 중 이 수준의 몫(합 100). 묻지 않거나 전체가 0이면 0 */
  share: number;
  defenses: readonly { defense: DefenseId; score: number }[];
}

export interface DmrsProfile {
  levels: readonly DmrsLevelScore[];
  /** ODF: 응답 비율로 가중한 평균 단계(1–7, 소수 둘째 자리). 모든 응답이 0이면 null */
  index: number | null;
}

/**
 * 순수 함수: DMRS-SR-30의 정량 채점(Di Giuseppe 외, 2020)과 같은 방식으로 단계별 몫과 ODF를 계산합니다.
 * 각 방어의 몫 = 그 방어 문항 응답 합 ÷ 모든 문항 응답 합, ODF(전반 방어 기능) = Σ(단계 × 단계의 몫) (1–7).
 * DSQ-40에도 같은 계산을 적용하지만, 그때는 원 척도에 없는 참고 지표입니다.
 */
export function dmrsProfile(scales: readonly ScaleScore<DefenseId>[]): DmrsProfile {
  const groups = dmrsLevels.map((meta) => scales.filter((scale) => defenseMeta(scale.scale).level === meta.level));
  const sums = groups.map((group) => group.reduce((sum, scale) => sum + scale.weightedSum, 0));
  const total = sums.reduce((sum, value) => sum + value, 0);
  const shares = total > 0 ? largestRemainder(sums) : sums.map(() => 0);
  const levels = dmrsLevels.map((meta, index) => ({
    level: meta.level,
    measured: groups[index].length > 0,
    score: groups[index].length ? Math.round(groups[index].reduce((sum, scale) => sum + scale.score, 0) / groups[index].length) : null,
    share: shares[index],
    defenses: groups[index].map((scale) => ({ defense: scale.scale, score: scale.score })),
  }));
  const index = total > 0 ? Math.round((dmrsLevels.reduce((sum, meta, at) => sum + meta.level * sums[at], 0) / total) * 100) / 100 : null;
  return { levels, index };
}
