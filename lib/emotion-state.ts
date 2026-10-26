import { sders, type StateEmotionId } from "../data/emotion-state";
import { scoreLikertInstrument } from "./likert-engine";

export const EMOTION_STATE_STORAGE_KEY = "selfmap.sders.v1";
export const EMOTION_STATE_MAX_CHECKS = 300;

export interface EmotionStateCheck {
  id: string;
  takenAt: string;
  version: string;
  /** 문항 순서대로 0–4 (화면의 1–5) */
  answers: readonly number[];
}

export interface EmotionStateScore {
  /** S-DERS 총점(원 척도 합, 21–105). 높을수록 지금 조절이 어려움 */
  total: number;
  /** 총점을 0–100으로 옮긴 값 */
  totalScore: number;
  subscales: readonly { id: StateEmotionId; sum: number; mean: number; score: number }[];
}

export interface EmotionStatePoint extends EmotionStateScore {
  id: string;
  takenAt: string;
}

const isAnswer = (value: unknown) => Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 4;

/** 순수 함수: 공통 엔진으로 하위척도를 채점하고, 논문처럼 하위척도 합과 총점(합)을 함께 돌려줍니다. */
export function scoreEmotionState(answers: readonly number[]): EmotionStateScore {
  if (answers.length !== sders.items.length || !answers.every(isAnswer)) {
    throw new Error("21문항 모두 1–5 사이로 답해야 계산할 수 있습니다.");
  }
  const result = scoreLikertInstrument(sders, sders.items.map((item, index) => ({ kind: "likert" as const, questionId: item.id, value: answers[index] })), "s-ders-v1");
  const subscales = result.scales.map((scale) => ({ id: scale.scale, sum: scale.weightedSum + scale.evidence.length, mean: scale.mean, score: scale.score }));
  const total = subscales.reduce((sum, scale) => sum + scale.sum, 0);
  const items = sders.items.length;
  return { total, totalScore: Math.round(((total - items) / (items * 4)) * 100), subscales };
}

export function validateEmotionStateCheck(value: unknown): EmotionStateCheck | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (typeof data.id !== "string" || !data.id || data.id.length > 80) return null;
  if (typeof data.takenAt !== "string" || Number.isNaN(Date.parse(data.takenAt))) return null;
  if (data.version !== sders.version) return null;
  if (!Array.isArray(data.answers) || data.answers.length !== sders.items.length || !data.answers.every(isAnswer)) return null;
  return { id: data.id, takenAt: data.takenAt, version: data.version, answers: data.answers as number[] };
}

/** 최신순으로 정렬하고 같은 ID는 하나만 남깁니다. */
export function normalizeEmotionStateChecks(checks: readonly EmotionStateCheck[]): EmotionStateCheck[] {
  const seen = new Set<string>();
  return [...checks].sort((a, b) => Date.parse(b.takenAt) - Date.parse(a.takenAt) || a.id.localeCompare(b.id))
    .filter((check) => (seen.has(check.id) ? false : (seen.add(check.id), true)))
    .slice(0, EMOTION_STATE_MAX_CHECKS);
}

export function parseEmotionStateChecks(raw: string): EmotionStateCheck[] | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return null;
    return normalizeEmotionStateChecks(value.flatMap((item) => {
      const check = validateEmotionStateCheck(item);
      return check ? [check] : [];
    }));
  } catch {
    return null;
  }
}

export function createEmotionStateCheck(answers: readonly number[], now: Date, id: string): EmotionStateCheck {
  scoreEmotionState(answers);
  return { id, takenAt: now.toISOString(), version: sders.version, answers: [...answers] };
}

/** 시간순(오래된 것부터) 점수. 순간을 재는 척도라 같은 날 여러 번 기록해도 모두 남깁니다. */
export function emotionStateTrend(checks: readonly EmotionStateCheck[]): EmotionStatePoint[] {
  return normalizeEmotionStateChecks(checks).reverse().map((check) => ({ id: check.id, takenAt: check.takenAt, ...scoreEmotionState(check.answers) }));
}
