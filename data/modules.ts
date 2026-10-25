import { attachmentInstrument, attachmentMeta } from "./attachment";
import { defenseMechanisms } from "./defense-mechanisms";
import { defenseInstrument } from "./defense-questions";
import { dimensions } from "./dimensions";
import { reactionInstrument } from "./questions";
import { traitInstrument, traitMeta } from "./traits";
import type { LikertInstrument, ScaleMeta } from "../types/assessment";

export const moduleIds = ["reaction", "defense", "traits", "attachment"] as const;
export type ModuleId = (typeof moduleIds)[number];

export interface AssessmentModule {
  id: ModuleId;
  title: string;
  tagline: string;
  description: string;
  estimatedMinutes: number;
  storageKey: string;
  instrument: LikertInstrument;
  scales: readonly ScaleMeta[];
  /** 문항 위에 척도 이름을 보여줄지. 방어기제처럼 이름이 응답을 유도할 수 있으면 숨깁니다. */
  showScaleLabel: boolean;
  questionHint: string;
  basis: string;
}

export const assessmentModules: Record<ModuleId, AssessmentModule> = {
  reaction: {
    id: "reaction",
    title: "반응 패턴",
    tagline: "갈등과 평가의 순간, 나는 어떻게 반응할까",
    description: "평가 민감성부터 관점 회복까지, 불편한 상황에서 나타나는 8가지 반응 경향을 살펴봐요.",
    estimatedMinutes: 5,
    storageKey: "selfmap.questionnaire",
    instrument: reactionInstrument,
    scales: dimensions,
    showScaleLabel: true,
    questionHint: "최근 일상에서의 경험을 떠올리며 가장 가까운 답을 골라보세요.",
    basis: "SelfMap 자체 샘플 문항 · 8차원 × 4문항",
  },
  defense: {
    id: "defense",
    title: "방어기제 프로필",
    tagline: "마음이 나를 지키는 15가지 방식",
    description: "스트레스 앞에서 마음이 자동으로 꺼내는 보호 전략을 성숙한 대처부터 즉각 보호형까지 세 수준으로 살펴봐요.",
    estimatedMinutes: 7,
    storageKey: "selfmap.defense",
    instrument: defenseInstrument,
    scales: defenseMechanisms.map((item) => ({ id: item.id, name: item.name, shortName: item.name, description: item.summary })),
    showScaleLabel: false,
    questionHint: "힘들거나 불편했던 최근의 순간들을 떠올리며, 평소의 나에게 가까운 답을 골라보세요.",
    basis: "Vaillant의 방어 위계 · DSM-IV 방어기능척도 구분 · 자체 작성 45문항",
  },
  traits: {
    id: "traits",
    title: "성격 5요인 경향",
    tagline: "나의 기본 성향을 다섯 개의 축으로",
    description: "개방성, 성실성, 외향성, 우호성, 정서적 민감성을 양쪽 끝 모두 강점이 있는 스펙트럼으로 살펴봐요.",
    estimatedMinutes: 3,
    storageKey: "selfmap.traits",
    instrument: traitInstrument,
    scales: traitMeta,
    showScaleLabel: false,
    questionHint: "지금의 나를 있는 그대로 떠올리며, 가장 가까운 답을 골라보세요.",
    basis: "IPIP(public domain) Mini-IPIP 20문항 한국어 각색",
  },
  attachment: {
    id: "attachment",
    title: "관계 애착 경향",
    tagline: "가까운 관계에서 나는 어떻게 다가가고 물러설까",
    description: "관계 불안과 친밀 회피, 두 개의 축 위에서 가까운 사람과의 거리를 다루는 나의 방식을 살펴봐요.",
    estimatedMinutes: 2,
    storageKey: "selfmap.attachment",
    instrument: attachmentInstrument,
    scales: attachmentMeta,
    showScaleLabel: false,
    questionHint: "연인, 가족, 가까운 친구 등 나에게 중요한 관계를 떠올리며 평소의 나에게 가까운 답을 골라보세요.",
    basis: "성인 애착 2차원 모델(Brennan 외, 1998; Fraley 외, 2000) 참고 · 자체 작성 12문항",
  },
};

export function isModuleId(value: unknown): value is ModuleId {
  return typeof value === "string" && (moduleIds as readonly string[]).includes(value);
}
