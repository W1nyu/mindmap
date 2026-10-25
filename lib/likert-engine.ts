import type { InstrumentResult, LikertInstrument, LikertResponse } from "../types/assessment";

export const LIKERT_ENGINE_VERSION = "weighted-likert-v2";
export type ScoringErrorCode = "INVALID_QUESTIONNAIRE" | "INVALID_RESPONSE" | "UNKNOWN_QUESTION" | "DUPLICATE_RESPONSE" | "MISSING_RESPONSE";

export class ScoringError extends Error {
  constructor(public readonly code: ScoringErrorCode, message: string) {
    super(message);
    this.name = "ScoringError";
  }
}

/** 0 ≤ value < points 인 정수인지 확인합니다. */
export function isLikertValue(value: unknown, points: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < points;
}

/** 계산 전에 문항 데이터의 불일치를 거부합니다. 모든 척도에 최소 1문항이 있어야 합니다. */
export function validateInstrument(instrument: LikertInstrument): void {
  if (!instrument || typeof instrument.id !== "string" || !instrument.id.trim() ||
    typeof instrument.version !== "string" || !instrument.version.trim() ||
    !Number.isInteger(instrument.points) || instrument.points < 2 || !Number.isInteger(instrument.origin) ||
    !Array.isArray(instrument.options) || instrument.options.length !== instrument.points ||
    instrument.options.some((option, index) => option.value !== index || !option.label) ||
    !Array.isArray(instrument.scaleIds) || instrument.scaleIds.length === 0 ||
    new Set(instrument.scaleIds).size !== instrument.scaleIds.length || !Array.isArray(instrument.items)) {
    throw new Error("도구 ID, 버전, 선택지, 척도 목록과 문항 목록이 필요합니다.");
  }
  const scales = new Set<string>(instrument.scaleIds);
  const ids = new Set<string>();
  const covered = new Set<string>();
  for (const item of instrument.items) {
    if (!item || item.kind !== "likert" || typeof item.id !== "string" || !item.id.trim() || ids.has(item.id) ||
      typeof item.text !== "string" || !item.text.trim() || !scales.has(item.scale) ||
      typeof item.reverse !== "boolean" || !Number.isFinite(item.weight) || item.weight <= 0) {
      throw new Error("문항 ID, 척도, 내용, 역채점 또는 가중치가 올바르지 않습니다.");
    }
    ids.add(item.id);
    covered.add(item.scale);
  }
  if (instrument.scaleIds.some((id) => !covered.has(id))) {
    throw new Error("모든 척도에 문항이 필요합니다.");
  }
}

/**
 * 순수 함수: 역채점(최댓값 − 응답) → 척도별 가중 평균 → 0–100 정규화.
 * 원 척도 단위의 평균(origin부터)도 함께 돌려줍니다. 미응답은 0으로 대체하지 않습니다.
 */
export function scoreLikertInstrument<S extends string>(
  instrument: LikertInstrument<S>,
  responses: readonly LikertResponse[],
  scoringVersion: string = LIKERT_ENGINE_VERSION,
): InstrumentResult<S> {
  try {
    validateInstrument(instrument);
  } catch {
    throw new ScoringError("INVALID_QUESTIONNAIRE", "질문 데이터가 올바르지 않습니다.");
  }
  if (!Array.isArray(responses)) {
    throw new ScoringError("INVALID_RESPONSE", "응답 목록이 필요합니다.");
  }
  const max = instrument.points - 1;
  const knownIds = new Set(instrument.items.map((item) => item.id));
  const values = new Map<string, number>();
  for (const response of responses) {
    if (!response || response.kind !== "likert" || typeof response.questionId !== "string" || !isLikertValue(response.value, instrument.points)) {
      throw new ScoringError("INVALID_RESPONSE", `응답은 0–${max} 사이의 정수여야 합니다.`);
    }
    if (!knownIds.has(response.questionId)) {
      throw new ScoringError("UNKNOWN_QUESTION", "알 수 없는 문항의 응답이 있습니다.");
    }
    if (values.has(response.questionId)) {
      throw new ScoringError("DUPLICATE_RESPONSE", "같은 문항에 중복 응답이 있습니다.");
    }
    values.set(response.questionId, response.value);
  }
  if (instrument.items.some((item) => !values.has(item.id))) {
    throw new ScoringError("MISSING_RESPONSE", "모든 문항에 응답한 뒤 계산할 수 있습니다.");
  }
  const scales = instrument.scaleIds.map((scale) => {
    const evidence = instrument.items.filter((item) => item.scale === scale).map((item) => {
      const rawValue = values.get(item.id)!;
      const scoredValue = item.reverse ? max - rawValue : rawValue;
      return { questionId: item.id, rawValue, scoredValue, reverse: item.reverse, weight: item.weight, weightedValue: scoredValue * item.weight };
    });
    const weightedSum = evidence.reduce((sum, item) => sum + item.weightedValue, 0);
    const weightSum = evidence.reduce((sum, item) => sum + item.weight, 0);
    if (!Number.isFinite(weightedSum) || !Number.isFinite(weightSum)) {
      throw new ScoringError("INVALID_QUESTIONNAIRE", "가중치 합이 계산 범위를 벗어났습니다.");
    }
    const average = weightedSum / weightSum;
    return { scale, score: Math.round((average / max) * 100), mean: Math.round((average + instrument.origin) * 100) / 100, weightedSum, weightSum, evidence };
  });
  return {
    source: "computed", instrumentId: instrument.id, instrumentVersion: instrument.version,
    scoringVersion, points: instrument.points, origin: instrument.origin, responseCount: responses.length, scales,
  };
}
