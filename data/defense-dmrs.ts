import type { DefenseId } from "../types/defense";
import { buildInstrument, frequency5dmrs } from "./instrument-kit";

/**
 * DMRS-SR-30(Defense Mechanisms Rating Scales Self-Report-30; Di Giuseppe, Perry 외, 2020, Frontiers in Psychiatry 11:870).
 * DMRS 위계 전체(28개 방어, 7단계)를 재는 첫 자기보고 척도입니다. 문항은 논문 표 7(영어판, CC BY)을 옮겼습니다.
 * 지난 일주일 동안 어려운 감정이나 상황을 각 방식으로 얼마나 다뤘는지 0–4로 답합니다(역채점 없음).
 * 수동공격과 해리는 2문항, 나머지는 1문항입니다.
 *
 * 문항별 방어 대응은 논문에 표로 나와 있지 않아 DMRS 정의(Perry, 1990)에 맞춰 정했고,
 * 단계별 문항 수가 논문 표 2(고적응 8 · 강박 3 · 신경증 5 · 작은 심상왜곡 3 · 부인 4 · 큰 심상왜곡 3 · 행동 4)와 일치하는지 테스트로 확인합니다.
 */
export const dmrsSr30 = buildInstrument<DefenseId>({
  id: "dmrs-sr-30", version: "dmrs-sr-30-ko-selfmap-v1", options: frequency5dmrs, origin: 0,
  scaleIds: [
    "affiliation", "altruism", "anticipation", "humor", "selfAssertion", "selfObservation", "sublimation", "suppression",
    "intellectualization", "isolation", "undoing", "displacement", "dissociation", "reactionFormation", "repression",
    "devaluation", "idealization", "omnipotence", "denial", "projection", "rationalization", "fantasy",
    "projectiveIdentification", "splittingSelf", "splittingOther", "actingOut", "helpRejectingComplaining", "passiveAggression",
  ],
  items: [
    ["다른 사람을 ‘전부 좋은’ 사람 아니면 ‘전부 나쁜’ 사람으로 보았다.", "splittingOther"],
    ["나와 관련된 중요한 문제에 마치 떨어져 있는 사람처럼 반응했다.", "isolation"],
    ["감정적인 상황에서 두통, 복통, 무언가를 할 수 없게 되는 것 같은 몸의 증상이 생겼다.", "dissociation"],
    ["도움이 필요한 사람에게 몸으로든 마음으로든 도움을 주었다.", "altruism"],
    ["현실 대신 되풀이되는 공상이나 백일몽 속으로 물러났다.", "fantasy"],
    ["앞으로 예상되는 어려움을 어떻게 다룰지 미리 생각했다.", "anticipation"],
    ["나에게는 긍정적이거나 괜찮은 점이 하나도 없다고 느꼈다.", "splittingSelf"],
    ["받는 것보다 훨씬 많이 주면서도 그 불균형을 알아차리지 못했다.", "reactionFormation"],
    ["문제를 최선을 다해 다루면서 몸과 마음의 지지를 요청했다.", "affiliation"],
    ["창의적인 활동을 하며 긴장을 풀려고 했다.", "sublimation"],
    ["다른 사람을 의심하거나, 믿을 수 없고 불성실하거나 나를 조종한다고 느꼈다.", "projection"],
    ["힘든 개인적 문제나 스트레스 상황에 대해 유머 섞인 말을 했다.", "humor"],
    ["내 감정 경험과 개인적인 생각을 돌아보았다.", "selfObservation"],
    ["화를 나 자신에게 돌리거나 스스로를 해치는 행동으로 표현했다.", "passiveAggression"],
    ["개인적인 문제나 스트레스 상황의 진짜 이유를 덮으려고 그럴듯한 설명이나 변명을 했다.", "rationalization"],
    ["생긴 문제를 해결하는 데 적극적으로 나섰다.", "selfAssertion"],
    ["나나 다른 사람의 개인적인 특성을 이상화했다.", "idealization"],
    ["의식했든 아니든, 간접적이거나 거슬리는 방식으로 누군가를 짜증 나게 했다.", "passiveAggression"],
    ["해야 할 다른 일을 처리하려고 내 개인적인 욕구를 잠시 미뤄 두었다.", "suppression"],
    ["불안하게 하는 문제에서 주의를 돌리게 하는 사소하거나 상관없는 일에 집중했다.", "displacement"],
    ["감정적인 주제를 내 감정을 생각하거나 느끼지 않은 채 일반적이거나 남 일처럼 이야기했다.", "intellectualization"],
    ["다른 사람들이 나를 이해하지 못하거나 정말로 신경 쓰지 않는다고 불평했다.", "helpRejectingComplaining"],
    ["누군가에게 강한 감정을 느끼면서, 그 사람이 일부러 나를 그렇게 느끼게 만들었다고 생각했다.", "projectiveIdentification"],
    ["혼란스럽거나 멍해지거나, 괴로운 주제에 대해 말할 수 없었다.", "dissociation"],
    ["말다툼이나 몸싸움을 했다.", "actingOut"],
    ["간단한 것을 기억하는 데 어려움이 있었다.", "repression"],
    ["개인적인 문제나 감정에 대해 생각하는 것을 피했다.", "denial"],
    ["내가 매우 강하고 힘이 있으며 누구도 건드릴 수 없는 존재라고 느꼈다.", "omnipotence"],
    ["나를 불안하게 하는 주제에 대해 서로 모순되거나 충돌하는 생각을 가졌다.", "undoing"],
    ["나나 다른 사람의 개인적인 특성을 깎아내렸다.", "devaluation"],
  ],
});
