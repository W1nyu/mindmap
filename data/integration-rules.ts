import type { ModuleId } from "./modules";

export interface IntegrationCondition {
  module: ModuleId;
  scale: string;
  /** high: ≥ 63, low: ≤ 37 */
  level: "high" | "low";
}

export interface IntegrationRule {
  id: string;
  kind: "pattern" | "resource";
  title: string;
  when: readonly IntegrationCondition[];
  text: string;
  strategy: string;
}

/**
 * 서로 다른 모듈의 점수가 함께 높거나 낮을 때의 해석 가설입니다.
 * 관련 모듈을 모두 마쳤을 때만 평가하며, 사실이 아닌 "그럴 수 있는 흐름"으로 제시합니다.
 */
export const integrationRules: readonly IntegrationRule[] = [
  {
    id: "thinking-over-feeling", kind: "pattern", title: "감정을 생각으로 다루는 흐름",
    when: [{ module: "defense", scale: "intellectualization", level: "high" }, { module: "reaction", scale: "emotionalArousal", level: "low" }],
    text: "감정을 분석과 정보로 다루는 주지화가 자주 나타나고, 감정 각성은 낮게 응답됐어요. 감정을 ‘느끼기’보다 ‘이해하기’로 다루는 흐름일 수 있어요.",
    strategy: "하루 한 번, 그날 가장 컸던 감정에 단어 하나를 붙여 보세요. 분석은 그 다음에 해도 늦지 않아요.",
  },
  {
    id: "emotion-seeking-outlet", kind: "pattern", title: "갈 곳을 찾는 감정",
    when: [{ module: "defense", scale: "displacement", level: "high" }, { module: "reaction", scale: "emotionalArousal", level: "high" }],
    text: "감정이 빠르게 올라오고, 원래 대상 대신 더 안전한 곳으로 향하는 경향이 함께 보여요. 가까운 사람이 이유를 모른 채 감정을 받을 수 있어요.",
    strategy: "짜증이 올라올 때 ‘이 감정은 언제, 누구에게서 시작됐지?’를 먼저 메모해 원래 주소를 찾아 보세요.",
  },
  {
    id: "approach-avoid", kind: "pattern", title: "다가가고 싶지만 물러서는 마음",
    when: [{ module: "defense", scale: "withdrawal", level: "high" }, { module: "reaction", scale: "relationshipSensitivity", level: "high" }],
    text: "관계의 신호에 민감하면서도 불편할 때 물러서는 방식이 함께 나타나요. 연결을 원하는 마음과 상처를 피하려는 마음이 동시에 움직일 수 있어요.",
    strategy: "물러서고 싶을 때 ‘조금 쉬고 내일 이야기하고 싶어’처럼 돌아올 시점을 함께 전해 보세요.",
  },
  {
    id: "sensitive-but-alone", kind: "pattern", title: "관계에 민감하지만 도움 요청은 어려운",
    when: [{ module: "defense", scale: "affiliation", level: "low" }, { module: "reaction", scale: "relationshipSensitivity", level: "high" }],
    text: "관계에 주의를 많이 기울이지만, 힘들 때 다른 사람에게 기대는 방식은 드물게 응답됐어요. 관계를 신경 쓰는 만큼 부담을 줄까 봐 혼자 감당할 수 있어요.",
    strategy: "부담이 적은 사람 한 명에게 ‘조언 말고 그냥 들어 줄 수 있어?’라고 작게 요청해 보세요.",
  },
  {
    id: "lens-of-relationship", kind: "pattern", title: "관계를 해석하는 렌즈",
    when: [{ module: "defense", scale: "projection", level: "high" }, { module: "reaction", scale: "relationshipSensitivity", level: "high" }],
    text: "관계 신호에 민감하고, 내 마음을 상대의 마음으로 읽는 경향도 함께 보여요. 상대의 작은 변화가 ‘나를 싫어한다’는 해석으로 빠르게 이어질 수 있어요.",
    strategy: "해석이 떠오르면 ‘확인된 사실’과 ‘내 추측’을 두 칸으로 나눠 적고, 추측은 직접 물어 확인해 보세요.",
  },
  {
    id: "unspoken-resistance", kind: "pattern", title: "말하지 못한 저항",
    when: [{ module: "defense", scale: "passiveAggression", level: "high" }, { module: "reaction", scale: "controlResistance", level: "high" }],
    text: "자율성을 지키려는 마음이 크지만, 그 마음이 직접적인 말보다 지연이나 침묵으로 드러날 수 있어요.",
    strategy: "‘이 방식은 이런 점이 걱정돼요, 이렇게 해 보면 어떨까요?’처럼 대안을 붙인 직접 표현을 연습해 보세요.",
  },
  {
    id: "faster-than-thought", kind: "pattern", title: "생각보다 빠른 행동",
    when: [{ module: "defense", scale: "actingOut", level: "high" }, { module: "reaction", scale: "emotionalArousal", level: "high" }],
    text: "감정 각성이 빠르고, 강한 감정이 곧바로 행동으로 이어지는 경향이 함께 보여요. 행동의 결과가 감정보다 오래 남을 수 있어요.",
    strategy: "메시지·결제처럼 되돌리기 어려운 행동에는 ‘한 시간 보류’ 규칙을 정해 두세요.",
  },
  {
    id: "sensitivity-turned-inward", kind: "pattern", title: "섬세함이 나를 향할 때",
    when: [{ module: "reaction", scale: "selfCriticism", level: "high" }, { module: "traits", scale: "negativeEmotionality", level: "high" }],
    text: "감정을 섬세하게 느끼는 성향과 스스로에게 엄격한 경향이 함께 보여요. 작은 실수에도 감정이 크게, 오래 머물 수 있어요.",
    strategy: "자책이 시작되면 ‘친한 친구가 같은 실수를 했다면 뭐라고 말해 줄까?’를 떠올려 그 말을 나에게 건네 보세요.",
  },
  {
    id: "kindness-mask", kind: "pattern", title: "친절 뒤에 남는 마음",
    when: [{ module: "defense", scale: "reactionFormation", level: "high" }, { module: "traits", scale: "agreeableness", level: "high" }],
    text: "다른 사람을 배려하는 성향이 크고, 불편한 감정을 반대로 더 친절하게 표현하는 경향도 보여요. 관계는 부드러워지지만 내 감정은 쌓일 수 있어요.",
    strategy: "친절하게 대한 뒤 ‘사실 나는 어땠지?’를 혼자 적어 보세요. 감정을 인정하는 것만으로도 피로가 줄 수 있어요.",
  },
  {
    id: "quick-okay", kind: "pattern", title: "‘괜찮아’가 빠른 편",
    when: [{ module: "defense", scale: "denial", level: "high" }, { module: "traits", scale: "negativeEmotionality", level: "low" }],
    text: "감정 변화가 잔잔하다고 응답했고, 걱정스러운 일을 ‘별일 아니다’로 정리하는 경향도 보여요. 안정감의 장점이 있지만, 신호를 늦게 알아차릴 수 있어요.",
    strategy: "‘괜찮아’라고 말하기 전에 ‘무엇이 괜찮고, 무엇이 아직 걸리지?’를 한 번 나눠 보세요.",
  },
  {
    id: "preparing-for-worry", kind: "resource", title: "준비로 불안을 다루는 힘",
    when: [{ module: "defense", scale: "anticipation", level: "high" }, { module: "traits", scale: "negativeEmotionality", level: "high" }],
    text: "감정을 섬세하게 느끼면서도, 다가올 어려움을 미리 준비하는 방식으로 불안을 다루는 자원이 있어요.",
    strategy: "준비 목록 마지막에 ‘준비가 끝났으니 내려놓을 것’을 한 줄 적어, 준비가 걱정으로 길어지지 않게 해 보세요.",
  },
  {
    id: "connection-recovery", kind: "resource", title: "연결을 통한 회복",
    when: [{ module: "defense", scale: "affiliation", level: "high" }, { module: "traits", scale: "extraversion", level: "high" }],
    text: "사람과의 연결에서 에너지를 얻고, 힘들 때 도움을 구하는 방식도 잘 작동하는 편이에요. 관계가 회복의 큰 자원이 될 수 있어요.",
    strategy: "도움을 구할 때 ‘위로가 필요한지, 조언이 필요한지’ 먼저 말하면 연결이 더 정확히 힘이 돼요.",
  },
  {
    id: "protected-focus", kind: "resource", title: "집중을 지키는 힘",
    when: [{ module: "defense", scale: "suppression", level: "high" }, { module: "traits", scale: "conscientiousness", level: "high" }],
    text: "걱정을 잠시 미뤄 두고 해야 할 일에 집중하는 힘과 계획적인 성향이 함께 있어요.",
    strategy: "미뤄 둔 감정을 다룰 ‘정리 시간’도 일정에 넣어, 집중의 힘이 감정 미루기로만 쓰이지 않게 해 보세요.",
  },
  {
    id: "light-distance", kind: "resource", title: "가볍게 거리를 두는 회복력",
    when: [{ module: "defense", scale: "humor", level: "high" }, { module: "reaction", scale: "perspectiveRecovery", level: "high" }],
    text: "어려운 상황에서 웃음으로 여유를 만들고, 시간이 지나면 다른 관점을 살피는 힘이 함께 있어요.",
    strategy: "웃음으로 긴장을 푼 뒤, 남아 있는 감정이 있는지 한 번 더 확인하는 습관을 더해 보세요.",
  },
  {
    id: "creative-channel", kind: "resource", title: "감정의 창조적 통로",
    when: [{ module: "defense", scale: "sublimation", level: "high" }, { module: "traits", scale: "openness", level: "high" }],
    text: "새로운 생각과 상상에 열려 있고, 힘든 감정을 표현과 창작으로 옮기는 방식도 자주 쓰여요.",
    strategy: "창작 활동 뒤에 ‘이 작업이 어떤 감정에서 시작됐는지’ 한 줄 기록해 감정과 작업을 연결해 보세요.",
  },
  {
    id: "worry-as-their-mind", kind: "pattern", title: "불안이 상대의 마음으로 읽힐 때",
    when: [{ module: "attachment", scale: "attachmentAnxiety", level: "high" }, { module: "defense", scale: "projection", level: "high" }],
    text: "관계가 멀어질까 걱정하는 마음이 크고, 내 마음을 상대의 의도로 읽는 경향도 함께 보여요. ‘상대가 나를 떠나려 한다’는 해석이 실제보다 빠르게 만들어질 수 있어요.",
    strategy: "불안이 올라오면 ‘상대가 실제로 한 말과 행동’만 적어 보고, 해석은 직접 물어 확인해 보세요.",
  },
  {
    id: "distance-as-shield", kind: "pattern", title: "거리 두기로 지키는 마음",
    when: [{ module: "attachment", scale: "attachmentAvoidance", level: "high" }, { module: "defense", scale: "withdrawal", level: "high" }],
    text: "가까워지는 것이 불편하고, 힘들 때 물러서는 방식도 자주 쓰여요. 혼자 회복하는 힘이 있지만, 관계 속 문제는 그대로 남을 수 있어요.",
    strategy: "혼자 정리할 시간을 갖되, ‘생각 좀 하고 내일 이야기하자’처럼 돌아올 시점을 상대에게 알려 주세요.",
  },
  {
    id: "relational-self-doubt", kind: "pattern", title: "관계 속 자기 의심",
    when: [{ module: "attachment", scale: "attachmentAnxiety", level: "high" }, { module: "reaction", scale: "selfCriticism", level: "high" }],
    text: "관계를 걱정하는 마음과 나에게 엄격한 시선이 함께 보여요. 관계의 작은 균열을 ‘내가 부족해서’로 해석하기 쉬울 수 있어요.",
    strategy: "관계가 흔들릴 때 ‘이 일에서 내 몫, 상대의 몫, 상황의 몫’을 세 칸으로 나눠 적어 보세요.",
  },
  {
    id: "secure-reliance", kind: "resource", title: "믿고 기대는 힘",
    when: [{ module: "attachment", scale: "attachmentAnxiety", level: "low" }, { module: "defense", scale: "affiliation", level: "high" }],
    text: "관계를 비교적 믿고, 힘들 때 도움을 구하는 방식도 잘 작동하는 편이에요. 어려움을 함께 견딜 수 있는 든든한 기반이에요.",
    strategy: "도움을 받은 뒤 고마움을 구체적으로 표현하면, 서로 기댈 수 있는 관계가 더 단단해져요.",
  },
  {
    id: "wide-but-careful", kind: "pattern", title: "넓은 관계, 조심스러운 깊이",
    when: [{ module: "attachment", scale: "attachmentAvoidance", level: "high" }, { module: "traits", scale: "extraversion", level: "high" }],
    text: "사람들 속에서 에너지를 얻지만, 깊이 가까워지는 것은 조심스러운 편일 수 있어요. 아는 사람은 많아도 속마음을 나눌 사람은 적다고 느낄 수 있어요.",
    strategy: "편한 사람 한 명에게 평소보다 한 단계 깊은 이야기(요즘 고민 한 가지)를 꺼내 보세요.",
  },
];
