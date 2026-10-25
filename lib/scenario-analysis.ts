import { defenseMechanisms, defenseTiers } from "../data/defense-mechanisms";
import { SCENARIO_VERSION, scenarios, type Scenario } from "../data/scenarios";
import type { DefenseId, DefenseTierId } from "../types/defense";
import { largestRemainder } from "./interpretation";

export const SCENARIO_SCORING_VERSION = "scenario-choices-v1";

/** 상황 ID → 고른 선택지 ID */
export type ScenarioChoices = Readonly<Record<string, string>>;

export interface ScenarioSession {
  version: string;
  choices: ScenarioChoices;
  currentIndex: number;
  completed: boolean;
}

export interface ScenarioProfile {
  version: string;
  scoringVersion: string;
  total: number;
  tiers: readonly { tier: DefenseTierId; count: number; share: number }[];
  /** 두 번 이상 고른 방어(동률은 데이터 순서) */
  repeated: readonly { defense: DefenseId; count: number }[];
  /** 방어 대신 문제를 직접 다루는 선택 수 */
  direct: number;
  choices: readonly { scenario: string; option: string; defense: DefenseId | null; tier: DefenseTierId }[];
}

const tierOf = new Map<DefenseId, DefenseTierId>(defenseMechanisms.map((item) => [item.id, item.tier]));

export function createScenarioSession(): ScenarioSession {
  return { version: SCENARIO_VERSION, choices: {}, currentIndex: 0, completed: false };
}

/** 저장된 세션을 다시 검증합니다. 버전·상황 ID·선택지 ID·진행 위치·완료 상태가 맞지 않으면 null. */
export function parseScenarioSession(raw: string, set: readonly Scenario[] = scenarios): ScenarioSession | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const session = value as Record<string, unknown>;
    if (session.version !== SCENARIO_VERSION || typeof session.completed !== "boolean" || !Number.isInteger(session.currentIndex) ||
      (session.currentIndex as number) < 0 || (session.currentIndex as number) >= set.length ||
      !session.choices || typeof session.choices !== "object" || Array.isArray(session.choices)) return null;
    const entries = Object.entries(session.choices as Record<string, unknown>);
    for (const [scenarioId, optionId] of entries) {
      const scenario = set.find((item) => item.id === scenarioId);
      if (!scenario || typeof optionId !== "string" || !scenario.options.some((option) => option.id === optionId)) return null;
    }
    if (session.completed && entries.length !== set.length) return null;
    return { version: SCENARIO_VERSION, choices: Object.fromEntries(entries) as ScenarioChoices, currentIndex: session.currentIndex as number, completed: session.completed };
  } catch {
    return null;
  }
}

/** 순수 함수: 모든 상황에 하나씩 고른 선택을 수준별 개수·비율, 반복된 방어로 요약합니다. */
export function analyzeScenarios(choices: ScenarioChoices, set: readonly Scenario[] = scenarios): ScenarioProfile {
  if (Object.keys(choices).length !== set.length) throw new Error("모든 상황에 하나씩 골라야 합니다.");
  const picked = set.map((scenario) => {
    const option = scenario.options.find((item) => item.id === choices[scenario.id]);
    if (!option) throw new Error("알 수 없는 선택지가 있습니다.");
    return { scenario: scenario.id, option: option.id, defense: option.defense, tier: option.defense ? tierOf.get(option.defense)! : "adaptive" as const };
  });
  const total = picked.length;
  const counts = defenseTiers.map(({ id }) => picked.filter((item) => item.tier === id).length);
  const shares = largestRemainder(counts);
  const tiers = defenseTiers.map(({ id }, index) => ({ tier: id, count: counts[index], share: shares[index] }));
  const perDefense = new Map<DefenseId, number>();
  for (const item of picked) if (item.defense) perDefense.set(item.defense, (perDefense.get(item.defense) ?? 0) + 1);
  const repeated = defenseMechanisms.map((item, index) => ({ defense: item.id, count: perDefense.get(item.id) ?? 0, index }))
    .filter((item) => item.count >= 2).sort((a, b) => b.count - a.count || a.index - b.index)
    .map(({ defense, count }) => ({ defense, count }));
  return { version: SCENARIO_VERSION, scoringVersion: SCENARIO_SCORING_VERSION, total, tiers, repeated, direct: picked.filter((item) => item.defense === null).length, choices: picked };
}
