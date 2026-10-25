import { dimensionIds, type LikertValue, type Questionnaire } from "../types/psychology";

export function isLikertValue(value: unknown): value is LikertValue {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 4;
}

/** 계산 전에 문항 데이터의 불일치를 거부합니다. */
export function validateQuestionnaire(set: Questionnaire): void {
  if (typeof set.version !== "string" || !set.version.trim() || !Array.isArray(set.questions)) {
    throw new Error("질문지 버전과 문항 목록이 필요합니다.");
  }
  const ids = new Set<string>();
  const covered = new Set<string>();
  for (const question of set.questions) {
    if (!question || question.kind !== "likert" || typeof question.id !== "string" ||
      !question.id.trim() || ids.has(question.id) || typeof question.text !== "string" ||
      !question.text.trim() || !dimensionIds.includes(question.dimension) ||
      typeof question.reverse !== "boolean" || !Number.isFinite(question.weight) || question.weight <= 0) {
      throw new Error("문항 ID, 차원, 내용, 역채점 또는 가중치가 올바르지 않습니다.");
    }
    ids.add(question.id);
    covered.add(question.dimension);
  }
  if (dimensionIds.some((id) => !covered.has(id))) {
    throw new Error("8개 차원 모두에 문항이 필요합니다.");
  }
}
