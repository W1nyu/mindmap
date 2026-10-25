import { integrationRules, type IntegrationRule } from "../data/integration-rules";
import { moduleIds, type ModuleId } from "../data/modules";
import type { ModuleResult } from "./module-results";

export const INTEGRATION_VERSION = "integration-rules-v2";
export const INTEGRATION_HIGH_MIN = 63;
export const INTEGRATION_LOW_MAX = 37;

export type ModuleResults = Partial<Record<ModuleId, ModuleResult>>;

export interface IntegratedInsight {
  rule: IntegrationRule;
  evidence: readonly { module: ModuleId; scale: string; score: number }[];
}

/** 모듈 결과에서 척도 ID → 점수 표를 만듭니다. 방어기제는 스타일 점수도 함께 넣습니다. */
export function scaleScores(result: ModuleResult): ReadonlyMap<string, number> {
  const scales: (readonly [string, number])[] = result.profile.result.scales.map((item) => [item.scale, item.score] as const);
  if (result.module === "defense") scales.push(...result.profile.tiers.map((tier) => [tier.tier, tier.score] as const));
  return new Map(scales);
}

/** 순수 함수: 관련 모듈을 모두 마친 규칙만 평가합니다. 규칙 순서는 데이터 순서를 따릅니다. */
export function integratedInsights(results: ModuleResults): { matched: readonly IntegratedInsight[]; evaluated: number; waiting: number } {
  const tables = new Map(moduleIds.flatMap((id) => (results[id] ? [[id, scaleScores(results[id]!)] as const] : [])));
  let evaluated = 0;
  let waiting = 0;
  const matched: IntegratedInsight[] = [];
  for (const rule of integrationRules) {
    if (rule.when.some((condition) => !tables.has(condition.module))) {
      waiting += 1;
      continue;
    }
    evaluated += 1;
    const evidence = rule.when.map(({ module, scale }) => ({ module, scale, score: tables.get(module)!.get(scale)! }));
    const holds = rule.when.every((condition, index) => condition.level === "high"
      ? evidence[index].score >= INTEGRATION_HIGH_MIN : evidence[index].score <= INTEGRATION_LOW_MAX);
    if (holds) matched.push({ rule, evidence });
  }
  return { matched, evaluated, waiting };
}
