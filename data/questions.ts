import { dimensionIds, type DimensionId, type LikertQuestion, type LikertValue, type Questionnaire } from "../types/psychology";
import type { LikertInstrument } from "../types/assessment";

export const QUESTIONNAIRE_VERSION = "selfmap-likert-32-v1";
export const likertOptions: readonly { value: LikertValue; label: string }[] = [
  { value: 0, label: "전혀 아니다" },
  { value: 1, label: "약간 아니다" },
  { value: 2, label: "보통" },
  { value: 3, label: "꽤 그렇다" },
  { value: 4, label: "매우 그렇다" },
];

/** 자기이해용 샘플입니다. 검증된 임상 척도가 아니며 모든 문항의 가중치는 1입니다. */
export const questions = [
  { id: "evaluation-01", kind: "likert", dimension: "evaluationSensitivity", text: "다른 사람이 내 행동을 어떻게 평가할지 자주 신경 쓴다.", reverse: false, weight: 1 },
  { id: "evaluation-02", kind: "likert", dimension: "evaluationSensitivity", text: "내가 받은 피드백을 대화가 끝난 뒤에도 여러 번 떠올린다.", reverse: false, weight: 1 },
  { id: "evaluation-03", kind: "likert", dimension: "evaluationSensitivity", text: "사람들 앞에서 실수하면 그들의 반응에 주의가 쏠린다.", reverse: false, weight: 1 },
  { id: "evaluation-04", kind: "likert", dimension: "evaluationSensitivity", text: "다른 사람의 평가가 달라져도 내 행동을 내 기준으로 돌아볼 수 있다.", reverse: true, weight: 1 },
  { id: "context-01", kind: "likert", dimension: "contextAccuracyNeed", text: "누군가 내 행동을 오해하면 내가 처한 상황을 정확히 설명하고 싶다.", reverse: false, weight: 1 },
  { id: "context-02", kind: "likert", dimension: "contextAccuracyNeed", text: "대화에서 사실관계가 다르게 전달되면 바로잡고 싶다.", reverse: false, weight: 1 },
  { id: "context-03", kind: "likert", dimension: "contextAccuracyNeed", text: "누군가 결론을 내리기 전에 일의 배경을 충분히 알아주길 바란다.", reverse: false, weight: 1 },
  { id: "context-04", kind: "likert", dimension: "contextAccuracyNeed", text: "핵심 뜻이 전달되었다면 작은 사실 차이는 그대로 두는 편이다.", reverse: true, weight: 1 },
  { id: "defensive-01", kind: "likert", dimension: "defensiveReactivity", text: "비판을 받으면 상대의 말을 더 듣기 전에 내 입장을 설명하고 싶어진다.", reverse: false, weight: 1 },
  { id: "defensive-02", kind: "likert", dimension: "defensiveReactivity", text: "내 의도가 의심받는다고 느끼면 말투가 단호해지는 편이다.", reverse: false, weight: 1 },
  { id: "defensive-03", kind: "likert", dimension: "defensiveReactivity", text: "불편한 지적을 받으면 나를 보호하려고 대화에서 거리를 두고 싶어진다.", reverse: false, weight: 1 },
  { id: "defensive-04", kind: "likert", dimension: "defensiveReactivity", text: "불편한 피드백을 받아도 바로 대응하기 전에 내용을 살펴보는 편이다.", reverse: true, weight: 1 },
  { id: "relationship-01", kind: "likert", dimension: "relationshipSensitivity", text: "가까운 사람의 답장이 평소보다 늦으면 관계가 달라졌는지 신경 쓰인다.", reverse: false, weight: 1 },
  { id: "relationship-02", kind: "likert", dimension: "relationshipSensitivity", text: "대화 상대의 표정이나 말투가 달라지면 나와 관련이 있는지 생각한다.", reverse: false, weight: 1 },
  { id: "relationship-03", kind: "likert", dimension: "relationshipSensitivity", text: "모임이나 대화에서 내가 빠졌다고 느끼면 그 일이 마음에 남는다.", reverse: false, weight: 1 },
  { id: "relationship-04", kind: "likert", dimension: "relationshipSensitivity", text: "상대가 잠시 거리를 두어도 관계가 계속 이어질 수 있다고 느낀다.", reverse: true, weight: 1 },
  { id: "control-01", kind: "likert", dimension: "controlResistance", text: "선택의 이유를 듣지 못한 채 지시받으면 저항감이 든다.", reverse: false, weight: 1 },
  { id: "control-02", kind: "likert", dimension: "controlResistance", text: "내가 결정할 수 있는 일에 누군가 개입하면 불편함을 느낀다.", reverse: false, weight: 1 },
  { id: "control-03", kind: "likert", dimension: "controlResistance", text: "다른 사람이 정한 방식보다 내가 선택한 방식으로 해보고 싶다.", reverse: false, weight: 1 },
  { id: "control-04", kind: "likert", dimension: "controlResistance", text: "내 선택지가 줄어들어도 합의한 방식이라면 편안하게 따를 수 있다.", reverse: true, weight: 1 },
  { id: "criticism-01", kind: "likert", dimension: "selfCriticism", text: "실수한 뒤에는 내가 부족했던 부분을 반복해서 떠올린다.", reverse: false, weight: 1 },
  { id: "criticism-02", kind: "likert", dimension: "selfCriticism", text: "잘한 일이 있어도 아쉬운 부분에 먼저 시선이 간다.", reverse: false, weight: 1 },
  { id: "criticism-03", kind: "likert", dimension: "selfCriticism", text: "비슷한 실수를 해도 다른 사람보다 나 자신에게 더 엄격한 편이다.", reverse: false, weight: 1 },
  { id: "criticism-04", kind: "likert", dimension: "selfCriticism", text: "실수했을 때 그 당시의 여건도 고려하며 나를 돌아볼 수 있다.", reverse: true, weight: 1 },
  { id: "arousal-01", kind: "likert", dimension: "emotionalArousal", text: "긴장되는 대화에서는 몸의 긴장이나 심장 박동 변화를 빠르게 느낀다.", reverse: false, weight: 1 },
  { id: "arousal-02", kind: "likert", dimension: "emotionalArousal", text: "감정이 올라오면 평소보다 말이 빨라지거나 목소리가 달라진다.", reverse: false, weight: 1 },
  { id: "arousal-03", kind: "likert", dimension: "emotionalArousal", text: "예상하지 못한 갈등이 생기면 다른 일에 집중하기가 어려워진다.", reverse: false, weight: 1 },
  { id: "arousal-04", kind: "likert", dimension: "emotionalArousal", text: "긴장되는 상황에서도 몸과 말의 속도를 비교적 차분하게 유지한다.", reverse: true, weight: 1 },
  { id: "recovery-01", kind: "likert", dimension: "perspectiveRecovery", text: "감정이 가라앉은 뒤에는 같은 상황을 다른 관점에서도 살펴볼 수 있다.", reverse: false, weight: 1 },
  { id: "recovery-02", kind: "likert", dimension: "perspectiveRecovery", text: "갈등 후 시간을 두고 상대가 느꼈을 마음을 생각해보는 편이다.", reverse: false, weight: 1 },
  { id: "recovery-03", kind: "likert", dimension: "perspectiveRecovery", text: "마음이 진정되면 내 책임과 상황의 영향을 구분해서 돌아볼 수 있다.", reverse: false, weight: 1 },
  { id: "recovery-04", kind: "likert", dimension: "perspectiveRecovery", text: "시간이 지나도 처음 떠올린 해석에서 벗어나기 어려운 편이다.", reverse: true, weight: 1 },
] as const satisfies readonly LikertQuestion[];

export const questionnaire: Questionnaire = { version: QUESTIONNAIRE_VERSION, questions };

/** 공통 Likert 엔진과 모듈 화면에서 쓰는 형식입니다. 척도 ID는 차원 ID와 같습니다. */
export const reactionInstrument: LikertInstrument<DimensionId> = {
  id: "reaction",
  version: QUESTIONNAIRE_VERSION,
  scaleIds: dimensionIds,
  items: questions.map((question) => ({ ...question, scale: question.dimension })),
};
