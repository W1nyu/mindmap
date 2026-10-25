import type { DimensionMeta } from "../types/psychology";

export const dimensions = [
  { id: "evaluationSensitivity", name: "평가 민감성", shortName: "평가", description: "다른 사람의 평가가 내 마음에 닿는 정도" },
  { id: "contextAccuracyNeed", name: "맥락·정확성 욕구", shortName: "맥락·정확성", description: "내 상황과 사실관계가 정확히 이해되길 바라는 마음" },
  { id: "defensiveReactivity", name: "방어적 반응성", shortName: "방어 반응", description: "불편한 상황에서 나를 보호하려는 반응" },
  { id: "relationshipSensitivity", name: "거절·관계 민감성", shortName: "관계", description: "관계의 거리와 거절 신호에 주의를 기울이는 정도" },
  { id: "controlResistance", name: "통제 저항", shortName: "통제 저항", description: "내 선택과 자율성을 지키려는 마음" },
  { id: "selfCriticism", name: "자기비판", shortName: "자기비판", description: "내 행동을 엄격하게 돌아보는 정도" },
  { id: "emotionalArousal", name: "감정 각성 민감성", shortName: "감정 각성", description: "감정이 올라올 때 몸과 말에 변화가 나타나는 정도" },
  { id: "perspectiveRecovery", name: "관점 전환·회복 능력", shortName: "관점·회복", description: "감정이 가라앉은 뒤 다른 관점을 다시 살피는 힘" },
] satisfies readonly DimensionMeta[];
