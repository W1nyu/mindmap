import type { ModuleId } from "./modules";

/**
 * 마음 지형도의 고정 배치. 좌표는 0–1 정규화 값(가로 x, 세로 y)이며 같은 척도는 항상 같은 자리에 솟습니다.
 * 모듈마다 한 지역을 차지하고, 지역 이름은 region 좌표에 표시합니다. 방어기제는 15개 대신 세 수준 점수로 봉우리를 만듭니다.
 */
export interface TerrainSite {
  module: ModuleId;
  /** 척도 ID. 방어기제는 수준 ID(adaptive·inhibitory·immediate) */
  scale: string;
  x: number;
  y: number;
}

export const terrainRegions: readonly { module: ModuleId; x: number; y: number }[] = [
  { module: "reaction", x: 0.235, y: 0.1 },
  { module: "defense", x: 0.775, y: 0.08 },
  { module: "traits", x: 0.735, y: 0.56 },
  { module: "attachment", x: 0.5, y: 0.94 },
];

export const terrainSites: readonly TerrainSite[] = [
  // 반응 패턴: 왼쪽 지역에 타원으로 둘러앉은 여덟 봉우리
  { module: "reaction", scale: "evaluationSensitivity", x: 0.235, y: 0.24 },
  { module: "reaction", scale: "contextAccuracyNeed", x: 0.345, y: 0.32 },
  { module: "reaction", scale: "defensiveReactivity", x: 0.385, y: 0.5 },
  { module: "reaction", scale: "relationshipSensitivity", x: 0.335, y: 0.68 },
  { module: "reaction", scale: "controlResistance", x: 0.225, y: 0.76 },
  { module: "reaction", scale: "selfCriticism", x: 0.115, y: 0.66 },
  { module: "reaction", scale: "emotionalArousal", x: 0.08, y: 0.46 },
  { module: "reaction", scale: "perspectiveRecovery", x: 0.13, y: 0.3 },
  // 방어기제: 오른쪽 위, 성숙한 대처 → 즉각 보호형
  { module: "defense", scale: "adaptive", x: 0.66, y: 0.2 },
  { module: "defense", scale: "inhibitory", x: 0.79, y: 0.24 },
  { module: "defense", scale: "immediate", x: 0.9, y: 0.32 },
  // 성격 5요인: 오른쪽 아래 오각형
  { module: "traits", scale: "openness", x: 0.735, y: 0.66 },
  { module: "traits", scale: "conscientiousness", x: 0.85, y: 0.72 },
  { module: "traits", scale: "extraversion", x: 0.81, y: 0.88 },
  { module: "traits", scale: "agreeableness", x: 0.66, y: 0.88 },
  { module: "traits", scale: "negativeEmotionality", x: 0.615, y: 0.72 },
  // 관계 애착: 가운데 아래, 두 봉우리
  { module: "attachment", scale: "attachmentAnxiety", x: 0.46, y: 0.8 },
  { module: "attachment", scale: "attachmentAvoidance", x: 0.53, y: 0.66 },
];
