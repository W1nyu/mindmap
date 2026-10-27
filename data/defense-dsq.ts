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
  "남을 도우면서 보람을 느끼고, 그럴 수 없게 되면 우울해질 것 같다.",
  "신경 쓰이는 문제가 있어도, 그 문제를 다룰 시간이 생길 때까지는 한쪽으로 밀어 둘 수 있다.",
  "그림 그리기나 만들기처럼 무언가를 만들어 내는 창의적인 일을 하면서 불안을 푼다.",
  "내가 하는 일에는 언제나 그럴 만한 이유를 댈 수 있다.",
  "내 모습이나 실수를 두고 꽤 쉽게 웃어넘길 수 있다.",
  "사람들은 나를 함부로 대하는 편이다.",
  "누군가 내 돈을 강제로 빼앗아 가더라도, 그 사람이 벌을 받기보다는 도움을 받았으면 좋겠다.",
  "사람들은 내가 불편한 사실을 마치 없는 일처럼 모른 척한다고 말한다.",
  "마치 슈퍼맨이라도 된 듯 위험을 대수롭지 않게 여긴다.",
  "잘난 척하는 사람의 콧대를 꺾어 놓을 수 있다는 게 내 자랑이다.",
  "무언가 신경 쓰이는 일이 있으면 충동적으로 행동할 때가 많다.",
  "일이 잘 풀리지 않으면 몸이 아프다.",
  "나는 하고 싶은 말이나 행동을 많이 억누르는 사람이다.",
  "실제 삶보다 공상 속에서 더 큰 만족을 느낀다.",
  "나에게는 별 탈 없이 살아가게 해 주는 특별한 재능이 있다.",
  "일이 잘 안 풀릴 때는 늘 그럴 만한 사정이 있다.",
  "실제 삶에서보다 상상 속에서 더 많은 일을 해결한다.",
  "나는 두려운 것이 없다.",
  "때로는 내가 천사 같고, 때로는 악마 같다고 생각한다.",
  "상처를 받으면 대놓고 공격적으로 나온다.",
  "내 곁에는 늘 수호천사 같은 누군가가 있다고 느낀다.",
  "내가 보기에 사람은 좋은 사람 아니면 나쁜 사람, 둘 중 하나다.",
  "상사가 나를 들볶으면, 앙갚음하려고 일을 일부러 틀리거나 느리게 할지도 모른다.",
  "내가 아는 사람 중에는 못 하는 게 없고 더없이 공정한 사람이 있다.",
  "감정을 드러내면 하던 일에 지장이 생길 것 같을 때는 감정을 꾹 눌러 둘 수 있다.",
  "괴로운 처지에 놓여도 대개 그 안에서 웃긴 구석을 찾아낼 수 있다.",
  "하기 싫은 일을 해야 할 때면 머리가 아프다.",
  "화를 낼 만한 상대에게 오히려 아주 잘해 줄 때가 많다.",
  "인생이 나에게 불공평하다는 것만큼은 확실하다.",
  "어려운 상황을 앞두면 그 상황이 어떨지 미리 그려 보고 대처할 방법을 세운다.",
  "의사들은 내가 어디가 어떻게 안 좋은지 제대로 알아내지 못한다.",
  "내 권리를 위해 맞서고 나면, 그렇게 강하게 나섰던 것을 사과하게 된다.",
  "우울하거나 불안할 때 먹으면 기분이 나아진다.",
  "감정을 드러내지 않는다는 말을 자주 듣는다.",
  "슬픈 일이 닥칠 걸 미리 알면 더 잘 대처할 수 있다.",
  "아무리 하소연해도 속 시원한 반응이 돌아오지 않는다.",
  "강한 감정이 들 만한 상황에서도 아무 느낌이 없을 때가 많다.",
  "하던 일에 매달려 있으면 우울하거나 불안해지지 않는다.",
  "위기에 처하면 나와 같은 문제를 겪은 사람을 찾아갈 것이다.",
  "공격적인 생각이 들면, 그 생각을 만회할 만한 일을 해야 할 것 같은 마음이 든다.",
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
