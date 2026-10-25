import type { LikertInstrument, LikertItem } from "../types/assessment";
import { traitIds, type TraitId, type TraitMeta } from "../types/traits";

export const TRAIT_QUESTIONNAIRE_VERSION = "selfmap-traits-20-v1";

/**
 * 성격 5요인 경향. IPIP(International Personality Item Pool, public domain)의
 * Mini-IPIP(Donnellan 외, 2006) 문항을 한국어로 각색했습니다. 개방성은 역채점 균형을 위해
 * IPIP 50문항판의 "Am full of ideas" 문항으로 1개를 바꿨습니다. 한국어판 타당화는 거치지 않았습니다.
 */
export const traitMeta = [
  {
    id: "openness", name: "경험 개방성", shortName: "개방성",
    description: "새로운 생각, 상상, 추상적인 개념에 끌리는 정도",
    lowPole: "익숙하고 검증된 것", highPole: "새롭고 추상적인 것",
    lowStrength: "현실적이고 구체적인 판단, 검증된 방법을 꾸준히 이어가는 힘",
    highStrength: "상상력, 호기심, 새로운 연결을 만드는 힘",
    lowChallenge: "낯선 방식이나 급격한 변화에 적응하는 데 시간이 걸릴 수 있어요.",
    highChallenge: "아이디어가 많아 한 가지를 끝까지 구체화하기 어려울 수 있어요.",
  },
  {
    id: "conscientiousness", name: "성실성", shortName: "성실성",
    description: "계획, 정돈, 해야 할 일을 마무리하는 방식",
    lowPole: "유연하고 즉흥적인", highPole: "계획적이고 정돈된",
    lowStrength: "변화에 빠르게 맞추고 상황에 따라 우선순위를 바꾸는 유연함",
    highStrength: "신뢰할 수 있는 실행력, 꼼꼼한 마무리",
    lowChallenge: "마감이나 정리가 필요한 일에서 흐름을 놓칠 수 있어요.",
    highChallenge: "계획이 어긋날 때 스트레스가 커지거나 스스로에게 엄격해질 수 있어요.",
  },
  {
    id: "extraversion", name: "외향성", shortName: "외향성",
    description: "사람과 활동에서 에너지를 얻고 표현하는 정도",
    lowPole: "조용한 시간에서 에너지", highPole: "사람과 활동에서 에너지",
    lowStrength: "깊이 있는 집중, 신중한 경청, 혼자서도 충전하는 힘",
    highStrength: "관계를 넓히는 친화력, 분위기를 이끄는 표현력",
    lowChallenge: "큰 모임이나 즉석 발언이 많은 자리에서 쉽게 지칠 수 있어요.",
    highChallenge: "자극이 적은 환경에서 답답함을 느끼거나 충분히 쉬지 못할 수 있어요.",
  },
  {
    id: "agreeableness", name: "우호성", shortName: "우호성",
    description: "다른 사람의 감정과 필요에 마음을 쓰는 정도",
    lowPole: "독립적이고 분석적인", highPole: "공감적이고 협력적인",
    lowStrength: "객관적인 판단, 필요한 때 분명하게 이견을 말하는 힘",
    highStrength: "따뜻한 공감, 협력과 신뢰를 만드는 힘",
    lowChallenge: "상대의 감정을 충분히 살피지 않는다고 오해받을 수 있어요.",
    highChallenge: "다른 사람을 챙기느라 내 필요를 뒤로 미룰 수 있어요.",
  },
  {
    id: "negativeEmotionality", name: "정서적 민감성", shortName: "정서 민감성",
    description: "불안, 속상함 같은 감정을 얼마나 자주·강하게 느끼는지",
    lowPole: "감정 변화가 잔잔한", highPole: "감정을 섬세하게 느끼는",
    lowStrength: "압박 속에서도 차분함을 유지하는 안정감",
    highStrength: "위험 신호와 미묘한 감정을 빨리 알아차리는 섬세함",
    lowChallenge: "내 감정이나 다른 사람의 불안 신호를 늦게 알아차릴 수 있어요.",
    highChallenge: "작은 스트레스에도 마음이 오래 흔들려 쉽게 지칠 수 있어요.",
  },
] as const satisfies readonly TraitMeta[];

const itemSpecs: Record<TraitId, readonly (readonly [string, boolean])[]> = {
  openness: [
    ["상상력이 풍부한 편이다.", false],
    ["추상적인 생각에는 별로 흥미가 없다.", true],
    ["새로운 아이디어가 자주 떠오른다.", false],
    ["상상력이 그리 풍부하지 않은 편이다.", true],
  ],
  conscientiousness: [
    ["해야 할 일을 미루지 않고 바로 처리한다.", false],
    ["물건을 제자리에 두는 것을 자주 잊는다.", true],
    ["질서 있고 정돈된 상태를 좋아한다.", false],
    ["일을 어수선하게 벌여 놓을 때가 많다.", true],
  ],
  extraversion: [
    ["모임에서 분위기를 띄우는 역할을 하는 편이다.", false],
    ["말수가 적은 편이다.", true],
    ["모임에서 여러 사람과 두루 이야기를 나눈다.", false],
    ["여럿이 있을 때 눈에 띄지 않게 뒤에 있는 편이다.", true],
  ],
  agreeableness: [
    ["다른 사람의 감정에 공감하는 편이다.", false],
    ["다른 사람의 고민에는 별로 관심이 가지 않는다.", true],
    ["다른 사람의 감정을 내 일처럼 느낄 때가 많다.", false],
    ["다른 사람에게 크게 관심을 두지 않는 편이다.", true],
  ],
  negativeEmotionality: [
    ["기분의 변화가 잦은 편이다.", false],
    ["대부분의 시간 동안 마음이 편안하다.", true],
    ["쉽게 속상해지는 편이다.", false],
    ["울적한 기분을 느끼는 일이 드물다.", true],
  ],
};

/** 같은 요인 문항이 다섯 칸 간격으로 나오도록 요인을 돌아가며 배치합니다. */
export const traitQuestions: readonly LikertItem<TraitId>[] = [0, 1, 2, 3].flatMap((round) => traitIds.map((trait) => ({
  id: `traits-${trait}-${round + 1}`, kind: "likert" as const, text: itemSpecs[trait][round][0],
  scale: trait, reverse: itemSpecs[trait][round][1], weight: 1,
})));

export const traitInstrument: LikertInstrument<TraitId> = {
  id: "traits",
  version: TRAIT_QUESTIONNAIRE_VERSION,
  scaleIds: traitIds,
  items: traitQuestions,
};
