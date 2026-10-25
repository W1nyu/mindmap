import { WELLBEING_VERSION, wellbeingBands, wellbeingItems, type WellbeingBandId, type WellbeingItemId, type WellbeingValue } from "../data/wellbeing";

export const WELLBEING_STORAGE_KEY = "selfmap.wellbeing.v1";
/** Topp 외(2015): 10점(원점수 2.5) 이상의 차이를 의미 있는 변화로 봅니다. */
export const MEANINGFUL_CHANGE = 10;
/** 한 문항이라도 0–1(‘전혀’·‘가끔’)이면 그 영역을 따로 살펴보도록 안내합니다. */
export const LOW_ITEM_MAX = 1;
export const WELLBEING_MAX_CHECKS = 200;

export interface WellbeingCheck {
  id: string;
  takenAt: string;
  version: string;
  /** wellbeingItems 순서대로 0–5 */
  answers: readonly WellbeingValue[];
}

export interface WellbeingScore {
  raw: number;
  score: number;
  band: WellbeingBandId;
  lowItems: readonly WellbeingItemId[];
}

export interface WellbeingPoint extends WellbeingScore {
  id: string;
  takenAt: string;
  answers: readonly WellbeingValue[];
  /** 바로 앞 체크와의 차이. 첫 체크는 null */
  change: number | null;
  meaningful: boolean;
}

const isValue = (value: unknown): value is WellbeingValue => Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 5;

export function wellbeingBand(score: number): WellbeingBandId {
  return wellbeingBands.find((band) => score <= band.max)!.id;
}

/** 순수 함수: 원점수 합 × 4 = 0–100. 다섯 문항이 모두 있어야 계산합니다. */
export function scoreWellbeing(answers: readonly number[]): WellbeingScore {
  if (answers.length !== wellbeingItems.length || !answers.every(isValue)) {
    throw new Error("다섯 문항 모두 0–5 사이로 답해야 계산할 수 있습니다.");
  }
  const raw = answers.reduce<number>((sum, value) => sum + value, 0);
  const score = raw * 4;
  return { raw, score, band: wellbeingBand(score), lowItems: wellbeingItems.filter((_, index) => answers[index] <= LOW_ITEM_MAX).map((item) => item.id) };
}

export function validateCheck(value: unknown): WellbeingCheck | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (typeof data.id !== "string" || !data.id || data.id.length > 80) return null;
  if (typeof data.takenAt !== "string" || Number.isNaN(Date.parse(data.takenAt))) return null;
  if (typeof data.version !== "string" || data.version !== WELLBEING_VERSION) return null;
  if (!Array.isArray(data.answers) || data.answers.length !== wellbeingItems.length || !data.answers.every(isValue)) return null;
  return { id: data.id, takenAt: data.takenAt, version: data.version, answers: data.answers as WellbeingValue[] };
}

/** 최신순으로 정렬하고 같은 ID는 하나만 남깁니다. */
export function normalizeChecks(checks: readonly WellbeingCheck[]): WellbeingCheck[] {
  const seen = new Set<string>();
  return [...checks].sort((a, b) => Date.parse(b.takenAt) - Date.parse(a.takenAt) || a.id.localeCompare(b.id))
    .filter((check) => (seen.has(check.id) ? false : (seen.add(check.id), true)))
    .slice(0, WELLBEING_MAX_CHECKS);
}

export function parseChecks(raw: string): WellbeingCheck[] | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return null;
    return normalizeChecks(value.flatMap((item) => {
      const check = validateCheck(item);
      return check ? [check] : [];
    }));
  } catch {
    return null;
  }
}

export function createCheck(answers: readonly WellbeingValue[], now: Date, id: string): WellbeingCheck {
  scoreWellbeing(answers);
  return { id, takenAt: now.toISOString(), version: WELLBEING_VERSION, answers: [...answers] };
}

/** 시간순(오래된 것부터) 점수와 직전 대비 변화. */
export function wellbeingTrend(checks: readonly WellbeingCheck[]): WellbeingPoint[] {
  const ordered = normalizeChecks(checks).reverse();
  return ordered.map((check, index) => {
    const score = scoreWellbeing(check.answers);
    const previous = index > 0 ? scoreWellbeing(ordered[index - 1].answers).score : null;
    const change = previous === null ? null : score.score - previous;
    return { id: check.id, takenAt: check.takenAt, answers: check.answers, ...score, change, meaningful: change !== null && Math.abs(change) >= MEANINGFUL_CHANGE };
  });
}

/** 다음 체크를 권하는 날: 마지막 체크가 묻는 2주가 지난 뒤. */
export function nextCheckDate(checks: readonly WellbeingCheck[], periodDays: number): Date | null {
  const latest = normalizeChecks(checks)[0];
  if (!latest) return null;
  const date = new Date(latest.takenAt);
  date.setDate(date.getDate() + periodDays);
  return date;
}

/** 문항별 평균(0–5, 소수 첫째 자리). 여러 번 체크했을 때 늘 낮거나 높은 영역을 찾는 데 씁니다. */
export function itemAverages(checks: readonly WellbeingCheck[]): { id: WellbeingItemId; mean: number }[] {
  if (checks.length === 0) return [];
  return wellbeingItems.map((item, index) => ({
    id: item.id,
    mean: Math.round((checks.reduce((sum, check) => sum + check.answers[index], 0) / checks.length) * 10) / 10,
  }));
}
