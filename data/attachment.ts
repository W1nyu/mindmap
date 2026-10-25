import { agree7, buildInstrument } from "./instrument-kit";

export const attachmentIds = ["attachmentAnxiety", "attachmentAvoidance"] as const;
export type AttachmentId = (typeof attachmentIds)[number];

/**
 * 성인 애착 두 차원. 간편 검사는 ECR-S 12문항(Wei 외, 2007), 심층 검사는 ECR-R 36문항(Fraley, Waller & Brennan, 2000).
 * 두 척도 모두 7점 척도이며, 비상업적 연구 목적으로는 허가 없이 쓸 수 있도록 공개돼 있습니다.
 * 문장은 SelfMap이 옮긴 한국어입니다. ‘연인’이 없다면 가까운 관계를 떠올려 답해도 됩니다(저자가 대상 수정을 허용).
 */
export const attachmentMeta = [
  {
    id: "attachmentAnxiety", name: "관계 불안", shortName: "관계 불안",
    description: "가까운 사람이 떠나거나 마음이 식을까 봐 걱정하고 확인을 원하는 정도",
    low: "관계를 비교적 믿고 편안하게 지내는 편이에요.",
    high: "관계를 소중히 여기는 만큼 상대의 마음을 확인하고 싶어질 때가 많을 수 있어요.",
  },
  {
    id: "attachmentAvoidance", name: "친밀 회피", shortName: "친밀 회피",
    description: "가까워지거나 의지하는 것이 불편해 거리와 독립을 지키려는 정도",
    low: "가까운 사람과 감정을 나누고 기대는 것이 비교적 자연스러운 편이에요.",
    high: "혼자 해결하는 것이 편한 편이에요. 힘들 때 기댈 기회를 놓칠 수 있어요.",
  },
] as const;

/** ECR-S 12문항(원 순서). 관계 불안: 2, 4, 6, 8R, 10, 12 · 친밀 회피: 1R, 3, 5R, 7, 9R, 11 */
export const ecrS = buildInstrument<AttachmentId>({
  id: "ecr-s", version: "ecr-s-ko-selfmap-v1", options: agree7, scaleIds: attachmentIds,
  items: [
    ["힘들 때 연인에게 기대면 도움이 된다.", "attachmentAvoidance", true],
    ["연인이 나를 사랑한다는 확인을 많이 받아야 한다.", "attachmentAnxiety"],
    ["연인과 가까워지고 싶지만 자꾸 뒤로 물러서게 된다.", "attachmentAvoidance"],
    ["연인이 내가 원하는 만큼 가까워지려 하지 않는다고 느낀다.", "attachmentAnxiety"],
    ["위로와 안심을 비롯해 많은 것을 연인에게 의지한다.", "attachmentAvoidance", true],
    ["아주 가까워지고 싶은 내 마음이 때로 사람들을 멀어지게 한다.", "attachmentAnxiety"],
    ["연인과 너무 가까워지지 않으려고 한다.", "attachmentAvoidance"],
    ["버림받을까 봐 걱정하는 일은 별로 없다.", "attachmentAnxiety", true],
    ["대개 내 문제와 걱정을 연인과 의논한다.", "attachmentAvoidance", true],
    ["필요할 때 연인이 곁에 없으면 답답하고 속상하다.", "attachmentAnxiety"],
    ["연인이 너무 가까이 다가오면 긴장된다.", "attachmentAvoidance"],
    ["연인이 내가 마음 쓰는 만큼 나에게 마음을 쓰지 않을까 봐 걱정한다.", "attachmentAnxiety"],
  ],
});

/** ECR-R 36문항. 저자 웹페이지의 ECRR01–36 번호(1–18 관계 불안, 19–36 친밀 회피)를 따르고, 응답 순서만 두 차원을 번갈아 섞습니다. */
const ecrRAnxiety: readonly (readonly [string, AttachmentId, boolean?])[] = [
  ["연인의 사랑을 잃을까 봐 두렵다.", "attachmentAnxiety"],
  ["연인이 나와 계속 함께하고 싶어 하지 않을까 봐 자주 걱정한다.", "attachmentAnxiety"],
  ["연인이 나를 진심으로 사랑하지 않는 건 아닐까 자주 걱정한다.", "attachmentAnxiety"],
  ["연인이 내가 마음 쓰는 만큼 나에게 마음을 쓰지 않을까 봐 걱정한다.", "attachmentAnxiety"],
  ["연인의 마음이 내 마음만큼 강했으면 하고 자주 바란다.", "attachmentAnxiety"],
  ["연인 관계에 대해 걱정을 많이 한다.", "attachmentAnxiety"],
  ["연인이 눈앞에 없으면 다른 사람에게 관심을 가질까 봐 걱정된다.", "attachmentAnxiety"],
  ["연인에게 내 감정을 보여 줄 때, 상대가 나와 같은 마음이 아닐까 봐 두렵다.", "attachmentAnxiety"],
  ["연인이 나를 떠날까 봐 걱정하는 일은 거의 없다.", "attachmentAnxiety", true],
  ["연인 때문에 나 자신을 의심하게 된다.", "attachmentAnxiety"],
  ["버림받을까 봐 걱정하는 일은 별로 없다.", "attachmentAnxiety", true],
  ["연인이 내가 원하는 만큼 가까워지려 하지 않는다고 느낀다.", "attachmentAnxiety"],
  ["연인의 마음이 뚜렷한 이유 없이 나에게서 달라질 때가 있다.", "attachmentAnxiety"],
  ["아주 가까워지고 싶은 내 마음이 때로 사람들을 멀어지게 한다.", "attachmentAnxiety"],
  ["연인이 나를 제대로 알게 되면 진짜 내 모습을 좋아하지 않을까 봐 두렵다.", "attachmentAnxiety"],
  ["연인에게서 필요한 애정과 지지를 받지 못하면 화가 난다.", "attachmentAnxiety"],
  ["내가 다른 사람들만큼 괜찮지 못할까 봐 걱정한다.", "attachmentAnxiety"],
  ["연인은 내가 화를 낼 때만 나에게 관심을 보이는 것 같다.", "attachmentAnxiety"],
];
const ecrRAvoidance: readonly (readonly [string, AttachmentId, boolean?])[] = [
  ["마음 깊은 곳의 감정을 연인에게 보여 주지 않는 편이 좋다.", "attachmentAvoidance"],
  ["연인과 개인적인 생각과 감정을 나누는 것이 편하다.", "attachmentAvoidance", true],
  ["연인에게 의지하는 것이 어렵다.", "attachmentAvoidance"],
  ["연인과 가까이 지내는 것이 매우 편하다.", "attachmentAvoidance", true],
  ["연인에게 마음을 여는 것이 편하지 않다.", "attachmentAvoidance"],
  ["연인과 너무 가까워지지 않는 편이 좋다.", "attachmentAvoidance"],
  ["연인이 아주 가까워지길 원하면 불편해진다.", "attachmentAvoidance"],
  ["연인과 가까워지는 것이 비교적 쉽다.", "attachmentAvoidance", true],
  ["연인과 가까워지는 것이 어렵지 않다.", "attachmentAvoidance", true],
  ["대개 내 문제와 걱정을 연인과 의논한다.", "attachmentAvoidance", true],
  ["힘들 때 연인에게 기대면 도움이 된다.", "attachmentAvoidance", true],
  ["연인에게 거의 모든 것을 이야기한다.", "attachmentAvoidance", true],
  ["연인과 이런저런 일을 터놓고 이야기한다.", "attachmentAvoidance", true],
  ["연인이 너무 가까이 다가오면 긴장된다.", "attachmentAvoidance"],
  ["연인에게 의지하는 것이 편하다.", "attachmentAvoidance", true],
  ["연인에게 기대는 것이 쉽다.", "attachmentAvoidance", true],
  ["연인에게 애정을 표현하는 것이 쉽다.", "attachmentAvoidance", true],
  ["연인은 나와 내 필요를 정말 잘 이해한다.", "attachmentAvoidance", true],
];

export const ecrR = buildInstrument<AttachmentId>({
  id: "ecr-r", version: "ecr-r-ko-selfmap-v1", options: agree7, scaleIds: attachmentIds,
  items: ecrRAnxiety.flatMap((item, index) => [item, ecrRAvoidance[index]]),
});

/**
 * 네 가지 애착 유형(Bartholomew & Horowitz, 1991)으로 나눌 때의 기준점.
 * Fraley가 공개한 ECR-R 온라인 표본(약 17,000명)의 평균(1–7)을 기준으로 위·아래를 나눕니다.
 * 저자는 차원 점수를 그대로 보길 권하며, 유형은 이해를 돕는 참고 분류입니다.
 */
export const ATTACHMENT_NORMS = { anxiety: 3.56, avoidance: 2.92 } as const;
