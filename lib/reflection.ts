import { reflectionPrompts, type ReflectionPrompt } from "../data/reflection-prompts";
import type { ModuleId } from "../data/modules";
import { INTEGRATION_HIGH_MIN, INTEGRATION_LOW_MAX, scaleScores, type ModuleResults } from "./integration";

export interface PickedReflection {
  prompt: ReflectionPrompt;
  personalized: boolean;
  reasons: readonly { module: ModuleId; scale: string; score: number }[];
  poolSize: number;
}

/**
 * 순수 함수: 결과와 연결된 질문이 있으면 그중에서, 없으면 일반 질문에서 step 번째를 고릅니다.
 * step은 화면에서 날짜(일 수)와 ‘다른 질문’ 클릭 수로 만들어 하루 동안 같은 질문이 유지됩니다.
 */
export function pickReflection(results: ModuleResults, step: number, catalog: readonly ReflectionPrompt[] = reflectionPrompts): PickedReflection {
  const tables = new Map<ModuleId, ReadonlyMap<string, number>>();
  for (const [id, result] of Object.entries(results) as [ModuleId, NonNullable<ModuleResults[ModuleId]>][]) tables.set(id, scaleScores(result));
  const matched = catalog.flatMap((prompt) => {
    const reasons = prompt.triggers.flatMap((trigger) => {
      const score = tables.get(trigger.module)?.get(trigger.scale);
      if (score === undefined) return [];
      return (trigger.level === "high" ? score >= INTEGRATION_HIGH_MIN : score <= INTEGRATION_LOW_MAX) ? [{ module: trigger.module, scale: trigger.scale, score }] : [];
    });
    return reasons.length > 0 ? [{ prompt, reasons }] : [];
  });
  const personalized = matched.length > 0;
  const pool = personalized ? matched : catalog.filter((prompt) => prompt.triggers.length === 0).map((prompt) => ({ prompt, reasons: [] }));
  const index = ((Math.trunc(step) % pool.length) + pool.length) % pool.length;
  return { ...pool[index], personalized, poolSize: pool.length };
}

/** 로컬 날짜 기준 1970-01-01 이후 일 수. 하루 동안 같은 질문을 유지하는 데 씁니다. */
export function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}
