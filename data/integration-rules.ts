import type { ModuleId } from "./modules";

export interface IntegrationCondition {
  module: ModuleId;
  /** 척도 ID. 방어기제는 스타일 ID(adaptive·inhibitory·immediate) */
  scale: string;
  /** high: ≥ 63, low: ≤ 37 */
  level: "high" | "low";
}

export interface IntegrationRule {
  id: string;
  kind: "pattern" | "resource";
  title: string;
  when: readonly IntegrationCondition[];
  text: string;
}

/**
 * 서로 다른 모듈의 점수가 함께 높거나 낮을 때의 해석 가설입니다. 관련 모듈을 모두 마쳤을 때만 평가합니다.
 * 정서조절곤란(DERS) 점수는 높을수록 조절이 어렵다는 뜻입니다.
 */
export const integrationRules: readonly IntegrationRule[] = [
  { id: "anxious-impulse", kind: "pattern", title: "관계의 불안이 행동으로", when: [{ module: "attachment", scale: "attachmentAnxiety", level: "high" }, { module: "emotion", scale: "impulse", level: "high" }],
    text: "관계가 흔들린다고 느낄 때 감정이 커지고 행동이 먼저 나갈 수 있어요." },
  { id: "distance-unaware", kind: "pattern", title: "감정과 관계 모두 거리 두기", when: [{ module: "attachment", scale: "attachmentAvoidance", level: "high" }, { module: "emotion", scale: "awareness", level: "high" }],
    text: "가까워지는 것도, 내 감정을 들여다보는 것도 피하는 흐름이 함께 보여요." },
  { id: "sensitive-stuck", kind: "pattern", title: "한번 가라앉으면 오래가는 흐름", when: [{ module: "traits", scale: "neuroticism", level: "high" }, { module: "emotion", scale: "strategies", level: "high" }],
    text: "감정을 강하게 느끼고, 가라앉은 기분에서 빠져나올 방법이 없다고 느끼기 쉬워요." },
  { id: "self-blame", kind: "pattern", title: "감정을 느끼는 나를 탓하는 흐름", when: [{ module: "traits", scale: "neuroticism", level: "high" }, { module: "emotion", scale: "nonacceptance", level: "high" }],
    text: "불편한 감정이 자주 들고, 그런 감정을 느끼는 나 자신을 탓하기 쉬워요." },
  { id: "act-before-think", kind: "pattern", title: "행동이 앞서는 순간", when: [{ module: "defense", scale: "immediate", level: "high" }, { module: "emotion", scale: "impulse", level: "high" }],
    text: "강한 스트레스 앞에서 감정을 바로 밀어내거나 행동으로 내보내는 흐름이 겹쳐 보여요." },
  { id: "thinking-over-feeling", kind: "pattern", title: "생각으로 감정을 덮는 흐름", when: [{ module: "defense", scale: "inhibitory", level: "high" }, { module: "emotion", scale: "clarity", level: "high" }],
    text: "감정을 마음속에서 바꾸어 다루다 보니, 정작 무엇을 느끼는지 흐려질 수 있어요." },
  { id: "recovery-path", kind: "resource", title: "회복의 길을 아는 힘", when: [{ module: "defense", scale: "adaptive", level: "high" }, { module: "emotion", scale: "strategies", level: "low" }],
    text: "성숙한 대처를 자주 쓰고, 속상해도 결국 나아질 방법을 찾을 수 있다고 믿는 편이에요." },
  { id: "steady-work", kind: "resource", title: "흔들려도 할 일을 해내는 힘", when: [{ module: "traits", scale: "conscientiousness", level: "high" }, { module: "emotion", scale: "goals", level: "low" }],
    text: "계획적인 성향과 감정이 흔들려도 집중을 유지하는 힘이 함께 보여요." },
  { id: "warm-secure", kind: "resource", title: "편안한 관계의 바탕", when: [{ module: "traits", scale: "agreeableness", level: "high" }, { module: "attachment", scale: "attachmentAnxiety", level: "low" }],
    text: "다른 사람에게 마음을 쓰면서도 관계를 크게 의심하지 않는 편이에요." },
];
