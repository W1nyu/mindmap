import type { IntegrationCondition } from "./integration-rules";

export interface Practice {
  id: string;
  title: string;
  minutes: number;
  why: string;
  steps: readonly string[];
  basis: string;
  /** 하나라도 만족하면 추천 근거가 됩니다. high: ≥ 63, low: ≤ 37 */
  triggers: readonly IntegrationCondition[];
}

/** 일상에서 해 볼 수 있는 짧은 연습. 치료 기법을 대신하지 않으며, 불편하면 언제든 멈춰도 됩니다. */
export const practices: readonly Practice[] = [
  {
    id: "name-it", title: "감정에 이름 붙이기", minutes: 2,
    why: "감정을 단어로 표현하면 감정의 강도가 조금 낮아지고, 생각할 여유가 생길 수 있어요.",
    steps: ["지금 몸에서 느껴지는 감각(가슴 답답함, 어깨 긴장 등)을 하나 찾아요.", "그 감각에 가장 가까운 감정 단어를 하나 붙여요. 예: 서운함, 초조함, 억울함.", "‘나는 지금 ○○을 느끼고 있구나’라고 속으로 말해요."],
    basis: "정서 명명(affect labeling) 연구",
    triggers: [{ module: "defense", scale: "intellectualization", level: "high" }, { module: "defense", scale: "denial", level: "high" }, { module: "reaction", scale: "emotionalArousal", level: "high" }, { module: "attachment", scale: "attachmentAvoidance", level: "high" }],
  },
  {
    id: "pause-90", title: "90초 멈춤", minutes: 2,
    why: "강한 감정의 몸 반응은 보통 1–2분 안에 정점을 지나요. 그 사이 행동을 미루면 선택지가 넓어져요.",
    steps: ["감정이 확 올라오면 손을 멈추고 ‘90초’라고 정해요.", "숨을 길게 내쉬며 발바닥이나 의자에 닿은 몸의 감각에 주의를 둬요.", "90초 뒤 ‘지금 해야 할 일인가, 나중에 해도 되는 일인가’를 물어요."],
    basis: "정서 조절의 상황 수정·반응 지연 전략",
    triggers: [{ module: "defense", scale: "actingOut", level: "high" }, { module: "reaction", scale: "defensiveReactivity", level: "high" }, { module: "reaction", scale: "emotionalArousal", level: "high" }],
  },
  {
    id: "original-address", title: "감정의 원래 주소 찾기", minutes: 3,
    why: "엉뚱한 곳으로 향한 감정을 원래 출발점으로 돌려보내면, 가까운 관계를 지키면서 진짜 문제를 다룰 수 있어요.",
    steps: ["짜증이나 서운함이 느껴질 때 ‘이 감정은 언제부터 있었지?’를 떠올려요.", "그때 있었던 일과 사람을 적어요.", "원래 주소에 할 수 있는 일(대화, 기록, 경계 세우기)을 하나 고르고, 지금 앞의 사람에게는 필요하면 짧게 사과해요."],
    basis: "전치·투사에 대한 자기 관찰 연습",
    triggers: [{ module: "defense", scale: "displacement", level: "high" }, { module: "defense", scale: "projection", level: "high" }],
  },
  {
    id: "i-message", title: "나-전달법 한 문장", minutes: 3,
    why: "불만을 비난 없이 직접 표현하면, 간접적인 신호보다 오해가 적고 관계의 신뢰를 지킬 수 있어요.",
    steps: ["상황을 사실로 적어요: ‘회의에서 내 의견이 넘어갔을 때’", "내 감정을 붙여요: ‘나는 서운했어’", "바라는 것을 덧붙여요: ‘다음엔 내 의견도 한 번 다뤄 주면 좋겠어’"],
    basis: "비폭력 대화·자기주장 훈련",
    triggers: [{ module: "defense", scale: "passiveAggression", level: "high" }, { module: "defense", scale: "reactionFormation", level: "high" }, { module: "reaction", scale: "controlResistance", level: "high" }],
  },
  {
    id: "facts-guesses", title: "사실과 추측 두 칸 쓰기", minutes: 5,
    why: "마음이 빠르게 만든 해석을 사실과 분리하면, 확인해야 할 것과 내려놓아도 될 것이 보여요.",
    steps: ["종이를 두 칸으로 나눠 왼쪽에 ‘확인된 사실’, 오른쪽에 ‘내 추측’을 적어요.", "추측마다 ‘다른 설명은 없을까?’를 하나씩 덧붙여요.", "직접 물어볼 수 있는 추측 하나를 골라 확인해요."],
    basis: "인지행동치료의 생각 기록 기법",
    triggers: [{ module: "defense", scale: "projection", level: "high" }, { module: "defense", scale: "rationalization", level: "high" }, { module: "reaction", scale: "relationshipSensitivity", level: "high" }, { module: "reaction", scale: "contextAccuracyNeed", level: "high" }, { module: "attachment", scale: "attachmentAnxiety", level: "high" }],
  },
  {
    id: "small-approach", title: "작은 다가가기", minutes: 5,
    why: "피하고 싶은 상황에 아주 작은 단계로 다가가면, 불편함을 견딜 수 있다는 경험이 쌓여요.",
    steps: ["미루고 있는 연락이나 대화를 하나 떠올려요.", "그중 가장 작은 첫 단계를 정해요. 예: ‘내일 이야기하자’는 한 줄 보내기.", "해낸 뒤 불편함이 어땠는지 0–10으로 기록해요."],
    basis: "점진적 노출과 행동 활성화",
    triggers: [{ module: "defense", scale: "withdrawal", level: "high" }, { module: "defense", scale: "denial", level: "high" }, { module: "attachment", scale: "attachmentAvoidance", level: "high" }],
  },
  {
    id: "ask-for-help", title: "도움 요청 문장 만들기", minutes: 3,
    why: "도움을 구하는 일이 어렵다면, 미리 문장을 만들어 두는 것만으로도 문턱이 낮아져요.",
    steps: ["부담이 적은 사람 한 명을 떠올려요.", "‘요즘 ○○ 때문에 좀 힘들어. 조언 말고 잠깐 들어 줄 수 있어?’처럼 문장을 적어요.", "보낼 시간을 정해 두고, 보내지 않더라도 문장을 저장해 둬요."],
    basis: "사회적 지지 활용(소속)",
    triggers: [{ module: "defense", scale: "affiliation", level: "low" }, { module: "reaction", scale: "relationshipSensitivity", level: "high" }, { module: "attachment", scale: "attachmentAvoidance", level: "high" }],
  },
  {
    id: "friend-voice", title: "친구에게 하듯 말하기", minutes: 3,
    why: "나에게 하는 말을 친구에게 하는 말로 바꿔 보면, 엄격함 속에 빠진 균형을 되찾을 수 있어요.",
    steps: ["최근 나를 탓했던 말을 그대로 적어요.", "아끼는 친구가 같은 일을 겪었다면 해 줄 말을 적어요.", "두 번째 문장을 나에게 소리 내어 읽어요."],
    basis: "자기연민(self-compassion) 연습",
    triggers: [{ module: "reaction", scale: "selfCriticism", level: "high" }, { module: "reaction", scale: "evaluationSensitivity", level: "high" }, { module: "traits", scale: "negativeEmotionality", level: "high" }, { module: "attachment", scale: "attachmentAnxiety", level: "high" }],
  },
  {
    id: "worry-window", title: "걱정 시간 정하기", minutes: 15,
    why: "걱정을 정해진 시간에만 다루기로 하면, 나머지 시간의 집중과 쉼을 지킬 수 있어요. ‘억제’를 의식적으로 연습하는 방법이에요.",
    steps: ["하루 15분 ‘걱정 시간’을 정해요(잠들기 직전은 피하기).", "그 밖의 시간에 걱정이 떠오르면 메모만 하고 ‘걱정 시간에 보자’고 미뤄요.", "걱정 시간에 메모를 보며 할 수 있는 일과 내려놓을 일을 나눠요."],
    basis: "걱정 지연(worry postponement) 기법",
    triggers: [{ module: "traits", scale: "negativeEmotionality", level: "high" }, { module: "defense", scale: "suppression", level: "low" }, { module: "defense", scale: "anticipation", level: "high" }],
  },
  {
    id: "expressive-writing", title: "15분 표현적 글쓰기", minutes: 15,
    why: "힘든 경험에 대한 생각과 감정을 함께 글로 쓰면, 경험이 정리되고 마음의 부담이 줄어들 수 있어요.",
    steps: ["타이머를 15분으로 맞춰요. 맞춤법은 신경 쓰지 않아요.", "그 일에 대해 ‘무슨 일이 있었는지’와 ‘그때 어떤 감정이었는지’를 함께 써요.", "끝나면 글을 저장하거나 버려도 괜찮아요. 너무 힘들면 바로 멈춰요."],
    basis: "Pennebaker의 표현적 글쓰기 연구",
    triggers: [{ module: "defense", scale: "intellectualization", level: "high" }, { module: "defense", scale: "denial", level: "high" }, { module: "defense", scale: "sublimation", level: "high" }],
  },
  {
    id: "recovery-routine", title: "나만의 회복 루틴", minutes: 10,
    why: "감정이 올라온 뒤 할 일을 미리 정해 두면, 처음 해석에 오래 머물지 않고 돌아오는 길이 짧아져요.",
    steps: ["기분이 나아졌던 활동 세 가지를 적어요. 예: 산책, 샤워, 좋아하는 음악.", "그중 10분 안에 할 수 있는 것을 ‘회복 루틴’으로 정해요.", "다음에 감정이 크게 흔들리면 판단보다 루틴을 먼저 해요."],
    basis: "정서 조절의 주의 전환·행동 활성화",
    triggers: [{ module: "reaction", scale: "perspectiveRecovery", level: "low" }, { module: "reaction", scale: "emotionalArousal", level: "high" }, { module: "defense", scale: "actingOut", level: "high" }],
  },
  {
    id: "if-then", title: "만약–그러면 계획", minutes: 5,
    why: "‘만약 ○○하면, ●●한다’는 계획은 익숙한 반응이 나오는 순간에 새로운 행동을 떠올리게 도와줘요.",
    steps: ["자주 반복되는 상황을 하나 정해요: ‘만약 피드백을 받아 마음이 위축되면’", "그때 할 작은 행동을 정해요: ‘그러면 먼저 한 번 숨을 내쉬고 질문을 하나 한다’", "일주일 동안 해 본 횟수를 기록해요."],
    basis: "실행 의도(implementation intentions) 연구",
    triggers: [{ module: "reaction", scale: "evaluationSensitivity", level: "high" }, { module: "reaction", scale: "defensiveReactivity", level: "high" }, { module: "reaction", scale: "controlResistance", level: "high" }],
  },
  {
    id: "long-exhale", title: "길게 내쉬는 호흡", minutes: 2,
    why: "내쉬는 숨을 들이쉬는 숨보다 길게 하면 몸의 긴장이 가라앉는 데 도움이 될 수 있어요.",
    steps: ["코로 4초 동안 들이쉬어요.", "입으로 6초 동안 천천히 내쉬어요.", "1–2분 반복하며 어깨와 턱의 힘을 빼요."],
    basis: "호흡 조절과 자율신경 진정",
    triggers: [{ module: "reaction", scale: "emotionalArousal", level: "high" }, { module: "traits", scale: "negativeEmotionality", level: "high" }],
  },
  {
    id: "strength-use", title: "이미 가진 자원 꺼내 쓰기", minutes: 5,
    why: "이미 잘 작동하는 대처를 의식적으로 꺼내 쓰면, 새로운 방법을 배우는 것보다 빠르게 효과를 볼 수 있어요.",
    steps: ["최근 힘들었던 순간 하나를 떠올려요.", "그때 승화·유머·예상·억제·도움 요청 중 무엇을 썼는지, 혹은 쓸 수 있었는지 적어요.", "다음 비슷한 순간에 쓸 자원 하나를 정해 메모해 둬요."],
    basis: "강점 기반 접근",
    triggers: [{ module: "defense", scale: "humor", level: "high" }, { module: "defense", scale: "sublimation", level: "high" }, { module: "defense", scale: "affiliation", level: "high" }, { module: "defense", scale: "anticipation", level: "high" }],
  },
];
