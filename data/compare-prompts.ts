import type { ModuleId } from "./modules";

export interface ComparePrompt {
  id: string;
  module: ModuleId;
  scale: string;
  title: string;
  /** 두 사람 점수 차이가 기준 이상일 때 함께 나눠 볼 이야기 */
  text: string;
}

/** 두 사람의 차이를 ‘맞고 틀림’이 아니라 대화의 출발점으로 바꾸는 질문들입니다. */
export const COMPARE_GAP = 25;

export const comparePrompts: readonly ComparePrompt[] = [
  { id: "c-anxiety", module: "attachment", scale: "attachmentAnxiety", title: "관계를 확인하고 싶은 마음의 크기", text: "한 사람은 관계의 신호에 더 민감하게 반응할 수 있어요. 마음이 불안할 때 어떤 말이나 행동이 안심이 되는지 서로 물어보세요." },
  { id: "c-avoidance", module: "attachment", scale: "attachmentAvoidance", title: "가까움과 혼자만의 공간", text: "한 사람은 거리와 혼자만의 시간이 더 필요할 수 있어요. 물러설 때 ‘언제 다시 이야기할지’를 함께 정해 두면 서로 덜 불안해요." },
  { id: "c-extraversion", module: "traits", scale: "extraversion", title: "에너지를 채우는 방식", text: "사람들 속에서 충전하는 사람과 조용한 시간에서 충전하는 사람은 주말 계획부터 다를 수 있어요. 각자의 충전 방식을 존중하는 일정을 이야기해 보세요." },
  { id: "c-conscientiousness", module: "traits", scale: "conscientiousness", title: "계획과 즉흥 사이", text: "계획이 편한 사람과 유연함이 편한 사람이 함께라면, 미리 정할 것과 그때그때 정할 것을 나눠 보세요." },
  { id: "c-negative", module: "traits", scale: "negativeEmotionality", title: "감정을 느끼는 강도", text: "같은 일에도 감정이 더 크게, 오래 느껴지는 사람이 있어요. ‘그럴 일이 아니야’ 대신 ‘지금 어떤 게 제일 힘들어?’라고 물어보세요." },
  { id: "c-agreeableness", module: "traits", scale: "agreeableness", title: "공감과 분석의 균형", text: "한 사람은 먼저 공감을, 다른 사람은 먼저 해결을 원할 수 있어요. 대화를 시작할 때 ‘들어 줄까, 같이 방법을 찾을까?’를 물어보세요." },
  { id: "c-defensive", module: "reaction", scale: "defensiveReactivity", title: "비판을 들을 때의 속도", text: "비판 앞에서 바로 방어하는 정도가 다를 수 있어요. 어려운 이야기를 꺼낼 때 시간과 방식을 미리 합의해 보세요." },
  { id: "c-recovery", module: "reaction", scale: "perspectiveRecovery", title: "다툰 뒤 돌아오는 시간", text: "다툰 뒤 마음이 가라앉는 속도가 다를 수 있어요. 각자에게 필요한 회복 시간을 말해 두면 ‘왜 아직도 화났어?’ 같은 오해가 줄어요." },
  { id: "c-withdrawal", module: "defense", scale: "withdrawal", title: "불편할 때 물러서는 정도", text: "불편할 때 한 사람은 물러서고 다른 사람은 다가가려 할 수 있어요. 쫓고 피하는 흐름이 생기면 잠시 멈추고 돌아올 시점을 정해 보세요." },
  { id: "c-affiliation", module: "defense", scale: "affiliation", title: "힘들 때 기대는 방식", text: "힘들 때 바로 털어놓는 사람과 혼자 정리한 뒤 말하는 사람이 있어요. 각자가 원하는 ‘도움의 모양’을 알려 주세요." },
];
