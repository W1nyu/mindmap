import { assessmentModules, isModuleId, moduleIds, type ModuleId } from "../data/modules";
import type { LikertValue } from "../types/assessment";
import type { QuestionnaireSession } from "../types/psychology";
import { scaleScores } from "./integration";
import { computeModuleResult, type ModuleResult } from "./module-results";
import { instrumentResponses, parseInstrumentSession } from "./session";

export const SNAPSHOT_STORAGE_KEY = "selfmap.snapshots.v1";
export const MAX_SNAPSHOTS_PER_MODULE = 30;

/** 점수가 아니라 응답을 저장합니다. 결과는 볼 때마다 같은 계산 함수로 다시 만듭니다. */
export interface ResultSnapshot {
  id: string;
  module: ModuleId;
  savedAt: string;
  instrumentVersion: string;
  answers: Readonly<Record<string, LikertValue>>;
}

export interface ScaleChange {
  scale: string;
  before: number;
  after: number;
  delta: number;
}

/** 완료된 세션에서 스냅숏을 만듭니다. 미완료 세션은 거부합니다. */
export function createSnapshot(module: ModuleId, session: QuestionnaireSession, id: string, now: Date): ResultSnapshot {
  const instrument = assessmentModules[module].instrument;
  if (!session.completed || instrumentResponses(instrument, session).length !== instrument.items.length) {
    throw new Error("완료된 응답만 저장할 수 있습니다.");
  }
  return { id, module, savedAt: now.toISOString(), instrumentVersion: instrument.version, answers: { ...session.answers } };
}

export function validateSnapshot(value: unknown): ResultSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || !item.id || item.id.length > 80 || !isModuleId(item.module) ||
    typeof item.savedAt !== "string" || Number.isNaN(Date.parse(item.savedAt))) return null;
  const instrument = assessmentModules[item.module].instrument;
  const session = parseInstrumentSession(JSON.stringify({
    questionnaireVersion: item.instrumentVersion, answers: item.answers, currentQuestionIndex: 0, completed: true,
  }), instrument);
  if (!session) return null;
  return { id: item.id, module: item.module, savedAt: new Date(item.savedAt).toISOString(), instrumentVersion: instrument.version, answers: session.answers };
}

export function sortSnapshots(items: readonly ResultSnapshot[]): ResultSnapshot[] {
  return [...items].sort((a, b) => a.savedAt.localeCompare(b.savedAt) || a.id.localeCompare(b.id));
}

/** 오래된 순으로 정렬하고, 모듈마다 최근 30개까지만 남깁니다. 버전이 다른 기록은 버립니다. */
export function normalizeSnapshots(items: readonly ResultSnapshot[]): ResultSnapshot[] {
  const seen = new Set<string>();
  const unique = sortSnapshots(items).filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)));
  return moduleIds.flatMap((id) => unique.filter((item) => item.module === id).slice(-MAX_SNAPSHOTS_PER_MODULE))
    .sort((a, b) => a.savedAt.localeCompare(b.savedAt) || a.id.localeCompare(b.id));
}

export function parseSnapshots(raw: string): ResultSnapshot[] | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return null;
    return normalizeSnapshots(value.flatMap((item) => {
      const snapshot = validateSnapshot(item);
      return snapshot ? [snapshot] : [];
    }));
  } catch {
    return null;
  }
}

export function snapshotResult(snapshot: ResultSnapshot): ModuleResult {
  const instrument = assessmentModules[snapshot.module].instrument;
  const responses = instrumentResponses(instrument, { questionnaireVersion: snapshot.instrumentVersion, answers: snapshot.answers, currentQuestionIndex: 0, completed: true });
  return computeModuleResult(snapshot.module, responses);
}

/** 같은 모듈의 두 기록 사이 척도별 변화. 척도 순서는 모듈 정의를 따릅니다. */
export function compareSnapshots(before: ResultSnapshot, after: ResultSnapshot): ScaleChange[] {
  if (before.module !== after.module) throw new Error("같은 모듈의 기록끼리만 비교할 수 있습니다.");
  const a = scaleScores(snapshotResult(before));
  const b = scaleScores(snapshotResult(after));
  return assessmentModules[before.module].instrument.scaleIds.map((scale) => ({
    scale, before: a.get(scale)!, after: b.get(scale)!, delta: b.get(scale)! - a.get(scale)!,
  }));
}

export interface ScaleSeries {
  scale: string;
  /** 오래된 순서의 점수 */
  scores: readonly number[];
  min: number;
  max: number;
}

/** 같은 모듈의 여러 기록에서 척도별 점수 흐름(오래된 순). 척도 순서는 모듈 정의를 따릅니다. */
export function snapshotSeries(snapshots: readonly ResultSnapshot[]): ScaleSeries[] {
  if (snapshots.length === 0) return [];
  const owner = snapshots[0].module;
  if (snapshots.some((item) => item.module !== owner)) throw new Error("같은 모듈의 기록끼리만 이어 볼 수 있습니다.");
  const tables = sortSnapshots(snapshots).map((item) => scaleScores(snapshotResult(item)));
  return assessmentModules[owner].instrument.scaleIds.map((scale) => {
    const scores = tables.map((table) => table.get(scale)!);
    return { scale, scores, min: Math.min(...scores), max: Math.max(...scores) };
  });
}

/** 키 순서와 관계없이 두 응답 묶음이 같은지 비교합니다. */
export function sameAnswers(a: Readonly<Record<string, number>>, b: Readonly<Record<string, number>>): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}
