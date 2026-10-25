import type { DefenseId, DefenseMeta, DefenseTierId, DefenseTierMeta } from "../types/defense";

/** 세 방어 스타일. 모든 사람이 상황에 따라 세 스타일을 모두 씁니다. */
export const defenseTiers = [
  { id: "adaptive", name: "성숙한 방어", academicName: "Mature", description: "불편한 감정을 알아차리면서도 현실과 관계를 지키는 방식이에요." },
  { id: "inhibitory", name: "신경증적 방어", academicName: "Neurotic", description: "감정을 마음속에서 바꾸거나 거리를 두어 다루는 방식이에요. 일상을 지켜 주지만 감정이 남을 수 있어요." },
  { id: "immediate", name: "미성숙한 방어", academicName: "Immature", description: "강한 스트레스 앞에서 현실이나 감정을 빠르게 밀어내는 방식이에요. 순간은 버티게 하지만 관계에 비용이 생길 수 있어요." },
] as const satisfies readonly DefenseTierMeta[];

/** 방어기제 설명. level은 DMRS(Perry, 1990) 위계의 단계입니다. */
export const defenseMechanisms: readonly DefenseMeta[] = [
  { id: "sublimation", name: "승화", englishName: "Sublimation", level: 7, summary: "감정의 에너지를 창작·운동·일처럼 가치 있는 활동으로 옮겨요.", protects: "감정을 억누르지 않고 표현할 통로가 돼요.", cost: "활동에만 몰두하면 원인이 된 문제를 늦게 다룰 수 있어요." },
  { id: "humor", name: "유머", englishName: "Humor", level: 7, summary: "어려운 상황의 우스운 면을 보며 긴장을 풀어요.", protects: "고통을 부정하지 않으면서 생각할 여유를 줘요.", cost: "진지해야 할 순간에 가볍게 보일 수 있어요." },
  { id: "anticipation", name: "예상", englishName: "Anticipation", level: 7, summary: "다가올 어려움과 감정을 미리 떠올리고 준비해요.", protects: "막연한 불안을 줄이고 덜 흔들리게 해요.", cost: "준비가 지나치면 걱정이 길어질 수 있어요." },
  { id: "suppression", name: "억제", englishName: "Suppression", level: 7, summary: "지금 다룰 수 없는 걱정을 의식적으로 잠시 미뤄 둬요.", protects: "해야 할 일에 집중하게 해 줘요.", cost: "‘나중’이 계속 미뤄지면 감정이 쌓일 수 있어요." },
  { id: "affiliation", name: "도움 요청", englishName: "Affiliation", level: 7, summary: "어려움을 믿을 만한 사람과 나누며 도움을 구해요.", protects: "지지와 다른 관점을 얻어 고립감을 줄여요.", cost: "한 사람에게만 기대면 상대가 부담을 느낄 수 있어요." },
  { id: "altruism", name: "이타주의", englishName: "Altruism", level: 7, summary: "다른 사람을 돕는 데서 의미와 위안을 찾아요.", protects: "무력감을 줄이고 관계 속 의미를 줘요.", cost: "내 필요를 뒤로 미루게 될 수 있어요." },
  { id: "selfAssertion", name: "자기주장", englishName: "Self-assertion", level: 7, summary: "감정과 생각을 상대를 해치지 않으면서 분명히 표현해요.", protects: "갈등을 숨기지 않고 건강하게 다루게 해요.", cost: "관계에 따라 부딪힘이 생길 수 있어요." },
  { id: "selfObservation", name: "자기관찰", englishName: "Self-observation", level: 7, summary: "어려운 일 뒤에 내 몫과 내 반응을 돌아봐요.", protects: "같은 패턴을 알아차리고 바꿀 힘을 줘요.", cost: "지나치면 자기비판으로 흐를 수 있어요." },
  { id: "intellectualization", name: "주지화", englishName: "Intellectualization", level: 6, summary: "감정보다 분석과 설명에 집중해 거리를 둬요.", protects: "압도되지 않고 판단력을 지켜 줘요.", cost: "감정이 다뤄지지 않은 채 남을 수 있어요." },
  { id: "isolation", name: "감정 고립", englishName: "Isolation of affect", level: 6, summary: "사건은 기억하지만 그에 따르는 감정은 느끼지 않아요.", protects: "강한 감정에 휩쓸리지 않게 해 줘요.", cost: "주변에서 감정을 숨긴다고 느낄 수 있어요." },
  { id: "undoing", name: "취소", englishName: "Undoing", level: 6, summary: "불편한 생각이나 행동을 반대 행동으로 지우려 해요.", protects: "죄책감과 불안을 빠르게 덜어 줘요.", cost: "필요한 주장까지 거둬들이게 될 수 있어요." },
  { id: "repression", name: "억압", englishName: "Repression", level: 5, summary: "불편한 기억이나 감정이 의식에서 밀려나요.", protects: "감당하기 힘든 내용을 당장 마주하지 않게 해요.", cost: "이유 모를 불편감으로 남을 수 있어요." },
  { id: "dissociation", name: "해리", englishName: "Dissociation", level: 5, summary: "힘든 순간에 현실감이나 감정이 잠시 끊긴 듯 느껴져요.", protects: "압도적인 고통에서 잠시 벗어나게 해요.", cost: "위험이나 필요한 감정을 놓칠 수 있어요." },
  { id: "reactionFormation", name: "반동형성", englishName: "Reaction formation", level: 5, summary: "받아들이기 어려운 감정과 반대되는 태도를 보여요.", protects: "갈등을 피하고 관계의 겉모습을 지켜요.", cost: "진짜 감정이 쌓여 지치게 할 수 있어요." },
  { id: "displacement", name: "전치", englishName: "Displacement", level: 5, summary: "감정을 원래 대상 대신 더 안전한 대상이나 행동으로 옮겨요.", protects: "위험한 갈등을 피하면서 감정을 내보내요.", cost: "엉뚱한 사람이 감정을 받거나 원인이 남을 수 있어요." },
  { id: "pseudoAltruism", name: "가성 이타주의", englishName: "Pseudo-altruism", level: 5, summary: "남을 돕는 일로 내 필요와 불안을 대신 채워요.", protects: "쓸모 있다는 느낌으로 불안을 덜어 줘요.", cost: "도울 수 없게 되면 크게 흔들릴 수 있어요." },
  { id: "idealization", name: "이상화", englishName: "Idealization", level: 4, summary: "누군가를 흠 없이 완벽한 존재로 여겨요.", protects: "기댈 수 있는 든든함을 줘요.", cost: "실망했을 때 크게 무너질 수 있어요." },
  { id: "devaluation", name: "평가절하", englishName: "Devaluation", level: 4, summary: "나나 다른 사람을 깎아내려 불편함을 줄여요.", protects: "상처받을 가능성을 줄여 줘요.", cost: "관계가 멀어지거나 스스로를 낮추게 될 수 있어요." },
  { id: "devaluationOther", name: "타인 평가절하", englishName: "Devaluation of other", level: 4, summary: "다른 사람을 깎아내려 내 불편함을 줄여요.", protects: "내가 작아지는 느낌을 막아 줘요.", cost: "관계에 거리와 갈등이 생길 수 있어요." },
  { id: "devaluationSelf", name: "자기 평가절하", englishName: "Devaluation of self", level: 4, summary: "나를 깎아내려 기대와 실망을 미리 막아요.", protects: "더 큰 실망을 피하게 해 줘요.", cost: "자신감과 기회를 스스로 줄일 수 있어요." },
  { id: "omnipotence", name: "전능감", englishName: "Omnipotence", level: 4, summary: "나는 특별해서 문제없다고 느끼며 약함을 가려요.", protects: "무력감과 불안을 잠시 덮어 줘요.", cost: "도움이 필요할 때 놓칠 수 있어요." },
  { id: "denial", name: "부인", englishName: "Denial", level: 3, summary: "불편한 사실이나 감정을 없는 것처럼 대해요.", protects: "감당하기 어려운 충격을 늦춰 줘요.", cost: "필요한 대처가 늦어질 수 있어요." },
  { id: "projection", name: "투사", englishName: "Projection", level: 3, summary: "내 안의 불편한 감정을 다른 사람의 것으로 봐요.", protects: "내 감정을 마주하는 부담을 줄여요.", cost: "상대를 오해해 관계가 어긋날 수 있어요." },
  { id: "rationalization", name: "합리화", englishName: "Rationalization", level: 3, summary: "그럴듯한 이유를 붙여 불편한 감정을 덮어요.", protects: "자존감을 지키고 마음을 진정시켜요.", cost: "진짜 이유를 돌아볼 기회를 놓칠 수 있어요." },
  { id: "fantasy", name: "공상", englishName: "Autistic fantasy", level: 3, summary: "현실의 어려움 대신 공상 속에서 만족을 찾아요.", protects: "힘든 현실에서 잠시 숨 돌리게 해 줘요.", cost: "현실의 문제가 그대로 남을 수 있어요." },
  { id: "splitting", name: "분리", englishName: "Splitting", level: 2, summary: "사람이나 나를 ‘전부 좋음/전부 나쁨’으로 나눠 봐요.", protects: "복잡한 감정을 단순하게 정리해 줘요.", cost: "관계가 극단적으로 흔들리기 쉬워요." },
  { id: "splittingOther", name: "타인 분리", englishName: "Splitting of others", level: 2, summary: "다른 사람을 완전히 좋거나 완전히 나쁜 사람으로 봐요.", protects: "누구를 믿을지 빠르게 정하게 해요.", cost: "작은 실망에도 관계가 크게 바뀔 수 있어요." },
  { id: "splittingSelf", name: "자기 분리", englishName: "Splitting of self", level: 2, summary: "나를 완전히 좋거나 완전히 나쁜 존재로 오가며 봐요.", protects: "복잡한 자기감정을 단순하게 정리해요.", cost: "자기평가가 크게 흔들릴 수 있어요." },
  { id: "projectiveIdentification", name: "투사적 동일시", englishName: "Projective identification", level: 2, summary: "내 감정을 상대에게 옮기고, 상대가 그렇게 느끼게 만들어요.", protects: "감당하기 힘든 감정을 밖으로 내보내요.", cost: "관계가 같은 갈등을 반복하기 쉬워요." },
  { id: "actingOut", name: "행동화", englishName: "Acting out", level: 1, summary: "감정을 생각하기 전에 행동으로 바로 내보내요.", protects: "견디기 힘든 긴장을 빠르게 풀어 줘요.", cost: "후회하거나 관계에 상처가 남을 수 있어요." },
  { id: "passiveAggression", name: "수동공격", englishName: "Passive aggression", level: 1, summary: "화를 직접 말하지 않고 지연·실수처럼 우회해서 드러내요.", protects: "정면 갈등을 피하면서 감정을 표현해요.", cost: "상대는 이유를 모른 채 불편해질 수 있어요." },
  { id: "helpRejectingComplaining", name: "도움 거부 불평", englishName: "Help-rejecting complaining", level: 1, summary: "도움을 구하면서도 주어지는 도움을 받아들이지 못해요.", protects: "기대했다가 실망하는 아픔을 피하게 해요.", cost: "도우려는 사람이 지칠 수 있어요." },
  { id: "withdrawal", name: "철수", englishName: "Apathetic withdrawal", level: 1, summary: "화나거나 슬플 때 사람과 상황에서 물러나요.", protects: "감정이 커지는 상황에서 벗어나게 해요.", cost: "도움과 연결이 끊길 수 있어요." },
  { id: "somatization", name: "신체화", englishName: "Somatization", level: 1, summary: "마음의 부담이 두통·복통 같은 몸의 불편으로 나타나요.", protects: "감정을 직접 마주하지 않게 해요.", cost: "원인이 된 감정이 다뤄지지 않을 수 있어요." },
];

const metaById = new Map<DefenseId, DefenseMeta>(defenseMechanisms.map((item) => [item.id, item]));

export function defenseMeta(id: DefenseId): DefenseMeta {
  return metaById.get(id)!;
}

export function tierMeta(id: DefenseTierId): DefenseTierMeta {
  return defenseTiers.find((tier) => tier.id === id)!;
}

export const defenseMeasurementNote = "방어기제는 상당 부분 의식하지 못한 채 작동해요. 이 결과는 ‘내가 알아차린 나의 방식’에 가깝습니다.";
