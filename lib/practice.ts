import { practices, type Practice } from "../data/practices";
import type { ModuleId } from "../data/modules";
import { INTEGRATION_HIGH_MIN, INTEGRATION_LOW_MAX, scaleScores, type ModuleResults } from "./integration";

export interface PracticeRecommendation {
  practice: Practice;
  reasons: readonly { module: ModuleId; scale: string; score: number; level: "high" | "low" }[];
}

/** 순수 함수: 완료한 모듈의 점수가 트리거를 만족한 연습만 근거와 함께 반환합니다. 근거 수 내림차순, 동률은 데이터 순서. */
export function recommendPractices(results: ModuleResults, catalog: readonly Practice[] = practices): PracticeRecommendation[] {
  const tables = new Map<ModuleId, ReadonlyMap<string, number>>();
  for (const [id, result] of Object.entries(results) as [ModuleId, NonNullable<ModuleResults[ModuleId]>][]) tables.set(id, scaleScores(result));
  return catalog.map((practice, index) => {
    const reasons = practice.triggers.flatMap((trigger) => {
      const score = tables.get(trigger.module)?.get(trigger.scale);
      if (score === undefined) return [];
      const holds = trigger.level === "high" ? score >= INTEGRATION_HIGH_MIN : score <= INTEGRATION_LOW_MAX;
      return holds ? [{ module: trigger.module, scale: trigger.scale, score, level: trigger.level }] : [];
    });
    return { practice, reasons, index };
  }).filter((item) => item.reasons.length > 0)
    .sort((a, b) => b.reasons.length - a.reasons.length || a.index - b.index)
    .map(({ practice, reasons }) => ({ practice, reasons }));
}

/** 연습 ID → 마지막으로 해 본 날짜(YYYY-MM-DD). */
export type PracticeLog = Readonly<Record<string, string>>;
export const PRACTICE_LOG_KEY = "selfmap.practice.v1";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validatePracticeLog(value: unknown): PracticeLog | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const known = new Set(practices.map((item) => item.id));
  return Object.fromEntries(Object.entries(value).filter(([id, date]) => known.has(id) && typeof date === "string" && DATE_PATTERN.test(date)));
}

export function parsePracticeLog(raw: string): PracticeLog | null {
  try {
    return validatePracticeLog(JSON.parse(raw));
  } catch {
    return null;
  }
}
