/** 세 방어 스타일. DSQ 연구의 성숙·신경증적·미성숙 구분입니다. */
export const defenseTierIds = ["adaptive", "inhibitory", "immediate"] as const;
export type DefenseTierId = (typeof defenseTierIds)[number];

/** DSQ-40(20개)과 DSQ-60(30개)에 나오는 방어기제의 합집합 */
export const defenseIds = [
  "sublimation", "humor", "anticipation", "suppression", "affiliation", "altruism", "selfAssertion", "selfObservation",
  "intellectualization", "isolation", "undoing", "repression", "dissociation", "reactionFormation", "displacement", "pseudoAltruism",
  "idealization", "devaluation", "devaluationOther", "devaluationSelf", "omnipotence",
  "denial", "projection", "rationalization", "fantasy",
  "splitting", "splittingOther", "splittingSelf", "projectiveIdentification",
  "actingOut", "passiveAggression", "helpRejectingComplaining", "withdrawal", "somatization",
] as const;
export type DefenseId = (typeof defenseIds)[number];

/** DMRS(Perry) 7단계. 7이 가장 적응적인 수준입니다. */
export type DmrsLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface DefenseTierMeta {
  id: DefenseTierId;
  name: string;
  academicName: string;
  description: string;
}

export interface DefenseMeta {
  id: DefenseId;
  name: string;
  englishName: string;
  level: DmrsLevel;
  summary: string;
  protects: string;
  cost: string;
}
