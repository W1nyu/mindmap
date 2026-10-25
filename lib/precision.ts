import type { ScoreEvidence } from "../types/psychology";

/**
 * 점수의 확실도: 한 척도를 이루는 문항들에 얼마나 비슷하게 답했는지 봅니다.
 * 표준오차(문항 점수의 표준편차 ÷ √문항 수)를 0–100 단위로 옮겨 점수 앞뒤의 범위로 보여줍니다.
 * 모집단 신뢰도가 아니라 ‘내 응답 안에서의 일치 정도’이며, 새 점수를 만들지 않습니다.
 */
export const CONSISTENT_SD_MAX = 0.8;
export const MIXED_SD_MIN = 1.3;

export type Agreement = "consistent" | "moderate" | "mixed";

export interface ScalePrecision {
  id: string;
  score: number;
  items: number;
  /** 역채점 후 문항 점수(0–4)의 표준편차, 소수 둘째 자리 */
  sd: number;
  low: number;
  high: number;
  agreement: Agreement;
  /** 문항별 역채점 후 값을 0–100으로 옮긴 위치(문항 순서) */
  itemScores: readonly number[];
}

export const agreementLabels: Record<Agreement, string> = {
  consistent: "문항끼리 일치",
  moderate: "대체로 일치",
  mixed: "문항마다 엇갈림",
};

const round2 = (value: number) => Math.round(value * 100) / 100;

export function scalePrecision(id: string, score: number, evidence: readonly ScoreEvidence[]): ScalePrecision {
  const values: number[] = evidence.map((item) => item.scoredValue);
  const n = values.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const sd = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / n);
  const halfWidth = n > 1 ? (sd / Math.sqrt(n)) * 25 : 0;
  return {
    id, score, items: n, sd: round2(sd),
    low: Math.max(0, Math.round(score - halfWidth)),
    high: Math.min(100, Math.round(score + halfWidth)),
    agreement: sd <= CONSISTENT_SD_MAX ? "consistent" : sd >= MIXED_SD_MIN ? "mixed" : "moderate",
    itemScores: values.map((value) => value * 25),
  };
}

/**
 * 프로필 분석(Cronbach & Gleser, 1953)의 두 지표.
 * 높이(elevation) = 척도 점수 평균, 퍼짐(scatter) = 척도 점수의 표준편차. 퍼짐이 작으면 고른 프로필이에요.
 */
export function profileShape(scores: readonly number[]): { elevation: number; scatter: number } {
  if (scores.length === 0) return { elevation: 0, scatter: 0 };
  const elevation = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  const scatter = Math.sqrt(scores.reduce((sum, value) => sum + (value - elevation) ** 2, 0) / scores.length);
  return { elevation: Math.round(elevation * 10) / 10, scatter: Math.round(scatter * 10) / 10 };
}
