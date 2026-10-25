import type { LikertInstrument, LikertItem } from "../types/assessment";
import { defenseIds, type DefenseId } from "../types/defense";

export const DEFENSE_QUESTIONNAIRE_VERSION = "selfmap-defense-45-v1";

/**
 * SelfMap 자체 작성 문항입니다. DSQ 등 기존 척도의 문항을 옮기지 않았으며 검증된 임상 척도가 아닙니다.
 * 방어기제마다 3문항, 역채점 없음, 가중치 1.
 */
const itemTexts: Record<DefenseId, readonly [string, string, string]> = {
  sublimation: [
    "속상하거나 화가 날 때 그 에너지를 운동, 창작, 일 같은 활동으로 돌리는 편이다.",
    "힘든 감정을 글, 음악, 그림 같은 표현으로 풀어낼 때가 있다.",
    "답답한 마음이 들면 무언가를 만들거나 배우는 데 그 마음을 쓰려고 한다.",
  ],
  humor: [
    "곤란한 상황에서도 그 안의 우스운 면을 찾아 긴장을 풀 수 있다.",
    "힘든 일을 겪을 때도 나 자신을 가볍게 웃어넘길 여유가 있는 편이다.",
    "어려운 문제를 피하지 않으면서도 농담으로 분위기를 부드럽게 만들 수 있다.",
  ],
  anticipation: [
    "힘든 일이 예상되면 그때 어떤 감정이 들지 미리 생각해 둔다.",
    "걱정되는 일이 다가오면 현실적인 대처 계획을 세워 둔다.",
    "곧 닥칠 어려움을 미리 그려 보며 마음의 준비를 하는 편이다.",
  ],
  suppression: [
    "지금 당장 해결할 수 없는 걱정은 적절한 때까지 잠시 미뤄 둘 수 있다.",
    "해야 할 일이 있을 때는 마음을 흔드는 생각을 일단 옆에 두고 집중할 수 있다.",
    "속상한 일이 있어도 생각할 시간을 따로 정해 두고 그때 다룰 수 있다.",
  ],
  affiliation: [
    "힘들 때 믿을 만한 사람에게 내 상황을 이야기하고 도움을 구한다.",
    "어려운 감정을 혼자 감당하기보다 가까운 사람과 나누는 편이다.",
    "문제가 생기면 함께 고민해 줄 사람을 찾아 의견을 듣는다.",
  ],
  intellectualization: [
    "감정적인 일이 생기면 감정보다 원인과 논리를 분석하는 데 집중한다.",
    "힘든 경험을 이야기할 때 마치 남의 일처럼 담담하게 설명하게 된다.",
    "마음이 불편할 때 관련 정보를 찾아 정리하고 있으면 감정을 덜 느껴도 되어 편하다.",
  ],
  reactionFormation: [
    "싫은 마음이 드는 사람에게 오히려 더 친절하게 대할 때가 있다.",
    "누군가 부러울 때 오히려 그 사람을 지나치게 칭찬하게 된다.",
    "속으로 화가 나 있을 때 겉으로는 유난히 상냥하게 행동하는 편이다.",
  ],
  displacement: [
    "어떤 일로 기분이 상하면 상관없는 사람이나 일에 짜증을 내게 될 때가 있다.",
    "직접 말하기 어려운 사람에게 받은 스트레스를 다른 곳에서 풀게 된다.",
    "화가 난 대상이 아닌 물건이나 가까운 사람에게 감정이 향할 때가 있다.",
  ],
  undoing: [
    "누군가에게 상처 주는 말을 했다고 느끼면 사과 대신 호의를 베풀어 만회하려 한다.",
    "내가 잘못했다고 느끼면 불안해서 그걸 상쇄할 행동을 서둘러 하게 된다.",
    "좋지 않은 생각을 하고 나면 그 생각을 지우려는 듯한 행동이나 말을 덧붙이게 된다.",
  ],
  denial: [
    "걱정스러운 일이 생겨도 별일 아니라고 생각하며 넘기려 한다.",
    "다른 사람들이 문제라고 말해도 나는 크게 문제라고 느끼지 않을 때가 많다.",
    "불편한 사실은 확인하기보다 모르는 채로 지내는 편이 낫다고 느낀다.",
  ],
  projection: [
    "내가 누군가에게 불편한 마음이 들 때, 오히려 그 사람이 나를 불편해한다고 느낄 때가 있다.",
    "일이 꼬이면 다른 사람의 의도 때문이라는 생각이 먼저 든다.",
    "내가 싫어하는 내 모습이 다른 사람에게서 유난히 잘 보인다.",
  ],
  rationalization: [
    "원하던 것을 얻지 못하면 ‘사실 별로 필요 없었어’라고 생각하게 된다.",
    "내 행동이 마음에 걸릴 때 그럴듯한 이유를 찾아 스스로를 납득시킨다.",
    "실수한 뒤 진짜 이유보다 받아들이기 쉬운 이유를 먼저 찾게 된다.",
  ],
  passiveAggression: [
    "불만이 있어도 직접 말하지 않고 일을 미루거나 대충 하는 방식으로 드러낼 때가 있다.",
    "기분이 상하면 말없이 연락을 늦추거나 무뚝뚝해지는 편이다.",
    "싫다는 말 대신 겉으로 동의하고 실제로는 따르지 않을 때가 있다.",
  ],
  actingOut: [
    "감정이 강하게 올라오면 생각하기 전에 행동부터 할 때가 있다.",
    "속상할 때 충동적으로 무언가를 사거나 저질러 버린 뒤 후회한 적이 종종 있다.",
    "화가 나면 문을 세게 닫거나 메시지를 바로 보내는 식으로 즉시 드러낸다.",
  ],
  withdrawal: [
    "갈등이 생기면 사람들과 연락을 끊고 혼자 숨고 싶어진다.",
    "현실의 문제가 버거울 때 공상이나 영상, 게임 속으로 오래 빠져든다.",
    "불편한 대화가 예상되면 그 자리를 피하거나 계속 미루는 편이다.",
  ],
};

/** 같은 방어기제 문항이 이어지지 않도록 수준을 섞은 고정 순서입니다. */
const presentationOrder: readonly DefenseId[] = [
  "sublimation", "denial", "intellectualization", "humor", "projection",
  "displacement", "anticipation", "passiveAggression", "reactionFormation", "affiliation",
  "actingOut", "undoing", "suppression", "withdrawal", "rationalization",
];

/** 라운드 r(0–2)마다 순서를 5칸씩 회전해 각 방어기제의 문항 간격을 고르게 합니다. */
function interleave(): LikertItem<DefenseId>[] {
  return [0, 1, 2].flatMap((round) => presentationOrder.map((_, index) => {
    const defense = presentationOrder[(index + round * 5) % presentationOrder.length];
    return {
      id: `defense-${defense}-${round + 1}`, kind: "likert" as const, text: itemTexts[defense][round],
      scale: defense, reverse: false, weight: 1,
    };
  }));
}

export const defenseQuestions: readonly LikertItem<DefenseId>[] = interleave();

export const defenseInstrument: LikertInstrument<DefenseId> = {
  id: "defense",
  version: DEFENSE_QUESTIONNAIRE_VERSION,
  scaleIds: defenseIds,
  items: defenseQuestions,
};
