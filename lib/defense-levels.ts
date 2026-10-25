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
  /** 점수 가중 평균 수준(1–7, 소수 둘째 자리). 모든 점수가 0이면 null */
  index: number | null;
}

/**
 * 순수 함수: 방어 점수를 DMRS 7단계에 놓고 수준별 평균·몫과 점수 가중 평균 수준을 계산합니다.
 * 가중 평균 = Σ(수준 × 방어 점수) ÷ Σ방어 점수. ODF의 ‘수준 × 비율’ 구조를 자기보고 점수에 옮긴 참고 지표예요.
 */
export function dmrsProfile(scales: readonly ScaleScore<DefenseId>[]): DmrsProfile {
  const groups = dmrsLevels.map((meta) => scales.filter((scale) => defenseMeta(scale.scale).level === meta.level));
  const sums = groups.map((group) => group.reduce((sum, scale) => sum + scale.score, 0));
  const total = sums.reduce((sum, value) => sum + value, 0);
  const shares = total > 0 ? largestRemainder(sums) : sums.map(() => 0);
  const levels = dmrsLevels.map((meta, index) => ({
    level: meta.level,
    measured: groups[index].length > 0,
    score: groups[index].length ? Math.round(sums[index] / groups[index].length) : null,
    share: shares[index],
    defenses: groups[index].map((scale) => ({ defense: scale.scale, score: scale.score })),
  }));
  const index = total > 0 ? Math.round((dmrsLevels.reduce((sum, meta, at) => sum + meta.level * sums[at], 0) / total) * 100) / 100 : null;
  return { levels, index };
}
