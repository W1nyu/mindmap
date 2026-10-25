import type { DefenseId } from "../types/defense";

export interface DefenseVignette {
  id: string;
  story: string;
  answer: DefenseId;
  /** 정답을 포함한 4개 선택지. 화면에 이 순서대로 보여줍니다. */
  options: readonly [DefenseId, DefenseId, DefenseId, DefenseId];
  explanation: string;
}

/**
 * 방어기제를 익히는 자체 작성 사례입니다. 실제 사람에 대한 판단이 아니라 개념 연습용이며,
 * 하나의 행동에 여러 방어가 겹칠 수 있다는 점을 해설에서 함께 다룹니다.
 */
export const defenseVignettes: readonly DefenseVignette[] = [
  {
    id: "v-sublimation", answer: "sublimation", options: ["actingOut", "sublimation", "intellectualization", "reactionFormation"],
    story: "실연 뒤 몇 달 동안 그 감정을 담은 곡을 여러 편 써서 작은 공연을 열었다.",
    explanation: "강한 감정을 억누르거나 바로 터뜨리지 않고, 창작이라는 가치 있는 활동으로 옮겼어요. 감정이 행동으로 즉시 터져 나오는 행동화와 달리, 시간을 두고 형태를 바꿔 표현했다는 점이 승화의 특징이에요.",
  },
  {
    id: "v-humor", answer: "humor", options: ["denial", "rationalization", "humor", "suppression"],
    story: "중요한 면접에 늦을 위기에 처하자 ‘오늘 내 인생 장르가 스릴러로 바뀌었네’라고 웃고는 바로 택시를 잡았다.",
    explanation: "상황의 우스운 면을 보며 긴장을 풀었지만, 문제를 외면하지 않고 바로 대처했어요. 문제 자체를 없던 일로 여기는 부인과 달리, 유머는 현실을 인정한 채로 거리를 조금 두는 방식이에요.",
  },
  {
    id: "v-anticipation", answer: "anticipation", options: ["anticipation", "suppression", "intellectualization", "undoing"],
    story: "다음 주 가족 모임에서 불편한 질문을 받을 것 같아, 들을 수 있는 말과 내 대답을 미리 적어 두었다.",
    explanation: "다가올 어려움과 그때의 감정을 미리 떠올리고 현실적으로 준비했어요. 감정과 거리를 두기 위해 분석에 몰두하는 주지화와 달리, 예상은 감정까지 포함해 준비한다는 점이 달라요.",
  },
  {
    id: "v-suppression", answer: "suppression", options: ["withdrawal", "denial", "displacement", "suppression"],
    story: "발표 직전 친구와의 다툼이 떠올랐지만 ‘발표 끝나고 생각하자’고 미뤄 두었고, 발표가 끝난 뒤 실제로 친구에게 연락했다.",
    explanation: "지금 다룰 수 없는 걱정을 의식적으로 잠시 미뤄 두고, 약속한 때에 다시 꺼냈어요. 다시 다루지 않고 계속 피하면 회피에 가까워지지만, 억제는 ‘나중’을 지킨다는 점이 핵심이에요.",
  },
  {
    id: "v-affiliation", answer: "affiliation", options: ["passiveAggression", "affiliation", "reactionFormation", "humor"],
    story: "맡은 프로젝트가 막혀 불안해지자 선배에게 상황을 솔직히 설명하고 같이 고민해 달라고 부탁했다.",
    explanation: "어려움을 혼자 감당하지 않고 믿을 만한 사람과 나누며 도움을 구했어요. 감정을 숨기거나 돌려 말하지 않고, 관계를 통해 문제를 함께 다룬 소속·도움 요청의 예예요.",
  },
  {
    id: "v-intellectualization", answer: "intellectualization", options: ["sublimation", "rationalization", "suppression", "intellectualization"],
    story: "이별 통보를 받은 날 밤, 관계 심리학 자료를 찾아 읽으며 관계가 끝난 이유를 꼼꼼히 분석했지만 슬프다는 말은 한 번도 하지 않았다.",
    explanation: "감정 대신 분석과 정보에 집중해 아픈 마음과 거리를 뒀어요. 그럴듯한 이유로 실망을 덮는 합리화와 비슷해 보이지만, 주지화는 감정 자체를 ‘느끼지 않고 생각하는’ 쪽으로 옮긴다는 점이 달라요.",
  },
  {
    id: "v-reaction-formation", answer: "reactionFormation", options: ["reactionFormation", "undoing", "projection", "humor"],
    story: "질투가 나는 동료가 승진하자, 누구보다 크게 축하하며 선물까지 따로 준비했다.",
    explanation: "받아들이기 어려운 질투와 정반대인 태도를 겉으로 더 강하게 보였어요. 축하 자체는 좋은 행동이지만, 속마음과 반대 방향으로 ‘과하게’ 나타날 때 반동형성을 의심해 볼 수 있어요.",
  },
  {
    id: "v-displacement", answer: "displacement", options: ["actingOut", "projection", "displacement", "passiveAggression"],
    story: "상사에게 크게 지적받은 날, 집에 와서 동생이 문을 세게 닫았다는 이유로 크게 화를 냈다.",
    explanation: "상사에게 향해야 할 화가 더 안전하게 느껴지는 동생에게 옮겨 갔어요. 감정이 즉시 행동으로 나왔다는 점에서 행동화도 겹치지만, 감정의 ‘대상이 바뀌었다’는 점이 전치의 핵심이에요.",
  },
  {
    id: "v-undoing", answer: "undoing", options: ["rationalization", "suppression", "reactionFormation", "undoing"],
    story: "연인에게 날카롭게 말한 다음 날, 사과는 하지 않고 아침 일찍 좋아하는 빵을 사 와 아무 일 없던 것처럼 행동했다.",
    explanation: "잘못했다고 느끼는 말을 다른 행동으로 ‘지우려’ 했어요. 호의 자체는 따뜻하지만, 직접적인 인정 없이 만회 행동만 할 때 취소의 성격이 강해져요.",
  },
  {
    id: "v-denial", answer: "denial", options: ["denial", "suppression", "rationalization", "withdrawal"],
    story: "건강검진에서 재검 안내를 받았지만 ‘기계 오류겠지’라며 예약을 하지 않았다.",
    explanation: "받아들이기 힘든 사실을 ‘별일 아니다’라며 인식에서 밀어냈어요. 일부러 잠시 미루고 나중에 다루는 억제와 달리, 부인은 문제가 있다는 사실 자체를 받아들이지 않는다는 점이 달라요.",
  },
  {
    id: "v-projection", answer: "projection", options: ["displacement", "projection", "reactionFormation", "intellectualization"],
    story: "팀원에게 짜증이 나 있던 날, 오히려 그 팀원이 나를 못마땅해한다는 생각이 하루 종일 들었다.",
    explanation: "내 안의 불편한 감정을 상대의 감정으로 느꼈어요. 감정이 다른 대상으로 옮겨 가는 전치와 달리, 투사는 감정의 ‘주인’이 바뀌어 상대가 그 감정을 가진 것처럼 느껴진다는 점이 달라요.",
  },
  {
    id: "v-rationalization", answer: "rationalization", options: ["humor", "denial", "rationalization", "sublimation"],
    story: "원하던 회사에 떨어진 뒤 ‘거기는 야근이 많아서 어차피 나랑 안 맞았을 거야’라고 바로 정리했다.",
    explanation: "실망을 받아들이기 쉬운 설명으로 빠르게 덮었어요. 떨어졌다는 사실은 인정하므로 부인과는 다르고, 설명이 사실일 수도 있지만 진짜 이유를 살필 기회가 줄어든다는 점이 합리화의 비용이에요.",
  },
  {
    id: "v-passive-aggression", answer: "passiveAggression", options: ["withdrawal", "suppression", "actingOut", "passiveAggression"],
    story: "회의에서는 아무 말 없이 동의했지만, 마음에 들지 않던 결정 사항은 마감 직전까지 손도 대지 않았다.",
    explanation: "불만을 직접 말하지 않고 지연이라는 간접적인 방식으로 드러냈어요. 상황 자체를 피하는 회피와 달리, 수동공격에는 상대를 향한 불만이 행동 속에 담겨 있어요.",
  },
  {
    id: "v-acting-out", answer: "actingOut", options: ["actingOut", "displacement", "projection", "passiveAggression"],
    story: "단체 대화방에서 서운한 말을 듣자마자 긴 비난 메시지를 보냈고, 다음 날 그 메시지를 크게 후회했다.",
    explanation: "강한 감정이 생각을 거치기 전에 즉각적인 행동으로 터져 나왔어요. 감정의 대상은 바뀌지 않았으므로 전치와는 다르고, ‘속도’와 ‘즉시성’이 행동화의 특징이에요.",
  },
  {
    id: "v-withdrawal", answer: "withdrawal", options: ["suppression", "withdrawal", "denial", "sublimation"],
    story: "친구와 다툰 뒤 일주일 동안 연락을 받지 않고 밤새 게임만 했다.",
    explanation: "불편한 관계에서 물러나 몰입 활동 속으로 피했어요. 다시 다룰 때를 정해 두는 억제와 달리, 회피·철수는 언제 돌아올지 정하지 않은 채 거리를 두는 경우가 많아요.",
  },
];
