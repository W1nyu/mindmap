import type { DimensionId } from "../types/psychology";

export type FlowDimension = Exclude<DimensionId, "perspectiveRecovery">;

/** 차원별 대표 반응 흐름 예시. 응답자가 실제로 겪었다고 단정하지 않고 "이런 흐름일 수 있다"로 제시합니다. */
export const reactionFlows: Record<FlowDimension, { situation: string; thought: string; emotion: string; need: string; action: string }> = {
  evaluationSensitivity: { situation: "피드백이나 평가를 받는 순간", thought: "내가 부족해 보였을까?", emotion: "긴장 · 위축", need: "인정받고 싶음", action: "상대 반응을 계속 살핌" },
  contextAccuracyNeed: { situation: "내 행동이 오해받는 순간", thought: "내 맥락이 빠졌어", emotion: "억울함 · 답답함", need: "정확히 이해받기", action: "설명과 해명이 늘어남" },
  defensiveReactivity: { situation: "비판이나 의심을 받는 순간", thought: "나를 공격하는 것 같아", emotion: "방어감 · 짜증", need: "나를 지키기", action: "단호한 말투 · 거리 두기" },
  relationshipSensitivity: { situation: "가까운 사람의 반응이 달라진 순간", thought: "나와 멀어지는 걸까?", emotion: "불안 · 서운함", need: "연결을 확인하기", action: "신호를 반복해서 확인" },
  controlResistance: { situation: "이유 없이 지시받는 순간", thought: "내 선택이 무시됐어", emotion: "저항감 · 답답함", need: "자율성 지키기", action: "미루거나 반박하기" },
  selfCriticism: { situation: "실수가 드러난 순간", thought: "또 내가 부족했어", emotion: "자책 · 부끄러움", need: "잘하고 싶음", action: "실수를 곱씹음" },
  emotionalArousal: { situation: "예상하지 못한 갈등", thought: "지금 뭔가 위험해", emotion: "몸의 긴장 · 두근거림", need: "안정 되찾기", action: "말이 빨라지고 집중이 흐트러짐" },
};

export const recoveryTexts = {
  high: "시간이 지나면 다른 관점을 다시 살피는 힘이 비교적 잘 작동하는 편이에요.",
  mixed: "상황에 따라 관점을 되찾는 속도가 달라질 수 있어요.",
  low: "처음 떠오른 해석에서 벗어나는 데 시간이 걸릴 수 있어요. 회복을 돕는 작은 루틴이 도움이 될 수 있어요.",
} as const;

export interface InteractionRule {
  id: string;
  kind: "pattern" | "resource";
  title: string;
  /** 모든 조건을 만족할 때만 적용합니다. high: ≥ 63, low: ≤ 37 */
  when: readonly { dimension: DimensionId; level: "high" | "low" }[];
  text: string;
  strategy: string;
}

export const interactionRules: readonly InteractionRule[] = [
  {
    id: "evaluation-criticism", kind: "pattern", title: "평가가 자기비판으로 이어지는 고리",
    when: [{ dimension: "evaluationSensitivity", level: "high" }, { dimension: "selfCriticism", level: "high" }],
    text: "다른 사람의 평가에 마음이 쉽게 닿고, 그 평가가 나를 향한 엄격한 목소리로 이어질 수 있어요. 작은 피드백도 오래 남을 수 있어요.",
    strategy: "피드백을 들으면 ‘행동에 대한 말’과 ‘나라는 사람에 대한 말’을 나눠 적어 보세요. 대부분은 앞쪽에 속해요.",
  },
  {
    id: "context-defensive", kind: "pattern", title: "오해받는 순간의 빠른 해명",
    when: [{ dimension: "contextAccuracyNeed", level: "high" }, { dimension: "defensiveReactivity", level: "high" }],
    text: "정확히 이해받고 싶은 마음이 크고 방어 반응도 빠른 편이라, 오해받는 순간 설명이 먼저 나갈 수 있어요. 상대는 이를 ‘듣지 않는다’고 느낄 수 있어요.",
    strategy: "설명하기 전에 상대 말을 한 문장으로 요약해 확인해 보세요. ‘내가 이해한 게 맞아?’ 다음에 내 맥락을 덧붙이면 더 잘 전달돼요.",
  },
  {
    id: "relationship-arousal", kind: "pattern", title: "관계 신호가 몸의 경보로",
    when: [{ dimension: "relationshipSensitivity", level: "high" }, { dimension: "emotionalArousal", level: "high" }],
    text: "관계의 작은 변화가 몸의 긴장으로 빠르게 연결될 수 있어요. 답장이 늦거나 표정이 달라질 때 마음이 크게 출렁일 수 있어요.",
    strategy: "신호를 해석하기 전에 몸을 먼저 진정시키고(숨 길게 내쉬기), 가능한 다른 이유를 두 가지 떠올려 보세요.",
  },
  {
    id: "control-defensive", kind: "pattern", title: "자율성을 지키려는 방어",
    when: [{ dimension: "controlResistance", level: "high" }, { dimension: "defensiveReactivity", level: "high" }],
    text: "선택이 제한된다고 느낄 때 방어 반응이 함께 올라올 수 있어요. 내용보다 ‘지시받는 방식’에 먼저 반응하게 될 수 있어요.",
    strategy: "바로 반박하기보다 ‘이렇게 정한 이유를 들을 수 있을까요?’처럼 이유를 묻는 질문으로 협의의 여지를 열어 보세요.",
  },
  {
    id: "arousal-recovery", kind: "resource", title: "빠르게 오르고, 다시 돌아오는 흐름",
    when: [{ dimension: "emotionalArousal", level: "high" }, { dimension: "perspectiveRecovery", level: "high" }],
    text: "감정이 빠르게 올라오지만, 가라앉은 뒤에는 다른 관점을 다시 살피는 힘도 함께 있어요. 감정을 잘 느끼면서도 회복할 수 있는 조합이에요.",
    strategy: "감정이 올라온 순간에는 중요한 결정을 미루고, 회복된 뒤에 대화를 이어가는 ‘시간차 대화’를 활용해 보세요.",
  },
  {
    id: "arousal-slow-recovery", kind: "pattern", title: "오래 머무는 감정",
    when: [{ dimension: "emotionalArousal", level: "high" }, { dimension: "perspectiveRecovery", level: "low" }],
    text: "감정이 빠르게 올라오고, 처음 해석에서 벗어나기까지 시간이 걸리는 편일 수 있어요. 그만큼 마음이 지치기 쉬워요.",
    strategy: "감정이 올라온 뒤 할 회복 루틴(산책, 샤워, 짧은 기록)을 미리 정해 두고, 판단은 그 다음으로 미뤄 보세요.",
  },
  {
    id: "criticism-recovery", kind: "resource", title: "엄격함과 성찰이 함께 있는 자리",
    when: [{ dimension: "selfCriticism", level: "high" }, { dimension: "perspectiveRecovery", level: "high" }],
    text: "스스로를 엄격하게 돌아보는 만큼, 시간이 지나면 상황의 영향과 내 책임을 나눠 볼 수 있는 힘도 있어요.",
    strategy: "자기 점검 끝에 ‘이번에 잘한 점 하나’와 ‘당시의 여건 하나’를 꼭 함께 적어 균형을 맞춰 보세요.",
  },
  {
    id: "steady-distance", kind: "resource", title: "평가와 비판 앞의 안정적인 거리",
    when: [{ dimension: "evaluationSensitivity", level: "low" }, { dimension: "defensiveReactivity", level: "low" }],
    text: "다른 사람의 평가나 비판을 비교적 차분히 받아들이는 편일 수 있어요. 피드백을 정보로 다루는 데 도움이 돼요.",
    strategy: "차분함이 상대에게 무관심으로 읽히지 않도록, 피드백을 받은 뒤 ‘어떤 점이 걸렸는지’ 한 번 더 물어보세요.",
  },
];
