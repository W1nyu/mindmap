import { attachmentMeta, ecrR, ecrRS } from "./attachment";
import { defenseMechanisms } from "./defense-mechanisms";
import { dsq40, dsq60 } from "./defense-dsq";
import { ders18, ders36, emotionMeta } from "./emotion";
import { bfi2, bfi2S, traitMeta } from "./traits";
import type { LikertInstrument, ScaleMeta } from "../types/assessment";

export const moduleIds = ["emotion", "defense", "traits", "attachment"] as const;
export type ModuleId = (typeof moduleIds)[number];

export const formIds = ["brief", "deep"] as const;
export type FormId = (typeof formIds)[number];
export const formLabels: Record<FormId, string> = { brief: "간편 검사", deep: "심층 검사" };

/** 한 모듈의 검사지 하나. 간편과 심층은 같은 개념을 재는 공인 척도의 단축형과 전체형입니다. */
export interface ModuleForm {
  id: FormId;
  /** 척도 이름(예: DERS-18) */
  name: string;
  instrument: LikertInstrument;
  estimatedMinutes: number;
  storageKey: string;
  citation: string;
  /** 검사지마다 다른 안내가 필요할 때 모듈 안내 대신 씁니다. */
  hint?: string;
}

export interface AssessmentModule {
  id: ModuleId;
  title: string;
  tagline: string;
  scales: readonly ScaleMeta[];
  /** 문항 위에 척도 이름을 보여줄지. 방어기제처럼 이름이 응답을 유도할 수 있으면 숨깁니다. */
  showScaleLabel: boolean;
  questionHint: string;
  forms: Record<FormId, ModuleForm>;
}

const form = (module: ModuleId, id: FormId, name: string, instrument: LikertInstrument, estimatedMinutes: number, citation: string, hint?: string): ModuleForm =>
  ({ id, name, instrument, estimatedMinutes, citation, hint, storageKey: `selfmap.v3.${module}.${id}` });

export const assessmentModules: Record<ModuleId, AssessmentModule> = {
  emotion: {
    id: "emotion",
    title: "정서조절",
    tagline: "속상한 순간 정서를 다루는 방식(정서조절곤란)",
    scales: emotionMeta,
    showScaleLabel: false,
    questionHint: "최근 몇 달 동안의 나를 떠올리며, 얼마나 자주 그런지 골라 주세요.",
    forms: {
      brief: form("emotion", "brief", "DERS-18", ders18, 3, "Victor & Klonsky (2016) · 한국 단축형 검증 Kim et al. (2024)"),
      deep: form("emotion", "deep", "DERS-36", ders36, 6, "Gratz & Roemer (2004)"),
    },
  },
  defense: {
    id: "defense",
    title: "방어기제",
    tagline: "스트레스 앞에서 마음이 나를 지키는 방식",
    scales: defenseMechanisms.map((item) => ({ id: item.id, name: item.name, shortName: item.name, description: item.summary })),
    showScaleLabel: false,
    questionHint: "각 문장에 얼마나 동의하는지 1(전혀 동의 안 함)부터 9(매우 동의)까지 골라 주세요. 정답은 없어요.",
    forms: {
      brief: form("defense", "brief", "DSQ-40", dsq40, 7, "Andrews, Singh & Bond (1993)"),
      deep: form("defense", "deep", "DSQ-60", dsq60, 10, "Thygesen et al. (2008)"),
    },
  },
  traits: {
    id: "traits",
    title: "성격 5요인",
    tagline: "나의 기본 성향을 다섯 개의 축으로",
    scales: traitMeta,
    showScaleLabel: false,
    questionHint: "‘나는 …한 사람이다’에 얼마나 동의하는지 골라 주세요.",
    forms: {
      brief: form("traits", "brief", "BFI-2-S", bfi2S, 4, "Soto & John (2017) · 한국판 Choi et al. (2025)"),
      deep: form("traits", "deep", "BFI-2", bfi2, 8, "Soto & John (2017) · 한국판 Choi et al. (2025)"),
    },
  },
  attachment: {
    id: "attachment",
    title: "성인 애착",
    tagline: "가까운 관계에서 다가가고 물러서는 방식",
    scales: attachmentMeta,
    showScaleLabel: false,
    questionHint: "연인 관계를 떠올려 주세요. 지금 연인이 없다면 가까운 사람과의 관계를 떠올려도 괜찮아요.",
    forms: {
      brief: form("attachment", "brief", "ECR-RS", ecrRS, 2, "Fraley et al. (2011)", "가까운 사람들과의 관계 전반을 떠올려 주세요(특정 한 사람이 아니라 일반적으로)."),
      deep: form("attachment", "deep", "ECR-R", ecrR, 7, "Fraley, Waller & Brennan (2000)", "연인 관계를 떠올려 주세요. 지금 연인이 없다면 가장 최근의 의미 있는 관계를 떠올려도 괜찮아요."),
    },
  },
};

export function isModuleId(value: unknown): value is ModuleId {
  return typeof value === "string" && (moduleIds as readonly string[]).includes(value);
}

export function isFormId(value: unknown): value is FormId {
  return value === "brief" || value === "deep";
}
