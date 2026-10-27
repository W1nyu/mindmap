import { adviceSituations, adviceTips, defenseCare, type AdviceSituationId, type AdviceTip } from "../data/advice";
import { defenseMeta } from "../data/defense-mechanisms";
import { moduleIds, type ModuleId } from "../data/modules";
import { scaleName } from "./balance";
import { HIGHLIGHT_MIN_SCORE } from "./defense-analysis";
import { INTEGRATION_HIGH_MIN, INTEGRATION_LOW_MAX, scaleScores, type ModuleResults } from "./integration";

/** 상황마다 보여 줄 맞춤 조언의 최대 개수. 기본 조언은 그 뒤에 이어집니다. */
export const ADVICE_PERSONAL_LIMIT = 3;
/** 방어기제 탭에서 따로 짚어 줄 두드러진 방어의 최대 개수 */
export const ADVICE_DEFENSE_LIMIT = 2;

export interface AdviceItem {
  id: string;
  title: string;
  steps: readonly string[];
  basis: string;
  /** 점수 조건으로 고른 조언이면 true, 누구에게나 주는 기본 조언이면 false */
  personal: boolean;
  /** 고른 근거가 된 척도와 점수(예: “충동통제곤란 72”) */
  evidence: readonly string[];
}

export interface SituationAdvice {
  situation: AdviceSituationId;
  items: readonly AdviceItem[];
  /** 이 상황의 맞춤 조언에 쓰이지만 아직 마치지 않은 검사 */
  waiting: readonly ModuleId[];
}

/**
 * 순수 함수: 이미 계산된 척도 점수로 상황별 조언을 고릅니다. 새 점수를 만들지 않고,
 * 같은 결과에서는 항상 같은 목록이 나옵니다. 순서는 맞춤 조언(데이터 순서) → 기본 조언입니다.
 */
export function adviceFor(results: ModuleResults): SituationAdvice[] {
  const tables = new Map(moduleIds.flatMap((id) => (results[id] ? [[id, scaleScores(results[id]!)] as const] : [])));
  const matches = (tip: AdviceTip) => tip.when.length > 0 && tip.when.every(({ module, scale, level }) => {
    const score = tables.get(module)?.get(scale);
    return score !== undefined && (level === "high" ? score >= INTEGRATION_HIGH_MIN : score <= INTEGRATION_LOW_MAX);
  });
  const toItem = (tip: AdviceTip, personal: boolean): AdviceItem => ({
    id: tip.id, title: tip.title, steps: tip.steps, basis: tip.basis, personal,
    evidence: personal ? tip.when.map(({ module, scale }) => `${scaleName(module, scale)} ${tables.get(module)!.get(scale)}`) : [],
  });

  return adviceSituations.map(({ id }) => {
    const tips = adviceTips.filter((tip) => tip.situation === id);
    const personal = tips.filter(matches).map((tip) => toItem(tip, true));
    if (id === "defense") personal.push(...defenseItems(results));
    const waiting = moduleIds.filter((module) => !tables.has(module)
      && (tips.some((tip) => tip.when.some((condition) => condition.module === module)) || (id === "defense" && module === "defense")));
    return {
      situation: id,
      items: [...personal.slice(0, id === "defense" ? ADVICE_PERSONAL_LIMIT + ADVICE_DEFENSE_LIMIT : ADVICE_PERSONAL_LIMIT), ...tips.filter((tip) => tip.when.length === 0).map((tip) => toItem(tip, false))],
      waiting,
    };
  });
}

/**
 * 덜 적응적인 방어 가운데 두드러진 것(점수 ≥ 50, 높은 순, 같으면 검사 순서)마다 알아차리고 다루는 연습을 붙입니다.
 * 상위 세 방어가 모두 성숙한 방어여도 함께 쓰는 다른 방식을 짚어 주려고 전체 방어에서 고릅니다.
 */
function defenseItems(results: ModuleResults): AdviceItem[] {
  const defense = results.defense;
  if (defense?.module !== "defense") return [];
  const { result, tierOf } = defense.profile;
  return result.scales.map((scale, index) => ({ scale, index }))
    .filter(({ scale }) => scale.score >= HIGHLIGHT_MIN_SCORE && tierOf[scale.scale] !== "adaptive" && defenseCare[scale.scale])
    .sort((a, b) => b.scale.score - a.scale.score || a.index - b.index)
    .slice(0, ADVICE_DEFENSE_LIMIT)
    .map(({ scale: item }) => {
      const meta = defenseMeta(item.scale);
      return {
        id: `defense:${item.scale}`, title: `${meta.name} 다루기`, personal: true,
        steps: [`${meta.summary} ${meta.protects}`, ...defenseCare[item.scale]!],
        basis: "두드러진 방어 가운데 하나예요. 없애기보다 이 방식이 지켜 주는 것을 인정하면서 다른 선택지를 늘려 가요.",
        evidence: [`${meta.name} ${item.score}`],
      };
    });
}
