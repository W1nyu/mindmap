import type { DefenseId, DefenseMeta, DefenseTierId, DefenseTierMeta } from "../types/defense";

/**
 * 방어 수준 설명. Vaillant(1977, 1992)의 방어 위계와 DSM-IV 방어기능척도의 구분을
 * 세 수준으로 묶었습니다. 모든 사람이 상황에 따라 모든 수준을 사용합니다.
 */
export const defenseTiers = [
  {
    id: "adaptive", name: "성숙한 대처", academicName: "성숙한 방어 (mature defenses)", level: 3,
    description: "불편한 감정을 알아차리면서도 현실과 관계를 지키는 방식으로 다루는 경향이에요. 감정과 생각이 의식 가까이에 있어 조절이 비교적 쉬워요.",
  },
  {
    id: "inhibitory", name: "내면 조정형 방어", academicName: "신경증적 방어 · 정신적 억제 수준 (neurotic defenses)", level: 2,
    description: "불편한 감정을 마음속에서 다른 형태로 바꾸거나 거리를 두어 다루는 경향이에요. 일상을 유지하게 돕지만, 감정 자체는 충분히 다뤄지지 않고 남을 수 있어요.",
  },
  {
    id: "immediate", name: "즉각 보호형 방어", academicName: "미성숙한 방어 (immature defenses)", level: 1,
    description: "강한 스트레스 앞에서 불편한 현실이나 감정을 빠르게 밀어내거나 밖으로 돌려 마음을 지키는 경향이에요. 순간의 고통을 줄여 주지만, 반복되면 관계와 문제 해결에 비용이 생길 수 있어요.",
  },
] as const satisfies readonly DefenseTierMeta[];

export const defenseMechanisms = [
  {
    id: "sublimation", name: "승화", englishName: "Sublimation", tier: "adaptive",
    summary: "강한 감정의 에너지를 창작·운동·일처럼 가치 있는 활동으로 옮겨요.",
    protects: "감정을 억누르지 않고 표현할 통로를 만들어 긴장을 풀고 성취감으로 이어지게 해요.",
    cost: "활동에만 몰두하면 감정의 원인이 된 관계나 상황을 직접 다루는 일이 늦어질 수 있어요.",
    example: "상사에게 받은 서운함을 퇴근 후 달리기와 글쓰기로 풀어내고, 다음 날 차분히 대화할 힘을 얻는다.",
    growth: "활동 뒤에 ‘이 감정이 무엇을 말해 주고 있었나?’를 짧게 적어 원인 상황도 함께 살펴보세요.",
  },
  {
    id: "humor", name: "유머", englishName: "Humor", tier: "adaptive",
    summary: "어려운 상황의 아이러니나 우스운 면을 보며 긴장을 누그러뜨려요.",
    protects: "고통을 부정하지 않으면서 거리를 조금 두게 해 생각할 여유와 관계의 온기를 지켜요.",
    cost: "진지하게 다뤄야 할 순간에 농담이 앞서면 상대가 가볍게 여겨진다고 느낄 수 있어요.",
    example: "발표를 망친 날 동료와 ‘오늘은 슬라이드가 나보다 더 긴장했나 봐’라고 웃은 뒤 무엇을 고칠지 이야기한다.",
    growth: "웃은 뒤에도 남는 감정이 있는지 확인하고, 필요하면 진지한 대화로 이어가 보세요.",
  },
  {
    id: "anticipation", name: "예상", englishName: "Anticipation", tier: "adaptive",
    summary: "다가올 어려움과 그때의 감정을 미리 떠올리고 현실적으로 준비해요.",
    protects: "예측 가능성을 높여 막연한 불안을 줄이고 실제 상황에서 덜 흔들리게 해요.",
    cost: "준비가 지나치면 아직 일어나지 않은 일에 대한 걱정이 길어질 수 있어요.",
    example: "어려운 면담 전날, 들을 수 있는 말과 그때 하고 싶은 말을 미리 적어 본다.",
    growth: "준비할 수 있는 것과 통제할 수 없는 것을 나누어 적고, 준비가 끝나면 걱정을 내려놓을 시간을 정해 보세요.",
  },
  {
    id: "suppression", name: "억제", englishName: "Suppression", tier: "adaptive",
    summary: "지금 다룰 수 없는 걱정을 의식적으로 잠시 미뤄 두고, 적절한 때 다시 꺼내요.",
    protects: "해야 할 일에 집중하게 해 주면서도 감정을 지우지 않고 나중에 다룰 수 있게 해요.",
    cost: "‘나중’이 계속 미뤄지면 감정이 쌓여 다른 형태로 드러날 수 있어요.",
    example: "시험 중 떠오른 다툼 생각을 ‘저녁 8시에 생각하자’고 미뤄 두고 실제로 그 시간에 정리한다.",
    growth: "미뤄 둔 걱정을 다시 꺼낼 시간과 장소를 구체적으로 정하고 지켜 보세요.",
  },
  {
    id: "affiliation", name: "소속·도움 요청", englishName: "Affiliation", tier: "adaptive",
    summary: "어려움을 혼자 감당하지 않고 믿을 만한 사람과 나누며 도움을 구해요.",
    protects: "정서적 지지와 다른 관점을 얻어 고립감을 줄이고 문제 해결의 자원을 넓혀요.",
    cost: "늘 같은 사람에게만 기대면 상대가 부담을 느끼거나 스스로 정리할 기회가 줄 수 있어요.",
    example: "실직 소식을 들은 날 친구에게 연락해 상황을 털어놓고 이력서 피드백을 부탁한다.",
    growth: "도움을 구하기 전에 ‘지금 필요한 건 위로인지, 조언인지’를 먼저 말해 보세요.",
  },
  {
    id: "intellectualization", name: "주지화", englishName: "Intellectualization", tier: "inhibitory",
    summary: "감정보다 분석과 정보에 집중해 불편한 마음과 거리를 둬요.",
    protects: "압도되지 않고 상황을 이해하게 해 주어 위기 속에서도 판단력을 유지하게 해요.",
    cost: "감정이 다뤄지지 않은 채 남아, 나중에 이유 모를 피로나 관계의 거리감으로 나타날 수 있어요.",
    example: "가족의 진단 소식을 듣고 밤새 자료와 통계를 찾아 읽지만, 정작 무섭다는 말은 하지 못한다.",
    growth: "정보를 정리한 뒤 ‘그래서 나는 지금 어떤 기분이지?’에 한 단어로 답해 보세요.",
  },
  {
    id: "reactionFormation", name: "반동형성", englishName: "Reaction formation", tier: "inhibitory",
    summary: "받아들이기 어려운 감정과 반대되는 태도를 겉으로 더 강하게 보여요.",
    protects: "갈등을 피하고 관계의 겉모습을 지켜, 스스로 생각하는 ‘나다운 모습’을 유지하게 해요.",
    cost: "진짜 감정이 표현되지 않아 피로와 억울함이 쌓이고, 상대도 내 마음을 오해할 수 있어요.",
    example: "서운한 동료에게 오히려 과하게 친절하게 대하고, 집에 와서 몹시 지친다.",
    growth: "겉으로 보인 태도와 속마음이 다를 때 그 차이를 혼자서라도 인정하고 이름 붙여 보세요.",
  },
  {
    id: "displacement", name: "전치", englishName: "Displacement", tier: "inhibitory",
    summary: "감정의 원래 대상 대신 더 안전하게 느껴지는 대상에게 감정이 향해요.",
    protects: "직접 표현하기 어렵게 느껴지는 관계를 지키면서 감정의 압력을 낮춰요.",
    cost: "가까운 사람이나 상관없는 대상이 이유를 모른 채 감정을 받아 관계에 상처가 생길 수 있어요.",
    example: "회의에서 받은 지적에 대한 화가 집에 와서 가족의 사소한 실수에 대한 짜증으로 나온다.",
    growth: "짜증이 올라올 때 ‘이 감정의 원래 주소는 어디일까?’를 먼저 물어보세요.",
  },
  {
    id: "undoing", name: "취소", englishName: "Undoing", tier: "inhibitory",
    summary: "잘못했다고 느끼는 말이나 생각을 다른 행동으로 지우거나 만회하려 해요.",
    protects: "죄책감과 불안을 빠르게 낮추고, 관계를 회복하려는 마음을 행동으로 옮기게 해요.",
    cost: "직접적인 인정이나 대화 없이 만회 행동만 반복되면 상대는 무엇이 해결됐는지 모를 수 있어요.",
    example: "친구에게 날카롭게 말한 다음 날, 사과 대신 커피를 사 주며 아무 일 없던 것처럼 행동한다.",
    growth: "만회 행동과 함께 ‘어제 내 말이 날카로웠어’처럼 짧은 인정의 말을 더해 보세요.",
  },
  {
    id: "denial", name: "부인", englishName: "Denial", tier: "immediate",
    summary: "받아들이기 힘든 사실이나 감정을 ‘별일 아니다’라며 인식에서 밀어내요.",
    protects: "감당하기 버거운 충격을 한 번에 받지 않도록 시간을 벌어 줘요.",
    cost: "필요한 대처(진료, 대화, 정리)가 늦어지고 주변 사람과 현실 인식이 어긋날 수 있어요.",
    example: "계속되는 몸의 신호에도 ‘바빠서 그런 거야’라며 건강 검진을 미룬다.",
    growth: "‘만약 이게 사실이라면 가장 먼저 할 일은?’을 가정해 작은 행동 하나만 정해 보세요.",
  },
  {
    id: "projection", name: "투사", englishName: "Projection", tier: "immediate",
    summary: "내 안의 받아들이기 어려운 감정이나 생각을 다른 사람의 것으로 느껴요.",
    protects: "스스로에 대한 불편한 인식을 피하게 해 자존감을 순간적으로 보호해요.",
    cost: "상대의 의도를 실제와 다르게 읽어 오해와 갈등이 커질 수 있어요.",
    example: "내가 상대에게 서운한데도 ‘저 사람이 나를 싫어하는 것 같다’는 생각이 먼저 든다.",
    growth: "상대의 마음을 추측할 때 ‘이 감정이 내 안에도 있나?’를 한 번 확인하고, 가능하면 직접 물어보세요.",
  },
  {
    id: "rationalization", name: "합리화", englishName: "Rationalization", tier: "immediate",
    summary: "실망이나 마음에 걸리는 행동에 받아들이기 쉬운 설명을 붙여 정리해요.",
    protects: "실망과 자책을 줄여 자존감을 지키고 빠르게 일상으로 돌아오게 해요.",
    cost: "진짜 이유를 살피지 않으면 비슷한 상황이 반복되고 배울 기회가 줄 수 있어요.",
    example: "원하던 공모전에서 떨어진 뒤 ‘어차피 심사가 공정하지 않았을 거야’라고 바로 결론 낸다.",
    growth: "그럴듯한 이유 옆에 ‘불편하지만 가능한 다른 이유’를 하나 더 적어 보세요.",
  },
  {
    id: "passiveAggression", name: "수동공격", englishName: "Passive aggression", tier: "immediate",
    summary: "불만을 직접 말하지 않고 지연, 침묵, 무심함 같은 간접적인 방식으로 드러내요.",
    protects: "직접 충돌할 위험을 피하면서도 불만을 어느 정도 표현하게 해 줘요.",
    cost: "상대는 무엇이 문제인지 알기 어렵고, 신뢰가 서서히 줄어 갈등이 길어질 수 있어요.",
    example: "회의에서 반대 의견을 말하지 않고 동의한 뒤, 맡은 일을 계속 미룬다.",
    growth: "불만을 ‘나는 ~해서 ~가 불편했어’처럼 한 문장으로 직접 말하는 연습을 해 보세요.",
  },
  {
    id: "actingOut", name: "행동화", englishName: "Acting out", tier: "immediate",
    summary: "강한 감정이 생각을 거치기 전에 즉각적인 행동으로 터져 나와요.",
    protects: "견디기 힘든 긴장을 빠르게 내보내 순간의 압박감을 낮춰요.",
    cost: "충동적인 행동의 결과(관계 손상, 지출, 후회)가 감정보다 오래 남을 수 있어요.",
    example: "화가 난 순간 바로 긴 메시지를 보내고, 다음 날 그 내용을 후회한다.",
    growth: "감정이 올라올 때 행동 전에 ‘90초 멈춤’ 규칙을 정해 몸의 반응이 가라앉기를 기다려 보세요.",
  },
  {
    id: "withdrawal", name: "회피·철수", englishName: "Withdrawal", tier: "immediate",
    summary: "불편한 상황이나 사람에게서 물러나거나 공상·몰입 활동 속으로 피해요.",
    protects: "과부하된 마음에 쉴 공간을 만들고 상처받을 위험에서 잠시 벗어나게 해요.",
    cost: "피하는 기간이 길어지면 문제와 관계가 그대로 남거나 더 어려워지고, 고립감이 커질 수 있어요.",
    example: "다툰 뒤 며칠 동안 연락을 받지 않고 게임과 영상에만 몰두한다.",
    growth: "쉬는 시간을 정해 두고, 그 뒤에 할 아주 작은 다가가기 행동(짧은 메시지 등)을 하나 정해 보세요.",
  },
] as const satisfies readonly DefenseMeta[];

export function defenseMeta(id: DefenseId): DefenseMeta {
  return defenseMechanisms.find((item) => item.id === id)!;
}

export function tierMeta(id: DefenseTierId): DefenseTierMeta {
  return defenseTiers.find((item) => item.id === id)!;
}

export type BalanceZoneId = "immediate" | "immediateInhibitory" | "inhibitoryAdaptive" | "adaptive";

/** 무게중심 위치(0–100)의 구간 설명. 어느 구간도 좋고 나쁨의 평가가 아닙니다. */
export const balanceZones: readonly { id: BalanceZoneId; min: number; label: string; shortLabel: string; text: string }[] = [
  { id: "immediate", min: 0, label: "즉각 보호형 쪽", shortLabel: "즉각 보호형 쪽", text: "스트레스가 클 때 빠르게 마음을 보호하는 방식에 많이 기대는 편으로 보여요. 그만큼 지금까지 버텨 온 힘이기도 해요. 여유가 있을 때 성숙한 대처를 하나씩 더해 보면 선택지가 넓어질 수 있어요." },
  { id: "immediateInhibitory", min: 25, label: "즉각 보호형과 내면 조정형 사이", shortLabel: "즉각 보호 ↔ 내면 조정", text: "즉각적으로 마음을 보호하는 방식과 마음속에서 감정을 조정하는 방식을 함께 쓰는 편으로 보여요. 상황에 따라 감정을 바로 밀어내기도, 형태를 바꿔 다루기도 할 수 있어요." },
  { id: "inhibitoryAdaptive", min: 50, label: "내면 조정형과 성숙한 대처 사이", shortLabel: "내면 조정 ↔ 성숙한 대처", text: "감정을 마음속에서 조정하는 방식과 현실적으로 다루는 방식을 함께 쓰는 편으로 보여요. 불편한 감정을 알아차리는 힘이 비교적 잘 작동하고 있을 수 있어요." },
  { id: "adaptive", min: 75, label: "성숙한 대처 쪽", shortLabel: "성숙한 대처 쪽", text: "불편한 감정을 알아차리고 현실적으로 다루는 방식에 많이 기대는 편으로 보여요. 다만 아주 큰 스트레스 앞에서는 누구나 다른 방어도 쓰게 되니, 그때의 나도 함께 살펴보세요." },
];

/** 자기보고식 방어기제 측정의 알려진 한계입니다. */
export const defenseMeasurementNote = "방어기제는 상당 부분 의식하지 못한 채 작동해요. 이 결과는 ‘내가 알아차린 나의 방식’에 가깝습니다.";
