import type { DefenseId, DefenseTierId } from "../types/defense";

/**
 * 방어 기제 평정 척도(DMRS; Perry, 1990)와 DSM-IV 방어기능척도의 7단계 위계입니다.
 * 7이 가장 적응적인 수준이고, 위계는 ‘방어가 현실과 감정을 얼마나 그대로 두는가’의 차이예요.
 * SelfMap의 15개 방어는 그중 다섯 수준에 속하고, 4·2 수준은 이 설문에서 묻지 않습니다.
 * 화면 이름은 기능 중심으로 풀어 쓰고 학술 명칭을 함께 적습니다.
 */
export interface DmrsLevelMeta {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  name: string;
  academicName: string;
  description: string;
  /** SelfMap 세 수준 중 어디에 묶이는지(색 표시용). 묻지 않는 수준은 null */
  tier: DefenseTierId | null;
  defenses: readonly DefenseId[];
}

export const dmrsLevels: readonly DmrsLevelMeta[] = [
  {
    level: 7, name: "높은 적응", academicName: "High adaptive", tier: "adaptive",
    defenses: ["affiliation", "anticipation", "humor", "sublimation", "suppression"],
    description: "감정과 생각을 알아차린 채로 다루며, 현실과 관계를 그대로 지키는 방식이에요.",
  },
  {
    level: 6, name: "생각으로 거리 두기", academicName: "Obsessional", tier: "inhibitory",
    defenses: ["intellectualization", "undoing"],
    description: "감정은 잠시 떼어 두고 생각·분석·되돌리기로 마음을 다루는 방식이에요.",
  },
  {
    level: 5, name: "감정의 모양 바꾸기", academicName: "Other neurotic", tier: "inhibitory",
    defenses: ["reactionFormation", "displacement"],
    description: "불편한 감정을 반대 태도로 바꾸거나 덜 위험한 대상으로 옮겨 다루는 방식이에요.",
  },
  {
    level: 4, name: "자기 이미지 지키기", academicName: "Minor image-distorting", tier: null, defenses: [],
    description: "나나 남을 조금 부풀리거나 깎아 자존감을 지키는 방식(평가절하·이상화 등)이에요. 이 설문에서는 묻지 않아요.",
  },
  {
    level: 3, name: "불편한 현실 밀어내기", academicName: "Disavowal", tier: "immediate",
    defenses: ["denial", "projection", "rationalization"],
    description: "받아들이기 어려운 사실이나 감정을 부인하거나, 남의 것으로 보거나, 그럴듯한 이유로 덮는 방식이에요.",
  },
  {
    level: 2, name: "극단으로 나누기", academicName: "Major image-distorting", tier: null, defenses: [],
    description: "사람이나 나를 ‘전부 좋음/전부 나쁨’으로 나눠 보는 방식(분리 등)이에요. 이 설문에서는 묻지 않아요.",
  },
  {
    level: 1, name: "행동으로 풀기", academicName: "Action", tier: "immediate",
    defenses: ["actingOut", "passiveAggression", "withdrawal"],
    description: "감정을 생각하기 전에 행동·우회적 표현·물러나기로 바로 내보내는 방식이에요.",
  },
];

export const dmrsMeasurementNote = "DMRS 원 도구는 면담 기록에서 방어가 나타난 횟수를 전문가가 평정해 수준별 비율과 전반 방어 기능(ODF, 1–7)을 구해요. SelfMap은 자기보고 점수를 같은 위계에 놓아 본 참고 지표이며, 원 도구의 점수나 규준과 비교할 수 없어요.";
