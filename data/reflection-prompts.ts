import type { IntegrationCondition } from "./integration-rules";

export interface ReflectionPrompt {
  id: string;
  text: string;
  /** 비어 있으면 누구에게나 보여주는 일반 질문입니다. high: ≥ 63, low: ≤ 37 */
  triggers: readonly IntegrationCondition[];
}

/** 마음 기록을 시작하도록 돕는 질문. 답을 강요하지 않으며 정답이 없습니다. */
export const reflectionPrompts: readonly ReflectionPrompt[] = [
  { id: "g-moved", text: "오늘 마음이 가장 크게 움직인 순간은 언제였나요? 그때 무엇을 느꼈나요?", triggers: [] },
  { id: "g-okay", text: "최근 ‘괜찮아’라고 말했지만 사실은 괜찮지 않았던 순간이 있었나요?", triggers: [] },
  { id: "g-habit", text: "요즘 나를 지켜 준 작은 습관이나 순간은 무엇인가요?", triggers: [] },
  { id: "g-thanks", text: "이번 주에 고마웠던 사람 한 명과, 그 사람이 내 마음에 남긴 것은 무엇인가요?", triggers: [] },
  { id: "d-withdrawal", text: "최근 피하고 싶었던 대화나 연락이 있었나요? 피했을 때 잠시 편해진 것과, 아직 남아 있는 것은 무엇인가요?", triggers: [{ module: "defense", scale: "withdrawal", level: "high" }] },
  { id: "d-displacement", text: "최근 엉뚱한 곳에서 짜증이 났던 순간, 그 감정이 처음 시작된 곳은 어디였을까요?", triggers: [{ module: "defense", scale: "displacement", level: "high" }] },
  { id: "d-intellectualization", text: "머리로는 이해했지만 마음은 아직 따라오지 않은 일이 있나요? 그 일에 감정 단어 하나를 붙인다면요?", triggers: [{ module: "defense", scale: "intellectualization", level: "high" }] },
  { id: "d-reaction", text: "최근 속마음과 다르게 행동했던 순간이 있었나요? 그때의 진짜 마음은 무엇이었을까요?", triggers: [{ module: "defense", scale: "reactionFormation", level: "high" }] },
  { id: "d-passive", text: "말하지 못한 불만이 행동으로 새어 나간 적이 있나요? 한 문장으로 직접 말한다면 어떻게 말할 수 있을까요?", triggers: [{ module: "defense", scale: "passiveAggression", level: "high" }] },
  { id: "d-projection", text: "최근 ‘저 사람이 나를 싫어하는 것 같다’고 느낀 순간, 그때 내 마음은 어땠나요?", triggers: [{ module: "defense", scale: "projection", level: "high" }] },
  { id: "d-denial", text: "‘별일 아니야’라고 넘겼지만 마음 한구석에 남아 있는 일이 있나요?", triggers: [{ module: "defense", scale: "denial", level: "high" }] },
  { id: "d-acting-out", text: "감정보다 행동이 먼저 나갔던 순간이 있었나요? 그때 10초를 멈췄다면 무엇이 달라졌을까요?", triggers: [{ module: "defense", scale: "actingOut", level: "high" }] },
  { id: "d-rationalization", text: "최근 실망한 일에 붙인 설명 말고, 불편하지만 가능한 다른 이유가 있을까요?", triggers: [{ module: "defense", scale: "rationalization", level: "high" }] },
  { id: "d-affiliation", text: "힘들 때 연락할 수 있는 사람을 한 명 떠올려 보세요. 그 사람에게 연락하기 어렵게 만드는 것은 무엇인가요?", triggers: [{ module: "defense", scale: "affiliation", level: "low" }] },
  { id: "d-resource", text: "최근 힘든 일을 웃음이나 표현, 준비로 넘긴 적이 있나요? 그 방식이 나에게 준 것은 무엇이었나요?", triggers: [{ module: "defense", scale: "humor", level: "high" }, { module: "defense", scale: "sublimation", level: "high" }, { module: "defense", scale: "anticipation", level: "high" }] },
  { id: "r-criticism", text: "최근 나에게 가장 엄격했던 말은 무엇이었나요? 아끼는 친구에게라면 어떻게 말했을까요?", triggers: [{ module: "reaction", scale: "selfCriticism", level: "high" }] },
  { id: "r-evaluation", text: "다른 사람의 평가가 오래 남았던 일이 있나요? 내 기준으로 다시 보면 그 일은 어땠나요?", triggers: [{ module: "reaction", scale: "evaluationSensitivity", level: "high" }] },
  { id: "r-recovery", text: "아직 처음 해석에서 벗어나기 어려운 일이 있나요? 다른 관점 하나를 적어 본다면요?", triggers: [{ module: "reaction", scale: "perspectiveRecovery", level: "low" }] },
  { id: "r-arousal", text: "감정이 몸으로 먼저 느껴졌던 순간이 있었나요? 몸의 어디에서, 어떤 느낌이었나요?", triggers: [{ module: "reaction", scale: "emotionalArousal", level: "high" }] },
  { id: "a-anxiety", text: "최근 관계를 확인하고 싶어졌던 순간, 내가 정말 듣고 싶었던 말은 무엇이었나요?", triggers: [{ module: "attachment", scale: "attachmentAnxiety", level: "high" }] },
  { id: "a-avoidance", text: "누군가 가까이 다가왔을 때 거리를 두고 싶었던 적이 있나요? 그때 무엇이 불편했나요?", triggers: [{ module: "attachment", scale: "attachmentAvoidance", level: "high" }] },
  { id: "t-sensitivity", text: "오늘 나를 가장 지치게 한 것과, 조금이라도 회복시켜 준 것은 무엇인가요?", triggers: [{ module: "traits", scale: "negativeEmotionality", level: "high" }] },
];
