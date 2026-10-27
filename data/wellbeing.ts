/**
 * WHO-5 웰빙 지표(WHO-Five Well-Being Index, WHO 1998; Topp 외, 2015)의 구성을 따른 상태 체크입니다.
 * WHO-5는 허가 없이 무료로 쓸 수 있는 공개 척도이며, 아래 문장은 mindmap이 옮긴 한국어 표현이라
 * 공식 한국어판과 표현이 다를 수 있습니다. 성격 같은 ‘평소의 경향’이 아니라 ‘요즘의 상태’를 봅니다.
 */
export const WELLBEING_VERSION = "who5-ko-selfmap-v1";

/**
 * 묻는 기간. 원 척도는 ‘지난 2주’이지만, 하루 단위의 변화를 보기 위해 ‘오늘’로 바꿔 묻습니다(일일 기록 연구에서 쓰는 방식).
 * 새 체크는 ‘오늘’만 받고, 예전에 저장된 ‘이번 주’·‘지난 2주’ 체크는 기록으로 계속 읽습니다(기간 없는 체크는 ‘지난 2주’).
 */
export const wellbeingPeriods = {
  day: { label: "오늘", heading: "오늘 나는…" },
  week: { label: "이번 주", heading: "이번 주 나는…" },
  twoWeeks: { label: "지난 2주", heading: "지난 2주 동안 나는…" },
} as const;
export type WellbeingPeriod = keyof typeof wellbeingPeriods;

export const wellbeingItems = [
  { id: "cheerful", text: "기분이 밝고 즐거웠다.", short: "밝은 기분" },
  { id: "calm", text: "마음이 차분하고 편안했다.", short: "차분함" },
  { id: "active", text: "활력이 있고 생기가 돌았다.", short: "활력" },
  { id: "rested", text: "아침에 개운하고 푹 쉰 느낌으로 일어났다.", short: "개운한 아침" },
  { id: "interest", text: "일상이 관심 가는 일들로 채워져 있었다.", short: "일상의 관심" },
] as const;

export type WellbeingItemId = (typeof wellbeingItems)[number]["id"];
export type WellbeingValue = 0 | 1 | 2 | 3 | 4 | 5;

/** 원 척도와 같은 6단계(0–5). 높을수록 그 상태가 자주 있었다는 뜻입니다. */
export const wellbeingOptions: readonly { value: WellbeingValue; label: string }[] = [
  { value: 5, label: "언제나" },
  { value: 4, label: "대부분" },
  { value: 3, label: "절반 이상" },
  { value: 2, label: "절반 미만" },
  { value: 1, label: "가끔" },
  { value: 0, label: "전혀 없었다" },
];

export type WellbeingBandId = "steady" | "low" | "veryLow";

/**
 * 해석 구간. Topp 외(2015) 체계적 고찰에서 널리 쓰는 기준을 따릅니다.
 * 50 이하는 웰빙이 낮은 편, 28 이하는 더 자세한 상담·평가를 권하는 기준점입니다. 진단 기준이 아닙니다.
 */
export const wellbeingBands: readonly { id: WellbeingBandId; max: number; label: string; text: string }[] = [
  { id: "veryLow", max: 28, label: "많이 지쳐 있던 시기", text: "기운과 즐거움이 많이 줄어 있었던 것 같아요. 이런 상태가 이어진다면 믿을 만한 사람이나 전문가와 나눠 보기를 권해요. 진단이 아니라 도움을 구해 볼 만한 신호예요." },
  { id: "low", max: 50, label: "기운이 낮았던 시기", text: "기운이 평소보다 낮았던 편으로 보여요. 잠, 쉼, 사람과의 연결처럼 회복을 돕는 것들을 조금 더 챙겨 볼 때예요." },
  { id: "steady", max: 100, label: "비교적 잘 지낸 시기", text: "기분과 활력이 비교적 유지된 편이에요. 지금 나를 받쳐 주는 것을 알아 두면 힘든 시기에 다시 꺼내 쓸 수 있어요." },
];


