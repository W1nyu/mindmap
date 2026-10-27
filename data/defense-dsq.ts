import type { LikertInstrument } from "../types/assessment";
import type { DefenseId, DefenseTierId } from "../types/defense";
import { agree9, buildInstrument } from "./instrument-kit";

/**
 * 방어 스타일 질문지 DSQ-40(Andrews, Singh & Bond, 1993; 20개 방어 × 2문항). 9점 척도이며 역채점이 없습니다.
 * 방어 점수는 두 문항의 평균입니다. 평소의 방어 스타일을 묻는 심층 검사로 씁니다.
 * DSQ의 저작권은 개발자(Bond)에게 있으며 연구·교육 목적의 비상업적 사용을 전제로 합니다.
 * 문장은 mindmap이 옮긴 한국어로, 공식 한국어판과 다를 수 있습니다.
 */
type Key = Partial<Record<DefenseId, readonly [number, number]>>;

function fromKey(id: string, version: string, texts: readonly string[], key: Key): LikertInstrument<DefenseId> {
  const defenseOf = new Map<number, DefenseId>();
  for (const [defense, [a, b]] of Object.entries(key) as [DefenseId, readonly [number, number]][]) {
    defenseOf.set(a, defense);
    defenseOf.set(b, defense);
  }
  const scaleIds = Object.keys(key) as DefenseId[];
  return buildInstrument<DefenseId>({ id, version, options: agree9, scaleIds, items: texts.map((text, index) => [text, defenseOf.get(index + 1)!]) });
}

const dsq40Texts = [
  "남을 돕는 데서 보람을 느끼기 때문에, 그럴 수 없으면 우울해질 것 같다.",
  "신경 쓰이는 일이 있어도, 제대로 다룰 시간이 날 때까지는 잠시 접어 둘 수 있다.",
  "불안할 때 그림 그리기나 만들기처럼 창의적인 일을 하면서 푼다.",
  "내가 한 일에는 언제나 마땅한 이유를 댈 수 있다.",
  "내 모습을 두고 스스로 웃어넘길 줄 안다.",
  "사람들은 나를 함부로 대하곤 한다.",
  "누가 나를 위협해 돈을 빼앗아 가도, 그 사람이 처벌보다는 도움을 받았으면 좋겠다.",
  "사람들은 내가 불편한 일을 없는 셈 치고 넘어간다고 말한다.",
  "나는 무슨 슈퍼맨이라도 되는 것처럼 위험을 신경 쓰지 않는다.",
  "잘난 척하는 사람의 코를 납작하게 해 줄 수 있다는 게 뿌듯하다.",
  "신경 쓰이는 일이 있으면 충동적으로 행동할 때가 많다.",
  "일이 잘 안 풀리면 몸이 아프다.",
  "나는 하고 싶은 것을 많이 억누르고 사는 사람이다.",
  "실제 생활보다 공상할 때가 더 만족스럽다.",
  "나에게는 특별한 재능이 있어서 살면서 별 어려움이 없다.",
  "일이 틀어질 때는 늘 그럴 만한 사정이 있다.",
  "실제로 해 보기보다 머릿속 상상으로 더 많은 일을 해결한다.",
  "나는 무서운 게 없다.",
  "어떤 때는 내가 천사 같다가도, 어떤 때는 악마 같다는 생각이 든다.",
  "상처를 받으면 대놓고 공격적으로 군다.",
  "내 주변에는 늘 수호천사 같은 사람이 있다.",
  "사람은 좋은 사람 아니면 나쁜 사람, 둘 중 하나라고 생각한다.",
  "상사가 나를 들볶으면, 앙갚음으로 일을 틀리게 하거나 늑장을 부릴지도 모른다.",
  "내가 아는 사람 중에는 못 하는 일이 없고 누구보다 공정한 사람이 있다.",
  "감정을 드러내면 하던 일에 방해가 될 때는 꾹 참을 수 있다.",
  "괴로운 상황에서도 대개 웃을 거리를 찾아낸다.",
  "하기 싫은 일을 해야 하면 머리가 아프다.",
  "화를 내야 마땅한 사람에게 오히려 잘해 줄 때가 많다.",
  "나는 인생에서 늘 손해만 본다고 확신한다.",
  "힘든 일을 앞두면 어떻게 될지 미리 그려 보고 대처할 방법을 세운다.",
  "의사들은 내 몸이 어디가 문제인지 제대로 모른다.",
  "내 권리를 내세우고 나면, 너무 세게 말한 것 같아 사과하게 된다.",
  "우울하거나 불안할 때 뭘 먹으면 기분이 나아진다.",
  "감정 표현을 잘 안 한다는 말을 자주 듣는다.",
  "슬픈 일이 생길 걸 미리 알면 더 잘 견딜 수 있다.",
  "아무리 하소연해도 속 시원한 대답을 들은 적이 없다.",
  "감정이 크게 일어날 법한 상황에서도 아무 느낌이 없을 때가 많다.",
  "하던 일에 몰두하고 있으면 우울하거나 불안하지 않다.",
  "위기가 닥치면 나와 같은 일을 겪은 사람을 찾아갈 것이다.",
  "공격적인 생각이 들고 나면, 그걸 만회하려고 무언가를 해야 할 것 같다.",
] as const;

/** Andrews 외(1993) 채점 키 */
const dsq40Key: Key = {
  sublimation: [3, 38], humor: [5, 26], anticipation: [30, 35], suppression: [2, 25],
  undoing: [32, 40], pseudoAltruism: [1, 39], idealization: [21, 24], reactionFormation: [7, 28],
  projection: [6, 29], passiveAggression: [23, 36], actingOut: [11, 20], isolation: [34, 37], devaluation: [10, 13],
  fantasy: [14, 17], denial: [8, 18], displacement: [31, 33], dissociation: [9, 15], splitting: [19, 22], rationalization: [4, 16], somatization: [12, 27],
};

export const dsq40 = fromKey("dsq40", "dsq40-ko-selfmap-v1", dsq40Texts, dsq40Key);

/** DSQ-40의 세 요인(Andrews 외, 1993) */
export const dsq40Tiers: Partial<Record<DefenseId, DefenseTierId>> = {
  sublimation: "adaptive", humor: "adaptive", anticipation: "adaptive", suppression: "adaptive",
  undoing: "inhibitory", pseudoAltruism: "inhibitory", idealization: "inhibitory", reactionFormation: "inhibitory",
  projection: "immediate", passiveAggression: "immediate", actingOut: "immediate", isolation: "immediate", devaluation: "immediate",
  fantasy: "immediate", denial: "immediate", displacement: "immediate", dissociation: "immediate", splitting: "immediate", rationalization: "immediate", somatization: "immediate",
};
