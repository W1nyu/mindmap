import type { ScaleMeta } from "../types/assessment";
import { buildInstrument, frequency5 } from "./instrument-kit";

/**
 * 정서조절곤란 척도(DERS; Gratz & Roemer, 2004)와 단축형 DERS-18(Victor & Klonsky, 2016).
 * 하위척도 이름은 한국판 K-DERS(조용래, 2007)의 표기를 따릅니다.
 * 두 판 모두 같은 여섯 하위척도를 재며, 점수가 높을수록 그 영역의 조절이 어렵다는 뜻입니다.
 * DERS는 비용 없이 쓸 수 있는 공개 척도입니다. 문장은 한국판 K-DERS(조용래, 2007, 한국심리학회지: 임상 26(4)) 부록 1을 따릅니다.
 */
export const emotionIds = ["nonacceptance", "goals", "impulse", "awareness", "strategies", "clarity"] as const;
export type EmotionId = (typeof emotionIds)[number];

export interface EmotionMeta extends ScaleMeta<EmotionId> {
  english: string;
  /** 이 영역이 비교적 잘 되는 편일 때 */
  strength: string;
  /** 이 영역이 어려운 편일 때 */
  difficulty: string;
}

export const emotionMeta: readonly EmotionMeta[] = [
  { id: "nonacceptance", name: "정서에 대한 비수용성", shortName: "비수용성", english: "Nonacceptance", description: "속상한 감정을 느끼는 나를 탓하거나 부끄러워하는 정도",
    strength: "힘든 감정이 올라와도 ‘그럴 수 있지’ 하고 받아들이는 편이에요.", difficulty: "속상한 감정을 느끼는 나 자신을 탓하거나 부끄러워할 때가 많을 수 있어요." },
  { id: "goals", name: "목표지향행동의 어려움", shortName: "목표지향행동", english: "Goals", description: "속상할 때 하던 일에 집중하고 해내기 어려운 정도",
    strength: "감정이 흔들려도 해야 할 일에 다시 주의를 돌리는 편이에요.", difficulty: "속상하면 집중이 흩어져 하던 일을 이어가기 어려울 수 있어요." },
  { id: "impulse", name: "충동통제곤란", shortName: "충동통제", english: "Impulse", description: "속상할 때 행동을 통제하기 어려운 정도",
    strength: "감정이 커도 행동은 스스로 고를 수 있는 편이에요.", difficulty: "감정이 클 때 생각보다 먼저 행동이 나갈 수 있어요." },
  { id: "awareness", name: "정서에 대한 주의와 자각 부족", shortName: "정서 자각", english: "Awareness", description: "내 감정에 주의를 기울이고 인정하지 않는 정도",
    strength: "지금 내가 무엇을 느끼는지 주의를 기울이고 인정하는 편이에요.", difficulty: "감정을 지나치거나 대수롭지 않게 넘길 때가 많을 수 있어요." },
  { id: "strategies", name: "정서조절전략에 대한 접근 제한", shortName: "조절전략 접근", english: "Strategies", description: "속상할 때 나아질 방법이 없다고 느끼는 정도",
    strength: "속상해도 결국 나아질 방법을 찾을 수 있다고 믿는 편이에요.", difficulty: "한번 가라앉으면 빠져나올 방법이 없다고 느끼기 쉬울 수 있어요." },
  { id: "clarity", name: "정서적 명료성 부족", shortName: "정서 명료성", english: "Clarity", description: "지금 느끼는 감정이 무엇인지 헷갈리는 정도",
    strength: "지금 느끼는 감정이 무엇인지 비교적 분명히 아는 편이에요.", difficulty: "느끼는 감정이 무엇인지 이름 붙이기 어려울 때가 많을 수 있어요." },
];

/**
 * DERS-36 문항(원 번호 순서). 문장은 한국판 K-DERS(조용래, 2007) 부록 1,
 * 하위척도와 역채점(1, 2, 6, 7, 8, 10, 17, 20, 22, 24, 34)은 원판 Gratz & Roemer(2004) 키입니다.
 */
const dersItems: readonly (readonly [string, EmotionId, boolean?])[] = [
  ["나는 내 감정에 대해 분명하게 알고 있다.", "clarity", true],
  ["내가 어떻게 느끼는지에 주의를 기울인다.", "awareness", true],
  ["나는 감정에 압도되고 감정을 통제하기 힘들다고 여긴다.", "impulse"],
  ["내가 어떻게 느끼고 있는지를 알지 못한다.", "clarity"],
  ["내 감정을 이해하기 어렵다.", "clarity"],
  ["나는 내 감정에 주의를 기울인다.", "awareness", true],
  ["내가 어떻게 느끼고 있는지를 정확하게 안다.", "clarity", true],
  ["내가 느끼고 있는 것에 관심이 있다.", "awareness", true],
  ["내가 느끼는 감정(방식)에 대해 혼란스럽다.", "clarity"],
  ["나는 화가 나거나 기분이 나쁠 때, 내 감정을 알아차린다.", "awareness", true],
  ["나는 화가 나거나 기분이 나쁘면, 그렇게 느끼는 나 자신에게 화가 난다.", "nonacceptance"],
  ["나는 화가 나거나 기분이 나쁘면, 그렇게 느끼는 것에 대해 당황하게 된다.", "nonacceptance"],
  ["나는 화가 나거나 기분이 나쁘면, 일을 끝마치기가 어렵다.", "goals"],
  ["나는 화가 나거나 기분이 나쁘면, 자제하지 못한다.", "impulse"],
  ["나는 화가 나거나 기분이 나쁘면, 오랫동안 내가 그런 상태로 있을 것이라고 믿는다.", "strategies"],
  ["나는 화가 나거나 기분이 나쁘면, 결국에는 내가 아주 우울하게 느낄 것이라고 믿는다.", "strategies"],
  ["나는 화가 나거나 기분이 나쁘면, 내 감정이 타당하고 중요하다고 믿는다.", "awareness", true],
  ["나는 화가 나거나 기분이 나쁘면, 다른 일들에 집중하기가 어렵다.", "goals"],
  ["나는 화가 나거나 기분이 나쁘면, 자제하지 못한다고 느낀다.", "impulse"],
  ["나는 화가 나거나 기분이 나쁘더라도, 여전히 일은 끝마칠 수 있다.", "goals", true],
  ["나는 화가 나거나 기분이 나쁘면, 그렇게 느끼는 것에 대해 부끄럽게 느낀다.", "nonacceptance"],
  ["나는 화가 나거나 기분이 나쁘면, 궁극적으로 기분이 더 좋아지는 방법을 내가 찾아낼 수 있다고 믿는다.", "strategies", true],
  ["나는 화가 나거나 기분이 나쁘면, 내가 나약한 사람처럼 느껴진다.", "nonacceptance"],
  ["나는 화가 나거나 기분이 나쁘더라도, 내 행동을 통제할 수 있는 것처럼 느껴진다.", "impulse", true],
  ["나는 화가 나거나 기분이 나쁘면, 그렇게 느끼는 것에 대해 죄책감을 느낀다.", "nonacceptance"],
  ["나는 화가 나거나 기분이 나쁘면, 집중하기가 어렵다.", "goals"],
  ["나는 화가 나거나 기분이 나쁘면, 내 행동을 통제하기가 어렵다.", "impulse"],
  ["나는 화가 나거나 기분이 나쁘면, 내 기분을 더 좋아지게 하기 위하여 내가 할 수 있는 일이 아무것도 없다고 믿는다.", "strategies"],
  ["나는 화가 나거나 기분이 나쁘면, 그렇게 느끼는 나 자신에게 짜증이 난다.", "nonacceptance"],
  ["나는 화가 나거나 기분이 나쁘면, 나 자신에 대해 기분이 매우 나빠지기 시작한다.", "strategies"],
  ["나는 화가 나거나 기분이 나쁘면, 그 상태에 빠져 허우적거리는 것이 내가 할 수 있는 모든 것이라고 믿는다.", "strategies"],
  ["나는 화가 나거나 기분이 나쁘면, 내 행동에 대한 통제력을 잃어버린다.", "impulse"],
  ["나는 화가 나거나 기분이 나쁘면, 다른 어떤 일에 대해서도 생각하기가 어렵다.", "goals"],
  ["나는 화가 나거나 기분이 나쁘면, 내가 진정으로 느끼고 있는 것이 무엇인지 신중하게 이해한다.", "awareness", true],
  ["나는 화가 나거나 기분이 나쁘면, 내 기분이 더 좋아지는데 오랜 시간이 걸린다.", "strategies"],
  ["나는 화가 나거나 기분이 나쁘면, 내 감정들에 의해 압도당하는 것처럼 느껴진다.", "strategies"],
];

export const ders36 = buildInstrument<EmotionId>({
  id: "ders36", version: "ders36-kders-v1", options: frequency5, scaleIds: emotionIds,
  items: dersItems.map(([text, scale, reverse]) => [text, scale, reverse]),
});

/** DERS-18(Victor & Klonsky, 2016)에 남은 원 문항 번호. 같은 K-DERS 문장을 씁니다. */
export const DERS18_SOURCE_ITEMS = [2, 4, 5, 6, 9, 10, 12, 13, 14, 15, 16, 18, 21, 25, 26, 27, 31, 32] as const;

export const ders18 = buildInstrument<EmotionId>({
  id: "ders18", version: "ders18-kders-v1", options: frequency5, scaleIds: emotionIds,
  items: DERS18_SOURCE_ITEMS.map((number) => {
    const [text, scale, reverse] = dersItems[number - 1];
    return [text, scale, reverse];
  }),
});
