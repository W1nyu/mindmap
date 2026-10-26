import type { ScaleMeta } from "../types/assessment";
import { buildInstrument } from "./instrument-kit";

/**
 * 상태 정서조절곤란 척도(S-DERS; Lavender, Tull, DiLillo, Messman-Moore & Gratz, 2017, Assessment 24(2)).
 * DERS를 ‘지금 이 순간’의 상태로 옮긴 21문항이며, 반복 측정을 위해 만들어졌습니다.
 * 문항과 하위척도는 논문 표 2, 응답(1 전혀 아니다 – 5 완전히 그렇다)과 채점(하위척도 합, 정서 자각 문항 역채점)은 본문을 따릅니다.
 * 문항 순서는 개발 단계 28문항 중 남은 문항의 원 번호 순서입니다. 문장은 SelfMap이 옮긴 한국어입니다.
 */
export const stateEmotionIds = ["nonacceptance", "modulate", "awareness", "clarity"] as const;
export type StateEmotionId = (typeof stateEmotionIds)[number];

export const stateEmotionMeta: readonly (ScaleMeta<StateEmotionId> & { english: string })[] = [
  { id: "nonacceptance", name: "현재 정서에 대한 비수용성", shortName: "비수용성", english: "Non-acceptance", description: "지금 느끼는 감정 때문에 나를 탓하거나 부끄러워하는 정도" },
  { id: "modulate", name: "현재 정서·행동 조절의 어려움", shortName: "조절 어려움", english: "Modulate", description: "지금의 감정과 행동을 다스리기 어려운 정도" },
  { id: "awareness", name: "현재 정서 자각 부족", shortName: "자각 부족", english: "Awareness", description: "지금의 감정에 주의를 기울이지 않는 정도" },
  { id: "clarity", name: "현재 정서 명료성 부족", shortName: "명료성 부족", english: "Clarity", description: "지금 무엇을 느끼는지 헷갈리는 정도" },
];

export const stateEmotionOptions = ["전혀 아니다", "약간 그렇다", "어느 정도 그렇다", "꽤 그렇다", "완전히 그렇다"].map((label, value) => ({ value, label }));

export const sders = buildInstrument<StateEmotionId>({
  id: "s-ders", version: "s-ders-ko-selfmap-v1", options: stateEmotionOptions, scaleIds: stateEmotionIds,
  items: [
    ["그렇게 느끼는 것에 죄책감이 든다.", "nonacceptance"],
    ["내 기분에 주의를 기울이고 있다.", "awareness", true],
    ["통제할 수 없는 것 같다.", "modulate"],
    ["그렇게 느끼는 것이 창피하다.", "nonacceptance"],
    ["나 자신이 몹시 못마땅하게 느껴진다.", "nonacceptance"],
    ["내 감정을 인정하고 있다.", "awareness", true],
    ["내가 어떤 기분인지 전혀 모르겠다.", "clarity"],
    ["그렇게 느끼는 내가 부끄럽다.", "nonacceptance"],
    ["지금 해야 할 일을 하기가 어렵다.", "modulate"],
    ["이 기분이 오래 계속될 것 같다.", "modulate"],
    ["내가 무엇을 느끼는지 중요하게 여기고 있다.", "awareness", true],
    ["그렇게 느끼는 나 자신에게 화가 난다.", "nonacceptance"],
    ["내 행동을 통제하기 어렵다.", "modulate"],
    ["내 기분이 어떤지 헷갈린다.", "clarity"],
    ["결국 몹시 우울해질 것 같다.", "modulate"],
    ["내가 정말 무엇을 느끼는지 시간을 들여 알아보고 있다.", "awareness", true],
    ["감정이 통제할 수 없게 느껴진다.", "modulate"],
    ["그렇게 느끼는 나 자신에게 짜증이 난다.", "nonacceptance"],
    ["내 감정이 타당하고 중요하다고 믿는다.", "awareness", true],
    ["그렇게 느끼는 내가 약한 사람처럼 느껴진다.", "nonacceptance"],
    ["감정이 감당하기 벅차게 느껴진다.", "modulate"],
  ],
});
