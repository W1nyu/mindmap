import type { DefenseId } from "../types/defense";

/** 사전 찾기용 일상 낱말. 화면에 보이지 않고, 이름을 몰라도 상황 낱말로 찾을 수 있게 돕습니다. */
export const defenseKeywords: Record<DefenseId, readonly string[]> = {
  sublimation: ["운동", "창작", "글쓰기", "몰두", "에너지", "취미"],
  humor: ["농담", "웃음", "웃기", "장난", "유머"],
  anticipation: ["준비", "계획", "미리", "대비", "걱정"],
  suppression: ["미루기", "나중에", "집중", "참기", "보류"],
  affiliation: ["도움", "상의", "부탁", "친구", "털어놓기", "의지"],
  intellectualization: ["분석", "정보", "논리", "이성", "공부", "검색"],
  reactionFormation: ["반대로", "친절", "과하게", "괜찮은 척", "숨기기"],
  displacement: ["화풀이", "엉뚱한", "짜증", "애꿎은", "가족"],
  undoing: ["만회", "보상", "사과", "되돌리기", "선물"],
  denial: ["아무렇지", "모른 척", "괜찮아", "인정 안", "외면"],
  projection: ["남 탓", "의심", "그 사람이", "떠넘기기", "탓"],
  rationalization: ["핑계", "변명", "합리화", "어차피", "이유 붙이기"],
  passiveAggression: ["은근히", "지각", "삐침", "침묵", "꾸물"],
  actingOut: ["충동", "폭발", "소리", "과음", "폭식", "즉흥"],
  withdrawal: ["거리", "피하기", "혼자", "잠수", "연락 끊기", "숨기"],
};
