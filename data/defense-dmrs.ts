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
    ["사람을 아주 좋은 사람 아니면 아주 나쁜 사람으로만 봤다.", "splittingOther"],
    ["나에게 중요한 일인데도 남의 일처럼 덤덤했다.", "isolation"],
    ["감정이 북받칠 때 머리나 배가 아프거나, 몸이 말을 듣지 않았다.", "dissociation"],
    ["도움이 필요한 사람을 몸소 돕거나 마음으로 힘이 되어 줬다.", "altruism"],
    ["현실을 마주하기보다 늘 하던 공상 속으로 빠져들었다.", "fantasy"],
    ["앞으로 닥칠 어려움에 어떻게 대처할지 미리 생각해 뒀다.", "anticipation"],
    ["나에게는 좋은 점이 하나도 없다고 느꼈다.", "splittingSelf"],
    ["받는 것보다 훨씬 많이 주고 있었는데, 그걸 깨닫지 못했다.", "reactionFormation"],
    ["문제를 내 힘껏 풀어 가면서도 주변에 도움이나 위로를 청했다.", "affiliation"],
    ["무언가를 만들거나 창작하면서 긴장을 풀었다.", "sublimation"],
    ["다른 사람을 믿지 못하고, 나를 속이거나 이용하려 한다고 의심했다.", "projection"],
    ["힘든 일이나 스트레스를 농담 삼아 이야기했다.", "humor"],
    ["내가 무엇을 느끼고 생각하는지 차분히 돌아봤다.", "selfObservation"],
    ["화를 나 자신에게 돌리거나, 나에게 해가 되는 행동으로 풀었다.", "passiveAggression"],
    ["힘든 일의 진짜 이유는 덮어 두고 그럴듯한 핑계를 댔다.", "rationalization"],
    ["문제가 생기자 직접 나서서 해결하려고 했다.", "selfAssertion"],
    ["나나 다른 사람을 실제보다 훨씬 대단하게 여겼다.", "idealization"],
    ["일부러든 아니든, 은근히 거슬리게 굴어 누군가를 짜증 나게 했다.", "passiveAggression"],
    ["해야 할 일부터 하려고 내가 원하는 것은 잠시 미뤄 뒀다.", "suppression"],
    ["불안한 문제는 놔두고 사소하거나 엉뚱한 일에 매달렸다.", "displacement"],
    ["감정이 얽힌 일을 이야기하면서도 내 감정은 빼고 남 얘기하듯 말했다.", "intellectualization"],
    ["아무도 나를 이해해 주지 않고 신경도 안 쓴다고 불평했다.", "helpRejectingComplaining"],
    ["누군가 때문에 감정이 크게 일었을 때, 그 사람이 일부러 나를 그렇게 만들었다고 생각했다.", "projectiveIdentification"],
    ["머리가 멍해지거나 혼란스러웠고, 괴로운 일은 말로 꺼내지 못했다.", "dissociation"],
    ["누군가와 말다툼을 하거나 몸싸움을 했다.", "actingOut"],
    ["간단한 것도 잘 기억이 나지 않았다.", "repression"],
    ["내 문제나 감정은 아예 생각하지 않으려 했다.", "denial"],
    ["나는 아주 강해서 누구도 나를 건드릴 수 없다고 느꼈다.", "omnipotence"],
    ["불안한 일을 두고 생각이 이랬다저랬다 엇갈렸다.", "undoing"],
    ["나나 다른 사람을 하찮게 여기고 깎아내렸다.", "devaluation"],
  ],
});
