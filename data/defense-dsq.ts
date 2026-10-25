import type { LikertInstrument } from "../types/assessment";
import type { DefenseId, DefenseTierId } from "../types/defense";
import { agree9, buildInstrument } from "./instrument-kit";

/**
 * 방어 스타일 질문지(DSQ). 간편 검사는 DSQ-40(Andrews, Singh & Bond, 1993; 20개 방어 × 2문항),
 * 심층 검사는 DSQ-60(Trijsburg & Bond; Thygesen 외, 2008; 30개 방어 × 2문항). 둘 다 9점 척도이며 역채점이 없습니다.
 * 방어 점수는 두 문항의 평균입니다. DSQ-60 채점 키는 Crașovan & Maricuțoiu(2012)의 부록을 따랐습니다.
 * DSQ의 저작권은 개발자(Bond)에게 있으며 연구·교육 목적의 비상업적 사용을 전제로 합니다.
 * 문장은 SelfMap이 옮긴 한국어로, 공식 한국어판과 다를 수 있습니다.
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

const dsq60Texts = [
  dsq40Texts[0],
  "사람들은 나를 자주 뾰로통한 사람이라고 한다.",
  dsq40Texts[1],
  dsq40Texts[2],
  "사람에 대한 생각이 자주 바뀐다. 어떤 때는 대단하게 여기다가 어떤 때는 쓸모없다고 생각한다.",
  dsq40Texts[3],
  dsq40Texts[4],
  dsq40Texts[5],
  dsq40Texts[6],
  "누군가와 갈등이 생기면 그 일에서 내 몫은 무엇이었는지 생각해 본다.",
  dsq40Texts[7],
  "함께 있는 사람들보다 내가 낫다고 느낄 때가 많다.",
  "누군가 내가 가진 모든 것을 감정적으로 빼앗아 가고 있다.",
  "정말 위험할 때, 마치 내가 거기 없는 것처럼 두려움을 느끼지 않는다.",
  "부당한 대우를 받으면 내 권리를 주장한다.",
  "슈퍼맨이라도 된 것처럼 위험을 다룬다.",
  dsq40Texts[9],
  dsq40Texts[10],
  "사실 나는 꽤 쓸모없는 사람이다.",
  "사람들을 대하다 보면 그 사람들도 결국 내가 느끼는 감정을 느끼게 된다.",
  dsq40Texts[13],
  "화가 나면 물러나 버린다.",
  "어려움에 처하면 현실이 아닌 것처럼 느껴질 때가 많다.",
  dsq40Texts[14],
  "내 감정보다는 추상적인 것에 대해 이야기하는 편이 좋다.",
  dsq40Texts[15],
  dsq40Texts[16],
  "사람들이 나에게 화를 내면, 그들이 과장하고 있다고 생각하는 편이다.",
  dsq40Texts[18],
  "누군가 나에게 화를 내면, 평소엔 넘기던 일에도 짜증이 나는 편이다.",
  dsq40Texts[19],
  "초등학교 시절의 일이 거의 기억나지 않는다.",
  "슬프면 물러나 버린다.",
  dsq40Texts[20],
  "사실 나는 사람들이 생각하는 것보다 못한 사람이다.",
  dsq40Texts[21],
  dsq40Texts[22],
  dsq40Texts[23],
  "불쾌한 일을 겪으면 다음 날 무슨 일이었는지 잊어버릴 때가 있다.",
  "다른 사람을 도우면 기분이 좋아진다.",
  dsq40Texts[24],
  dsq40Texts[25],
  dsq40Texts[27],
  "‘누구에게나 좋은 점이 조금은 있다’는 말은 틀렸다. 나쁜 사람은 완전히 나쁘다.",
  "내가 한 일이 잘 안 되면, 무엇을 놓쳤는지 알아보려 한다.",
  "사람들은 나에게 정직하지 않은 편이다.",
  dsq40Texts[29],
  dsq40Texts[30],
  dsq40Texts[31],
  "누군가 나를 거슬리게 하면, 상대의 감정을 상하게 하지 않으면서 그 사실을 말한다.",
  dsq40Texts[33],
  "기분이 안 좋을 때 누군가와 함께 있으려 한다.",
  dsq40Texts[34],
  dsq40Texts[35],
  "내가 느끼는 것을 그대로 말하기보다 내 생각을 길게 설명한다.",
  dsq40Texts[36],
  "우울하거나 불안할 때 창의적이거나 몸을 쓰는 활동을 하고 싶어진다.",
  "위기에 처하면 걱정을 함께 나눌 사람을 찾을 것이다.",
  dsq40Texts[39],
  "신나는 일이 생기면 사소한 세부 사항에 지나치게 신경 쓰는 편이다.",
] as const;

const dsq60Key: Key = {
  altruism: [1, 40], passiveAggression: [2, 37], suppression: [3, 41], sublimation: [4, 57], splittingOther: [5, 36],
  rationalization: [6, 26], humor: [7, 42], projection: [8, 46], reactionFormation: [9, 43], selfObservation: [10, 45],
  denial: [11, 28], devaluationOther: [12, 17], projectiveIdentification: [13, 20], dissociation: [14, 23], selfAssertion: [15, 50],
  omnipotence: [16, 24], actingOut: [18, 31], devaluationSelf: [19, 35], fantasy: [21, 27], withdrawal: [22, 33],
  intellectualization: [25, 55], splittingSelf: [29, 44], displacement: [30, 60], repression: [32, 39], idealization: [34, 38],
  isolation: [51, 56], helpRejectingComplaining: [48, 54], undoing: [49, 59], anticipation: [47, 53], affiliation: [52, 58],
};

export const dsq60 = fromKey("dsq60", "dsq60-ko-selfmap-v1", dsq60Texts, dsq60Key);
