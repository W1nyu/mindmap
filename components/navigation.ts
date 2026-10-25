import type { IconName } from "@/components/icon";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** 명령 팔레트에서 함께 찾을 낱말 */
  keywords?: string;
  hint?: string;
}

export const explorationNav: readonly NavItem[] = [
  { href: "/", label: "홈", icon: "home", keywords: "처음 시작 대시보드", hint: "오늘의 지도와 다음 단계" },
  { href: "/questions", label: "질문 모듈", icon: "question", keywords: "설문 검사 응답 시작", hint: "네 가지 모듈 고르기" },
  { href: "/results", label: "마음 지형도", icon: "mountain", keywords: "결과 지도 마인드맵 등고선", hint: "완료한 모듈을 한 지도로" },
  { href: "/scenarios", label: "상황 반응", icon: "compass", keywords: "시나리오 장면 선택", hint: "일상 장면 8개, 약 2분" },
];

export const toolNav: readonly NavItem[] = [
  { href: "/journal", label: "마음 기록", icon: "pen", keywords: "일기 감정 기록 저널", hint: "상황부터 회복까지 흐름으로" },
  { href: "/check-in", label: "마음 상태 체크", icon: "pulse", keywords: "웰빙 WHO-5 기분 상태 컨디션 체크인", hint: "최근 2주 · 5문장 · 1분" },
  { href: "/review", label: "주간 돌아보기", icon: "calendar", keywords: "주간 리뷰 한 주", hint: "한 주의 기록 요약" },
  { href: "/practice", label: "실천 카드", icon: "leaf", keywords: "연습 호흡 실천", hint: "결과에 맞춘 작은 연습" },
  { href: "/results/history", label: "기록과 변화", icon: "clock", keywords: "히스토리 비교 스냅샷", hint: "저장한 결과 비교" },
  { href: "/learn", label: "방어기제 사전", icon: "book", keywords: "학습 설명 사전 퀴즈", hint: "15가지 방식의 뜻과 예" },
];

export const supportNav: readonly NavItem[] = [
  { href: "/support", label: "도움 받기", icon: "heart", keywords: "상담 연락처 위기", hint: "전문 도움이 필요할 때" },
  { href: "/my-data", label: "내 데이터", icon: "shield", keywords: "백업 내보내기 가져오기 삭제 개인정보", hint: "저장 위치·백업·삭제" },
];

export const extraCommands: readonly NavItem[] = [
  { href: "/results?example=1", label: "예시 지형도 보기", icon: "map", keywords: "샘플 데모 example", hint: "고정 mock 응답" },
  { href: "/learn/quiz", label: "방어기제 찾기 연습", icon: "spark", keywords: "퀴즈 연습 문제", hint: "15개 일상 사례" },
  { href: "/practice#breathing", label: "호흡 도우미", icon: "wind", keywords: "호흡 진정 숨", hint: "1–3분" },
  { href: "/questions/reaction", label: "반응 패턴 시작", icon: "arrow", keywords: "모듈 설문", hint: "32문항 · 약 5분" },
  { href: "/questions/defense", label: "방어기제 프로필 시작", icon: "arrow", keywords: "모듈 설문", hint: "45문항 · 약 7분" },
  { href: "/questions/traits", label: "성격 5요인 시작", icon: "arrow", keywords: "모듈 설문 빅파이브", hint: "20문항 · 약 3분" },
  { href: "/questions/attachment", label: "관계 애착 시작", icon: "arrow", keywords: "모듈 설문", hint: "12문항 · 약 2분" },
];

export function isActivePath(pathname: string, href: string) {
  const path = href.split(/[?#]/)[0];
  if (path === "/") return pathname === "/";
  if (path === "/results") return pathname === "/results" || (pathname.startsWith("/results/") && !pathname.startsWith("/results/history"));
  return pathname === path || pathname.startsWith(`${path}/`);
}
