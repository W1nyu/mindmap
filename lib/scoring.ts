import { questionnaire } from "../data/questions";
import { dimensionIds, type DimensionId, type LikertResponse, type Questionnaire, type ScoringResult } from "../types/psychology";
import type { LikertInstrument } from "../types/assessment";
import { validateQuestionnaire } from "./questionnaire";
import { ScoringError, scoreLikertInstrument } from "./likert-engine";

export { ScoringError, type ScoringErrorCode } from "./likert-engine";
export const SCORING_VERSION = "weighted-likert-v1";

/** 반응 패턴 질문지를 공통 Likert 도구 형식으로 바꿉니다. */
export function questionnaireToInstrument(set: Questionnaire): LikertInstrument<DimensionId> {
  return {
    id: "reaction",
    version: set.version,
    scaleIds: dimensionIds,
    items: set.questions.map((question) => ({ ...question, scale: question.dimension })),
  };
}

/** 순수 함수: 역채점 → 차원별 가중 평균 → 0–100 정규화. 미응답은 0으로 대체하지 않습니다. */
export function scoreQuestionnaire(responses: readonly LikertResponse[], set: Questionnaire = questionnaire): ScoringResult {
  try {
    validateQuestionnaire(set);
  } catch {
    throw new ScoringError("INVALID_QUESTIONNAIRE", "질문 데이터가 올바르지 않습니다.");
  }
  const result = scoreLikertInstrument(questionnaireToInstrument(set), responses, SCORING_VERSION);
  return {
    source: "computed",
    questionnaireVersion: result.instrumentVersion,
    scoringVersion: result.scoringVersion,
    responseCount: result.responseCount,
    dimensions: result.scales.map(({ scale, ...score }) => ({ dimension: scale, ...score })),
  };
}
