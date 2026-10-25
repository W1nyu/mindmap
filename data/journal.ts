/** 마음 기록의 선택지와 입력 한도입니다. */
export const emotionOptions = [
  { id: "anxious", label: "불안" }, { id: "hurt", label: "서운함" }, { id: "wronged", label: "억울함" },
  { id: "angry", label: "화" }, { id: "irritated", label: "짜증" }, { id: "sad", label: "슬픔" },
  { id: "ashamed", label: "부끄러움" }, { id: "guilty", label: "죄책감" }, { id: "lonely", label: "외로움" },
  { id: "helpless", label: "무력감" }, { id: "tense", label: "긴장" }, { id: "disappointed", label: "실망" },
] as const;

export const needOptions = [
  { id: "recognition", label: "인정받기" }, { id: "understanding", label: "이해받기" }, { id: "connection", label: "연결" },
  { id: "autonomy", label: "자율성" }, { id: "safety", label: "안전" }, { id: "rest", label: "휴식" },
  { id: "fairness", label: "공정함" }, { id: "growth", label: "성장" },
] as const;

export type EmotionId = (typeof emotionOptions)[number]["id"];
export type NeedId = (typeof needOptions)[number]["id"];

export const JOURNAL_LIMITS = {
  situation: 300,
  thought: 200,
  action: 200,
  recovery: 200,
  maxEmotions: 3,
  maxDefenses: 3,
  maxEntries: 500,
} as const;

export const JOURNAL_STORAGE_KEY = "selfmap.journal.v1";
