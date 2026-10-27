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
    ["다른 사람을 ‘완전히 좋은 사람’ 아니면 ‘완전히 나쁜 사람’으로 나눠 봤다.", "splittingOther"],
    ["나에게 중요한 문제인데도 남의 일처럼 덤덤하게 반응했다.", "isolation"],
    ["감정이 크게 흔들리는 상황에서 두통이나 복통이 생기거나, 몸이 말을 듣지 않는 것 같았다.", "dissociation"],
    ["도움이 필요한 사람에게 직접 손을 보태거나 마음으로 힘이 되어 주었다.", "altruism"],
    ["현실을 마주하는 대신 같은 공상이나 백일몽에 자꾸 빠져들었다.", "fantasy"],
    ["앞으로 생길 만한 어려움에 어떻게 대처할지 미리 생각해 두었다.", "anticipation"],
    ["나에게는 좋은 점이나 괜찮은 구석이 하나도 없다고 느꼈다.", "splittingSelf"],
    ["받는 것보다 훨씬 많이 주면서도 그게 한쪽으로 치우쳐 있다는 걸 알아차리지 못했다.", "reactionFormation"],
    ["문제를 최선을 다해 풀어 가면서, 주변에 실질적인 도움이나 마음의 지지를 구했다.", "affiliation"],
    ["무언가를 만들거나 창작하면서 긴장을 풀려고 했다.", "sublimation"],
    ["다른 사람을 의심하거나, 그 사람이 믿을 수 없고 진실하지 않으며 나를 이용하려 한다고 느꼈다.", "projection"],
    ["힘든 개인적인 문제나 스트레스 상황을 두고 농담을 섞어 이야기했다.", "humor"],
    ["내가 느낀 감정과 내 생각을 차분히 돌아보았다.", "selfObservation"],
    ["화를 나 자신에게 돌리거나, 스스로에게 해가 되는 행동으로 드러냈다.", "passiveAggression"],
    ["개인적인 문제나 스트레스 상황의 진짜 이유를 덮으려고 그럴듯한 설명이나 핑계를 댔다.", "rationalization"],
    ["문제가 생기자 해결하려고 적극적으로 나섰다.", "selfAssertion"],
    ["나나 다른 사람의 성격이나 능력을 실제보다 지나치게 좋게 봤다.", "idealization"],
    ["의도했든 아니든, 돌려 말하거나 거슬리게 굴어서 누군가를 짜증 나게 했다.", "passiveAggression"],
    ["해야 할 일을 먼저 하려고 내 바람이나 필요는 잠시 미뤄 두었다.", "suppression"],
    ["불안한 문제 대신 사소하거나 상관없는 일에 신경을 쏟았다.", "displacement"],
    ["감정이 걸린 이야기를 하면서도, 내 감정은 느끼지도 생각하지도 않은 채 일반론이나 남 일처럼 말했다.", "intellectualization"],
    ["사람들이 나를 이해해 주지 않는다거나 나에게 진심으로 관심이 없다고 불평했다.", "helpRejectingComplaining"],
    ["누군가에게 강한 감정이 들었을 때, 그 사람이 일부러 나를 그런 기분이 들게 만들었다고 생각했다.", "projectiveIdentification"],
    ["머릿속이 혼란스럽거나 멍해졌고, 괴로운 일에 대해서는 말이 나오지 않았다.", "dissociation"],
    ["말다툼이나 몸싸움을 했다.", "actingOut"],
    ["간단한 것도 잘 기억나지 않았다.", "repression"],
    ["내 문제나 감정은 생각하지 않으려고 피했다.", "denial"],
    ["내가 아주 강하고 힘이 있어서 아무도 나를 건드릴 수 없다고 느꼈다.", "omnipotence"],
    ["나를 불안하게 하는 일을 두고 서로 맞지 않는 생각이 이랬다저랬다 했다.", "undoing"],
    ["나나 다른 사람의 성격이나 능력을 깎아내렸다.", "devaluation"],
  ],
});
