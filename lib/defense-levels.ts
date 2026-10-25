import { dmrsLevels, type DmrsLevelMeta } from "../data/defense-levels";
import type { ScaleScore } from "../types/assessment";
import type { DefenseId } from "../types/defense";
import { largestRemainder } from "./interpretation";

export interface DmrsLevelScore {
  level: DmrsLevelMeta["level"];
  /** 이 설문에서 묻는 수준인지 */
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
  const scoreOf = new Map(scales.map((scale) => [scale.scale, scale.score]));
  const sums = dmrsLevels.map((meta) => meta.defenses.reduce((sum, id) => sum + (scoreOf.get(id) ?? 0), 0));
  const total = sums.reduce((sum, value) => sum + value, 0);
  const shares = total > 0 ? largestRemainder(sums) : sums.map(() => 0);
  const levels = dmrsLevels.map((meta, index) => {
    const defenses = meta.defenses.map((id) => ({ defense: id, score: scoreOf.get(id) ?? 0 }));
    return {
      level: meta.level,
      measured: defenses.length > 0,
      score: defenses.length ? Math.round(sums[index] / defenses.length) : null,
      share: shares[index],
      defenses,
    };
  });
  const index = total > 0 ? Math.round((dmrsLevels.reduce((sum, meta, at) => sum + meta.level * sums[at], 0) / total) * 100) / 100 : null;
  return { levels, index };
}
