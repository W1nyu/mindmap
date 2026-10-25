import type { LikertInstrument, LikertItem } from "../types/assessment";
import type { TraitLeaning } from "../types/traits";

export const attachmentIds = ["attachmentAnxiety", "attachmentAvoidance"] as const;
export type AttachmentId = (typeof attachmentIds)[number];

export const ATTACHMENT_QUESTIONNAIRE_VERSION = "selfmap-attachment-12-v1";

/**
 * 성인 애착의 두 차원(관계 불안·친밀 회피) 모델을 바탕으로 한 자체 작성 문항입니다.
 * Brennan, Clark & Shaver(1998)와 Fraley 외(2000) ECR-R의 구성 개념을 참고했지만 문항을 옮기지 않았습니다.
 * 애착 ‘유형’으로 분류하지 않고 두 연속 차원의 위치로만 보여줍니다.
 */
export const attachmentMeta = [
  {
    id: "attachmentAnxiety", name: "관계 불안", shortName: "관계 불안",
    description: "가까운 사람이 떠나거나 마음이 식을까 봐 걱정하고 확인을 원하는 정도",
    low: "관계를 비교적 믿고 편안하게 지내는 편이에요. 상대의 작은 변화에도 크게 흔들리지 않을 수 있어요.",
    mixed: "상황이나 상대에 따라 관계를 믿는 마음과 걱정하는 마음이 오갈 수 있어요.",
    high: "가까운 관계에 마음을 많이 쓰고, 상대의 마음을 확인하고 싶어질 때가 많을 수 있어요. 그만큼 관계를 소중히 여긴다는 뜻이기도 해요.",
  },
  {
    id: "attachmentAvoidance", name: "친밀 회피", shortName: "친밀 회피",
    description: "가까워지거나 의지하는 것이 불편해 거리와 독립을 지키려는 정도",
    low: "가까운 사람과 감정을 나누고 기대는 것이 비교적 자연스러운 편이에요.",
    mixed: "어떤 관계에서는 쉽게 가까워지고, 어떤 관계에서는 거리를 두고 싶어질 수 있어요.",
    high: "혼자 해결하고 나만의 공간을 지키는 것이 편한 편일 수 있어요. 독립성은 강점이지만, 힘들 때 기댈 기회를 놓칠 수 있어요.",
  },
] as const;

/** 두 차원이 모두 한쪽으로 기울었을 때만 쓰는 결합 설명. 유형 이름을 붙이지 않습니다. */
export const attachmentCombos: Partial<Record<`${TraitLeaning}-${TraitLeaning}`, string>> = {
  "low-low": "관계를 믿으면서도 가까워지는 것이 편한 쪽에 있어요. 갈등이 생겨도 관계 자체를 크게 의심하지 않고 다가가 이야기할 수 있는 바탕이 될 수 있어요.",
  "high-low": "가까움을 원하고 그만큼 관계의 신호에 민감한 쪽에 있어요. 확인을 구하는 대신 내 필요를 직접 말해 보면 마음이 한결 편해질 수 있어요.",
  "low-high": "관계를 크게 걱정하지는 않지만 거리를 두는 편이 편한 쪽에 있어요. 독립성이 강점이지만, 가까운 사람은 다가가기 어렵다고 느낄 수 있어요.",
  "high-high": "가까워지고 싶으면서도 가까워지는 것이 두려운 마음이 함께 있는 쪽에 있어요. 다가가고 물러서기를 반복하며 지칠 수 있으니, 내 속도에 맞는 작은 연결부터 시작해 보세요.",
};

const itemSpecs: Record<AttachmentId, readonly (readonly [string, boolean])[]> = {
  attachmentAnxiety: [
    ["가까운 사람이 나를 정말 아끼는지 자주 확인하고 싶어진다.", false],
    ["상대가 나만큼 이 관계를 원하지 않을까 봐 걱정될 때가 있다.", false],
    ["관계가 안정적이라고 믿고 편안하게 지내는 편이다.", true],
    ["상대의 마음이 나에게서 떠날까 봐 불안해질 때가 있다.", false],
    ["가까운 사람에게 내가 충분하지 않다고 느껴질 때가 있다.", false],
    ["가까운 사람의 애정이나 우정을 크게 의심하지 않는다.", true],
  ],
  attachmentAvoidance: [
    ["가까운 사람에게 속마음을 털어놓는 것이 불편하다.", false],
    ["누군가 나에게 너무 가까이 다가오면 거리를 두고 싶어진다.", false],
    ["가까운 사람과 감정을 나누는 것이 자연스럽다.", true],
    ["다른 사람에게 의지하는 것이 어색하게 느껴진다.", false],
    ["관계가 깊어질수록 나만의 공간이 줄어드는 것 같아 답답하다.", false],
    ["필요할 때 가까운 사람에게 도움을 청하는 것이 편하다.", true],
  ],
};

/** 두 차원을 번갈아 배치합니다. */
export const attachmentQuestions: readonly LikertItem<AttachmentId>[] = [0, 1, 2, 3, 4, 5].flatMap((round) => attachmentIds.map((scale) => ({
  id: `attachment-${scale === "attachmentAnxiety" ? "anxiety" : "avoidance"}-${round + 1}`, kind: "likert" as const,
  text: itemSpecs[scale][round][0], scale, reverse: itemSpecs[scale][round][1], weight: 1,
})));

export const attachmentInstrument: LikertInstrument<AttachmentId> = {
  id: "attachment",
  version: ATTACHMENT_QUESTIONNAIRE_VERSION,
  scaleIds: attachmentIds,
  items: attachmentQuestions,
};
