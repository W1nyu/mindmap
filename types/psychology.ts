/** 응답 값은 0부터 (선택지 수 − 1)까지의 정수입니다. 화면에는 원 척도대로 1부터 표시합니다. */
export type LikertValue = number;

export interface LikertResponse {
  kind: "likert";
  questionId: string;
  value: LikertValue;
}

export interface ScoreEvidence {
  questionId: string;
  rawValue: LikertValue;
  scoredValue: LikertValue;
  reverse: boolean;
  weight: number;
  weightedValue: number;
}

export interface QuestionnaireSession {
  questionnaireVersion: string;
  answers: Readonly<Record<string, LikertValue>>;
  currentQuestionIndex: number;
  completed: boolean;
}
