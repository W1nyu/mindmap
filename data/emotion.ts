import type { ScaleMeta } from "../types/assessment";
import { buildInstrument, frequency5 } from "./instrument-kit";

/**
 * 정서조절곤란 척도(DERS; Gratz & Roemer, 2004)와 단축형 DERS-18(Victor & Klonsky, 2016).
 * 하위척도 이름은 한국판 K-DERS(조용래, 2007)의 표기를 따릅니다.
 * 두 판 모두 같은 여섯 하위척도를 재며, 점수가 높을수록 그 영역의 조절이 어렵다는 뜻입니다.
 * DERS는 비용 없이 쓸 수 있는 공개 척도입니다. 문장은 SelfMap이 옮긴 한국어로, 공식 한국어판과 다를 수 있습니다.
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

/** DERS-36: 원 문항 번호 순서. R은 역채점. */
export const ders36 = buildInstrument<EmotionId>({
  id: "ders36", version: "ders36-ko-selfmap-v1", options: frequency5, scaleIds: emotionIds,
  items: [
    ["내 감정이 무엇인지 분명히 안다.", "clarity", true],
    ["내 기분에 주의를 기울인다.", "awareness", true],
    ["감정이 압도적이고 통제할 수 없게 느껴진다.", "impulse"],
    ["내가 어떤 기분인지 전혀 모르겠다.", "clarity"],
    ["내 감정을 이해하기 어렵다.", "clarity"],
    ["내 감정을 세심하게 살핀다.", "awareness", true],
    ["내가 어떤 기분인지 정확히 안다.", "clarity", true],
    ["내가 무엇을 느끼는지 중요하게 여긴다.", "awareness", true],
    ["내 기분이 어떤지 헷갈린다.", "clarity"],
    ["속상할 때, 내 감정을 인정한다.", "awareness", true],
    ["속상할 때, 그렇게 느끼는 나 자신에게 화가 난다.", "nonacceptance"],
    ["속상할 때, 그렇게 느끼는 것이 창피하다.", "nonacceptance"],
    ["속상할 때, 일을 해내기 어렵다.", "goals"],
    ["속상할 때, 통제력을 잃는다.", "impulse"],
    ["속상할 때, 이 상태가 오래 갈 거라고 믿는다.", "strategies"],
    ["속상할 때, 결국 몹시 우울해질 거라고 믿는다.", "strategies"],
    ["속상할 때, 내 감정이 타당하고 중요하다고 믿는다.", "awareness", true],
    ["속상할 때, 다른 일에 집중하기 어렵다.", "goals"],
    ["속상할 때, 통제할 수 없다고 느낀다.", "impulse"],
    ["속상할 때도, 해야 할 일은 해낼 수 있다.", "goals", true],
    ["속상할 때, 그렇게 느끼는 내가 부끄럽다.", "nonacceptance"],
    ["속상할 때, 결국 나아질 방법을 찾을 수 있다는 걸 안다.", "strategies", true],
    ["속상할 때, 내가 약한 사람처럼 느껴진다.", "nonacceptance"],
    ["속상할 때도, 내 행동을 통제할 수 있다고 느낀다.", "impulse", true],
    ["속상할 때, 그렇게 느끼는 것에 죄책감이 든다.", "nonacceptance"],
    ["속상할 때, 집중하기 어렵다.", "goals"],
    ["속상할 때, 내 행동을 통제하기 어렵다.", "impulse"],
    ["속상할 때, 기분을 나아지게 할 방법이 아무것도 없다고 믿는다.", "strategies"],
    ["속상할 때, 그렇게 느끼는 나 자신에게 짜증이 난다.", "nonacceptance"],
    ["속상할 때, 나 자신이 매우 못마땅하게 느껴지기 시작한다.", "strategies"],
    ["속상할 때, 그 기분에 빠져 있는 것 말고는 할 수 있는 게 없다고 믿는다.", "strategies"],
    ["속상할 때, 내 행동에 대한 통제력을 잃는다.", "impulse"],
    ["속상할 때, 다른 것은 생각하기 어렵다.", "goals"],
    ["속상할 때, 내가 정말 무엇을 느끼는지 시간을 들여 알아본다.", "awareness", true],
    ["속상할 때, 기분이 나아지기까지 오래 걸린다.", "strategies"],
    ["속상할 때, 감정이 감당하기 벅차게 느껴진다.", "strategies"],
  ],
});

/** DERS-18: Victor & Klonsky(2016) 원 문항 번호 순서. 정서 자각 세 문항은 역채점. */
export const ders18 = buildInstrument<EmotionId>({
  id: "ders18", version: "ders18-ko-selfmap-v1", options: frequency5, scaleIds: emotionIds,
  items: [
    ["내 기분에 주의를 기울인다.", "awareness", true],
    ["내가 어떤 기분인지 전혀 모르겠다.", "clarity"],
    ["내 감정을 이해하기 어렵다.", "clarity"],
    ["내 감정을 세심하게 살핀다.", "awareness", true],
    ["내 기분이 어떤지 헷갈린다.", "clarity"],
    ["속상할 때, 내 감정을 인정한다.", "awareness", true],
    ["속상할 때, 그렇게 느끼는 것이 창피하다.", "nonacceptance"],
    ["속상할 때, 일을 해내기 어렵다.", "goals"],
    ["속상할 때, 통제력을 잃는다.", "impulse"],
    ["속상할 때, 이 상태가 오래 갈 거라고 믿는다.", "strategies"],
    ["속상할 때, 결국 몹시 우울해질 거라고 믿는다.", "strategies"],
    ["속상할 때, 다른 일에 집중하기 어렵다.", "goals"],
    ["속상할 때, 그렇게 느끼는 내가 부끄럽다.", "nonacceptance"],
    ["속상할 때, 그렇게 느끼는 것에 죄책감이 든다.", "nonacceptance"],
    ["속상할 때, 집중하기 어렵다.", "goals"],
    ["속상할 때, 내 행동을 통제하기 어렵다.", "impulse"],
    ["속상할 때, 그 기분에 빠져 있는 것 말고는 할 수 있는 게 없다고 믿는다.", "strategies"],
    ["속상할 때, 내 행동에 대한 통제력을 잃는다.", "impulse"],
  ],
});
