import type { DefenseId } from "../types/defense";

export const SCENARIO_VERSION = "selfmap-scenarios-8-v1";

export interface ScenarioOption {
  id: string;
  text: string;
  /** null은 방어보다 문제를 직접 다루는 대처로, 성숙한 대처 수준으로 셉니다. */
  defense: DefenseId | null;
}

export interface Scenario {
  id: string;
  situation: string;
  options: readonly ScenarioOption[];
}

/**
 * 자체 작성한 일상 상황. ‘가장 바람직한 답’이 아니라 ‘가장 먼저 떠오를 것 같은 반응’을 고릅니다.
 * 선택지는 수준이 한쪽에 몰리지 않도록 순서를 섞어 두었습니다.
 */
export const scenarios: readonly Scenario[] = [
  {
    id: "s-criticized", situation: "팀 회의에서 내가 준비한 안이 여러 사람 앞에서 날카롭게 비판받았다.",
    options: [
      { id: "a", text: "비판의 논리적 허점을 조목조목 정리하며 감정은 일단 접어 둔다.", defense: "intellectualization" },
      { id: "b", text: "그 자리에서 바로 목소리를 높여 반박한다.", defense: "actingOut" },
      { id: "c", text: "회의가 끝난 뒤 믿을 만한 동료에게 상황을 이야기하고 의견을 묻는다.", defense: "affiliation" },
      { id: "d", text: "‘어차피 대충 만든 안이었어’라고 생각한다.", defense: "rationalization" },
      { id: "e", text: "괜찮은 척 웃고 넘기지만, 관련된 후속 업무를 슬쩍 미룬다.", defense: "passiveAggression" },
    ],
  },
  {
    id: "s-no-reply", situation: "가까운 친구가 내 연락에 이틀째 답이 없다.",
    options: [
      { id: "a", text: "그 친구가 나에게 서운한 게 있는 게 분명하다고 느낀다.", defense: "projection" },
      { id: "b", text: "아무렇지 않은 척, 오히려 더 다정한 메시지를 여러 번 보낸다.", defense: "reactionFormation" },
      { id: "c", text: "나도 연락을 끊고 한동안 거리를 둔다.", defense: "withdrawal" },
      { id: "d", text: "바쁜가 보다 하고, 내일 가볍게 안부를 다시 묻기로 한다.", defense: "suppression" },
      { id: "e", text: "괜히 다른 사람에게 짜증을 내게 된다.", defense: "displacement" },
    ],
  },
  {
    id: "s-presentation", situation: "다음 주에 부담스러운 발표가 잡혔다.",
    options: [
      { id: "a", text: "발표 걱정을 농담 삼아 동료들과 웃으며 이야기한다.", defense: "humor" },
      { id: "b", text: "생각하면 불안하니 발표 전날까지 아예 떠올리지 않는다.", defense: "denial" },
      { id: "c", text: "관련 자료와 이론을 끝없이 찾아 읽는다.", defense: "intellectualization" },
      { id: "d", text: "발표 생각에 예민해져 가족에게 날카롭게 군다.", defense: "displacement" },
      { id: "e", text: "예상 질문과 답을 미리 정리하고 리허설 시간을 잡아 둔다.", defense: "anticipation" },
    ],
  },
  {
    id: "s-forgot", situation: "실수로 친구와의 중요한 약속을 잊어버렸다.",
    options: [
      { id: "a", text: "사과 대신 다음 날 선물을 사서 아무 일 없던 듯 건넨다.", defense: "undoing" },
      { id: "b", text: "솔직하게 사과하고, 다음에 어떻게 챙길지 함께 이야기한다.", defense: null },
      { id: "c", text: "‘요즘 너무 바빴으니 어쩔 수 없었어’라고 정리한다.", defense: "rationalization" },
      { id: "d", text: "친구가 그 약속을 그렇게 중요하게 여기진 않았을 거라고 생각한다.", defense: "denial" },
      { id: "e", text: "미안한 마음에 한동안 친구를 피한다.", defense: "withdrawal" },
    ],
  },
  {
    id: "s-schedule", situation: "상사가 이유 설명 없이 내 일정을 바꿔 버렸다.",
    options: [
      { id: "a", text: "겉으로는 알겠다고 하고, 바뀐 일을 일부러 천천히 한다.", defense: "passiveAggression" },
      { id: "b", text: "퇴근 후 운동으로 화를 풀며 다음에 어떻게 말할지 생각한다.", defense: "sublimation" },
      { id: "c", text: "그 자리에서 문을 세게 닫고 나온다.", defense: "actingOut" },
      { id: "d", text: "변경 이유를 묻고, 내 일정에 미치는 영향을 차분히 설명한다.", defense: null },
      { id: "e", text: "집에 와서 사소한 일로 가족에게 화를 낸다.", defense: "displacement" },
    ],
  },
  {
    id: "s-distant", situation: "가까운 사람이 ‘요즘 우리가 좀 멀게 느껴져’라고 말했다.",
    options: [
      { id: "a", text: "‘우리 사이엔 아무 문제 없어’라며 대화를 넘긴다.", defense: "denial" },
      { id: "b", text: "어떤 순간에 그렇게 느꼈는지 묻고, 내 상황도 이야기한다.", defense: "affiliation" },
      { id: "c", text: "오히려 상대가 나에게 마음이 식은 것 같다고 느낀다.", defense: "projection" },
      { id: "d", text: "관계 심리 콘텐츠를 찾아보며 원인을 분석한다.", defense: "intellectualization" },
      { id: "e", text: "할 말이 없어져 휴대폰만 들여다본다.", defense: "withdrawal" },
    ],
  },
  {
    id: "s-low-result", situation: "열심히 준비한 시험이나 평가에서 기대보다 훨씬 낮은 결과를 받았다.",
    options: [
      { id: "a", text: "그날 밤 크게 술을 마시거나 충동적으로 무언가를 사며 잊으려 한다.", defense: "actingOut" },
      { id: "b", text: "속상한 마음을 글이나 그림으로 표현해 본다.", defense: "sublimation" },
      { id: "c", text: "‘평가 방식이 이상했어’라고 결론 내린다.", defense: "rationalization" },
      { id: "d", text: "아무렇지 않은 척, 오히려 평소보다 더 밝게 행동한다.", defense: "reactionFormation" },
      { id: "e", text: "결과를 정리해 다음에 바꿀 점 세 가지를 적는다.", defense: "anticipation" },
    ],
  },
  {
    id: "s-health", situation: "몸이 계속 피곤하고 아픈데, 병원에 갈 시간이 마땅치 않다.",
    options: [
      { id: "a", text: "증상을 검색하며 몇 시간 동안 정보를 모은다.", defense: "intellectualization" },
      { id: "b", text: "가장 빠른 진료를 예약해 두고, 그때까지는 걱정을 내려놓는다.", defense: "suppression" },
      { id: "c", text: "‘좀 쉬면 낫겠지’라며 계속 미룬다.", defense: "denial" },
      { id: "d", text: "힘들다고 가족에게 털어놓고 함께 병원 갈 날을 정한다.", defense: "affiliation" },
      { id: "e", text: "아픈 게 짜증 나서 주변 사람에게 퉁명스럽게 군다.", defense: "displacement" },
    ],
  },
];
