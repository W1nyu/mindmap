export const dimensionIds = [
  "evaluationSensitivity", "contextAccuracyNeed", "defensiveReactivity",
  "relationshipSensitivity", "controlResistance", "selfCriticism",
  "emotionalArousal", "perspectiveRecovery",
] as const;

export type DimensionId = (typeof dimensionIds)[number];
export type LikertValue = 0 | 1 | 2 | 3 | 4;

export interface LikertQuestion {
  id: string;
  kind: "likert";
  text: string;
  dimension: DimensionId;
  reverse: boolean;
  weight: number;
}

/** 이후 단계의 계약만 정의하며 M1–M4 설문/채점에는 포함하지 않습니다. */
export interface ScenarioQuestion {
  id: string;
  kind: "scenario";
  text: string;
  options: readonly { id: string; text: string }[];
}

export interface TextQuestion {
  id: string;
  kind: "text";
  text: string;
  required: false;
  maxLength: number;
}

export type Question = LikertQuestion | ScenarioQuestion | TextQuestion;
export type Response =
  | { kind: "likert"; questionId: string; value: LikertValue }
  | { kind: "scenario"; questionId: string; optionId: string }
  | { kind: "text"; questionId: string; text: string };
export type LikertResponse = Extract<Response, { kind: "likert" }>;

export interface Questionnaire {
  version: string;
  questions: readonly LikertQuestion[];
}

export interface ScoreEvidence {
  questionId: string;
  rawValue: LikertValue;
  scoredValue: LikertValue;
  reverse: boolean;
  weight: number;
  weightedValue: number;
}

export interface DimensionScore {
  dimension: DimensionId;
  score: number;
  weightedSum: number;
  weightSum: number;
  evidence: readonly ScoreEvidence[];
}

export interface ScoringResult {
  source: "computed";
  questionnaireVersion: string;
  scoringVersion: string;
  responseCount: number;
  dimensions: readonly DimensionScore[];
}

export interface QuestionnaireSession {
  questionnaireVersion: string;
  answers: Readonly<Record<string, LikertValue>>;
  currentQuestionIndex: number;
  completed: boolean;
}

export interface DimensionMeta {
  id: DimensionId;
  name: string;
  description: string;
  shortName: string;
}

/** 예시 화면 전용. 실제 계산 결과와 구분되는 리터럴 태그입니다. */
export interface DemoDimension extends DimensionMeta {
  source: "demo";
  value: number;
}
