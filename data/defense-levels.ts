import type { DefenseTierId, DmrsLevel } from "../types/defense";

/**
 * 방어 기제 평정 척도(DMRS; Perry, 1990)의 7단계 위계. 7이 가장 적응적인 수준입니다.
 * 각 방어의 단계는 data/defense-mechanisms.ts의 level에 있고, 검사지에 따라 일부 단계는 비어 있을 수 있습니다.
 */
export interface DmrsLevelMeta {
  level: DmrsLevel;
  name: string;
  academicName: string;
  description: string;
  /** 색 표시용 스타일 묶음 */
  tier: DefenseTierId;
}

export const dmrsLevels: readonly DmrsLevelMeta[] = [
  { level: 7, name: "높은 적응", academicName: "High adaptive", tier: "adaptive", description: "감정과 생각을 알아차린 채 현실과 관계를 지키며 다루는 방식이에요." },
  { level: 6, name: "생각으로 거리 두기", academicName: "Obsessional", tier: "inhibitory", description: "감정은 잠시 떼어 두고 생각·분석·되돌리기로 다루는 방식이에요." },
  { level: 5, name: "감정의 모양 바꾸기", academicName: "Other neurotic", tier: "inhibitory", description: "불편한 감정을 밀어내거나 반대 태도, 다른 대상으로 옮겨 다루는 방식이에요." },
  { level: 4, name: "자기 이미지 지키기", academicName: "Minor image-distorting", tier: "immediate", description: "나나 남을 부풀리거나 깎아 자존감을 지키는 방식이에요." },
  { level: 3, name: "불편한 현실 밀어내기", academicName: "Disavowal", tier: "immediate", description: "받아들이기 어려운 사실이나 감정을 부인하거나 남의 것으로 보는 방식이에요." },
  { level: 2, name: "극단으로 나누기", academicName: "Major image-distorting", tier: "immediate", description: "사람이나 나를 ‘전부 좋음/전부 나쁨’으로 나눠 보는 방식이에요." },
  { level: 1, name: "행동으로 풀기", academicName: "Action", tier: "immediate", description: "감정을 생각하기 전에 행동이나 몸, 물러남으로 바로 내보내는 방식이에요." },
];
