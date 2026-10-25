/** 방어 수준. 화면에서는 기능 중심의 이름을 쓰고 학술 명칭은 학습 페이지에서 병기합니다. */
export const defenseTierIds = ["adaptive", "inhibitory", "immediate"] as const;
export type DefenseTierId = (typeof defenseTierIds)[number];

export const defenseIds = [
  "sublimation", "humor", "anticipation", "suppression", "affiliation",
  "intellectualization", "reactionFormation", "displacement", "undoing",
  "denial", "projection", "rationalization", "passiveAggression", "actingOut", "withdrawal",
] as const;
export type DefenseId = (typeof defenseIds)[number];

export interface DefenseTierMeta {
  id: DefenseTierId;
  name: string;
  academicName: string;
  /** 무게중심 계산의 가중치. 적응적일수록 큽니다. */
  level: 1 | 2 | 3;
  description: string;
}

export interface DefenseMeta {
  id: DefenseId;
  name: string;
  englishName: string;
  tier: DefenseTierId;
  summary: string;
  protects: string;
  cost: string;
  example: string;
  growth: string;
}
