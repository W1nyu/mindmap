import type { DimensionId } from "@/types/psychology";

/** 점수와 무관한 차원 안내입니다. 개인 분석 규칙(M5)은 아직 적용하지 않습니다. */
export const dimensionNotes: Record<DimensionId, { strength: string; difficulty: string }> = {
  evaluationSensitivity: { strength: "피드백과 주변의 기대를 세심하게 살피는 데 도움이 될 수 있어요.", difficulty: "다른 사람의 평가를 자주 생각하면 내 기준을 살필 여유가 줄어들 수 있어요." },
  contextAccuracyNeed: { strength: "사실과 배경을 구분해 서로의 이해를 맞추는 데 도움이 될 수 있어요.", difficulty: "세부 사실을 설명하는 데 집중하면 대화의 감정이나 타이밍을 놓칠 수 있어요." },
  defensiveReactivity: { strength: "불편한 상황에서 내 입장과 경계를 지키는 데 도움이 될 수 있어요.", difficulty: "빠르게 대응하면 상대가 전하려는 내용을 충분히 듣기 어려울 수 있어요." },
  relationshipSensitivity: { strength: "관계의 미묘한 변화와 상대의 마음에 주의를 기울일 수 있어요.", difficulty: "불확실한 신호에 오래 집중하면 관계에 대한 걱정이 커질 수 있어요." },
  controlResistance: { strength: "자율성과 선택의 이유를 확인하는 데 도움이 될 수 있어요.", difficulty: "선택이 제한된 상황에서는 협의할 여지를 살피기 전에 불편함이 커질 수 있어요." },
  selfCriticism: { strength: "행동을 돌아보고 개선할 부분을 찾는 데 도움이 될 수 있어요.", difficulty: "아쉬운 부분에만 집중하면 잘한 점과 당시의 여건을 놓칠 수 있어요." },
  emotionalArousal: { strength: "감정과 몸의 변화를 알아차리는 단서가 될 수 있어요.", difficulty: "감정이 빠르게 올라오면 생각을 정리하거나 대화를 이어가기 어려울 수 있어요." },
  perspectiveRecovery: { strength: "시간을 두고 다른 관점과 내 책임을 살피는 데 도움이 될 수 있어요.", difficulty: "다른 관점을 급히 찾으려 하면 아직 남아 있는 감정이나 필요를 지나칠 수 있어요." },
};
