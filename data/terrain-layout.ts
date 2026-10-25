import type { ModuleId } from "./modules";

/**
 * 마음 지형도의 고정 배치. 좌표는 0–1 정규화 값(가로 x, 세로 y)이며 같은 척도는 항상 같은 자리에 솟습니다.
 * 모듈마다 한 지역을 차지하고, 지역 이름은 region 좌표에 표시합니다. 방어기제는 개별 방어 대신 세 스타일 점수로 봉우리를 만듭니다.
 */
export interface TerrainSite {
  module: ModuleId;
  /** 척도 ID. 방어기제는 수준 ID(adaptive·inhibitory·immediate) */
  scale: string;
  x: number;
  y: number;
}

export const terrainRegions: readonly { module: ModuleId; x: number; y: number }[] = [
  { module: "emotion", x: 0.235, y: 0.1 },
  { module: "defense", x: 0.775, y: 0.08 },
  { module: "traits", x: 0.735, y: 0.56 },
  { module: "attachment", x: 0.5, y: 0.94 },
];

export const terrainSites: readonly TerrainSite[] = [
  // 감정 조절(DERS): 왼쪽 지역에 육각형으로 둘러앉은 여섯 봉우리
  { module: "emotion", scale: "awareness", x: 0.235, y: 0.25 },
  { module: "emotion", scale: "clarity", x: 0.36, y: 0.37 },
  { module: "emotion", scale: "nonacceptance", x: 0.36, y: 0.62 },
  { module: "emotion", scale: "goals", x: 0.235, y: 0.74 },
  { module: "emotion", scale: "impulse", x: 0.11, y: 0.62 },
  { module: "emotion", scale: "strategies", x: 0.11, y: 0.37 },
  // 방어기제: 오른쪽 위, 성숙 → 미성숙 스타일
  { module: "defense", scale: "adaptive", x: 0.66, y: 0.2 },
  { module: "defense", scale: "inhibitory", x: 0.79, y: 0.24 },
  { module: "defense", scale: "immediate", x: 0.9, y: 0.32 },
  // 성격 5요인: 오른쪽 아래 오각형
  { module: "traits", scale: "openness", x: 0.735, y: 0.66 },
  { module: "traits", scale: "conscientiousness", x: 0.85, y: 0.72 },
  { module: "traits", scale: "extraversion", x: 0.81, y: 0.88 },
  { module: "traits", scale: "agreeableness", x: 0.66, y: 0.88 },
  { module: "traits", scale: "neuroticism", x: 0.615, y: 0.72 },
  // 관계 애착: 가운데 아래, 두 봉우리
  { module: "attachment", scale: "attachmentAnxiety", x: 0.46, y: 0.8 },
  { module: "attachment", scale: "attachmentAvoidance", x: 0.53, y: 0.66 },
];
