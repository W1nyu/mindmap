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
  "다른 사람을 돕는 데서 만족을 얻으며, 그럴 수 없게 되면 우울해질 것이다.",
  "문제를 다룰 시간이 생길 때까지 그 문제를 마음 밖에 둘 수 있다.",
  "그림이나 만들기처럼 건설적이고 창의적인 일을 하며 불안을 풀어낸다.",
  "내가 하는 모든 일에 그럴 만한 이유를 찾을 수 있다.",
  "나 자신을 꽤 쉽게 웃어넘길 수 있다.",
  "사람들은 나를 부당하게 대하는 경향이 있다.",
  "누군가 내 돈을 빼앗아 가더라도, 그 사람이 벌받기보다 도움받기를 바란다.",
  "사람들은 내가 불쾌한 사실을 없는 것처럼 무시한다고 말한다.",
  "슈퍼맨이라도 된 것처럼 위험을 무시한다.",
  "사람들의 콧대를 꺾어 놓을 수 있다는 것이 자랑스럽다.",
  "무언가 신경 쓰이는 일이 있으면 충동적으로 행동할 때가 많다.",
  "일이 잘 풀리지 않으면 몸이 아프다.",
  "나는 감정을 잘 드러내지 못하고 억눌린 사람이다.",
  "실제 삶보다 공상에서 더 큰 만족을 얻는다.",
  "나에게는 문제없이 살아가게 해 주는 특별한 재능이 있다.",
  "일이 잘 안 풀릴 때는 언제나 그럴 만한 이유가 있다.",
  "실제 삶에서보다 백일몽 속에서 더 많은 일을 해결한다.",
  "나는 아무것도 두렵지 않다.",
  "때로는 내가 천사 같고, 때로는 악마 같다고 생각한다.",
  "상처를 받으면 드러내 놓고 공격적으로 군다.",
  "내가 아는 누군가가 수호천사처럼 느껴질 때가 늘 있다.",
  "내가 보기에 사람은 좋은 사람 아니면 나쁜 사람이다.",
  "상사가 나를 괴롭히면, 앙갚음으로 일을 실수하거나 더 천천히 할지도 모른다.",
  "내가 아는 사람 중에 무엇이든 할 수 있고 완벽하게 공정한 사람이 있다.",
  "감정을 드러내는 것이 하던 일에 방해가 된다면 감정을 누를 수 있다.",
  "고통스러운 곤경에서도 대개 우스운 면을 볼 수 있다.",
  "하기 싫은 일을 해야 할 때면 머리가 아프다.",
  "당연히 화를 내야 할 사람에게 오히려 아주 잘해 주는 나를 자주 발견한다.",
  "인생이 나를 부당하게 대한다고 확신한다.",
  "어려운 상황에 맞서야 할 때, 그 상황을 상상해 보고 대처할 방법을 계획한다.",
  "의사들은 나에게 무엇이 문제인지 결코 제대로 이해하지 못한다.",
  "내 권리를 위해 싸우고 나면, 단호하게 굴었던 것을 사과하게 된다.",
  "우울하거나 불안할 때 먹으면 기분이 나아진다.",
  "감정을 드러내지 않는다는 말을 자주 듣는다.",
  "슬퍼질 것을 미리 예상할 수 있으면 더 잘 대처할 수 있다.",
  "아무리 불평해도 만족스러운 반응을 얻지 못한다.",
  "강한 감정이 들 만한 상황에서도 아무 느낌이 없을 때가 많다.",
  "하던 일에 집중하면 우울하거나 불안해지지 않는다.",
  "위기에 처하면 같은 문제를 겪은 사람을 찾아갈 것이다.",
  "공격적인 생각이 들면 그것을 만회할 무언가를 해야 할 것 같다.",
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
