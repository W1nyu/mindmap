export const traitIds = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"] as const;
export type TraitId = (typeof traitIds)[number];

/** 양극 척도. 양쪽 끝 모두 강점과 어려움이 있으며 어느 쪽도 더 나은 방향이 아닙니다. */
export interface TraitMeta {
  id: TraitId;
  name: string;
  shortName: string;
  description: string;
  lowPole: string;
  highPole: string;
  lowStrength: string;
  highStrength: string;
  lowChallenge: string;
  highChallenge: string;
}

export type TraitLeaning = "low" | "mixed" | "high";
