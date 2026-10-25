import { assessmentModules, moduleIds, type ModuleId } from "../data/modules";
import type { QuestionnaireSession } from "../types/psychology";
import { validateEntry, sortEntries, type JournalEntry } from "./journal";
import { validatePracticeLog, type PracticeLog } from "./practice";
import { parseInstrumentSession } from "./session";
import { normalizeSnapshots, validateSnapshot, type ResultSnapshot } from "./snapshots";
import { normalizeChecks, validateCheck, type WellbeingCheck } from "./wellbeing";

export const BACKUP_FORMAT = "selfmap-backup";
export const BACKUP_VERSION = 1;
/** 가져오기 파일 크기 상한(바이트). 비정상적으로 큰 파일을 읽지 않습니다. */
export const BACKUP_MAX_BYTES = 2_000_000;

export interface SelfMapBackup {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  sessions: Partial<Record<ModuleId, QuestionnaireSession>>;
  snapshots: readonly ResultSnapshot[];
  journal: readonly JournalEntry[];
  practiceLog: PracticeLog;
  /** 웰빙 체크(WHO-5). 이 항목이 생기기 전 백업에는 없을 수 있습니다. */
  wellbeing?: readonly WellbeingCheck[];
}

export interface BackupSummary {
  sessions: number;
  snapshots: number;
  journal: number;
  practiceLog: number;
  wellbeing: number;
  dropped: number;
}

export function buildBackup(parts: Omit<SelfMapBackup, "format" | "version" | "exportedAt">, now: Date): SelfMapBackup {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: now.toISOString(), ...parts };
}

/**
 * 가져온 파일을 부분별로 다시 검증합니다. 형식 표식·버전이 다르면 전체를 거부하고,
 * 개별 항목 중 검증에 실패한 것은 버린 뒤 그 수를 알려줍니다.
 */
export function parseBackup(raw: string): { backup: SelfMapBackup; summary: BackupSummary } | null {
  if (raw.length > BACKUP_MAX_BYTES) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (data.format !== BACKUP_FORMAT || data.version !== BACKUP_VERSION || typeof data.exportedAt !== "string" || Number.isNaN(Date.parse(data.exportedAt))) return null;
  let dropped = 0;

  const sessions: SelfMapBackup["sessions"] = {};
  const rawSessions = data.sessions && typeof data.sessions === "object" && !Array.isArray(data.sessions) ? data.sessions as Record<string, unknown> : {};
  for (const id of moduleIds) {
    if (rawSessions[id] === undefined || rawSessions[id] === null) continue;
    const session = parseInstrumentSession(JSON.stringify(rawSessions[id]), assessmentModules[id].instrument);
    if (session) sessions[id] = session;
    else dropped += 1;
  }

  const list = (input: unknown) => (Array.isArray(input) ? input : []);
  const snapshots = list(data.snapshots).flatMap((item) => {
    const snapshot = validateSnapshot(item);
    if (!snapshot) dropped += 1;
    return snapshot ? [snapshot] : [];
  });
  const journal = list(data.journal).flatMap((item) => {
    const entry = validateEntry(item);
    if (!entry) dropped += 1;
    return entry ? [entry] : [];
  });
  const practiceLog = validatePracticeLog(data.practiceLog ?? {}) ?? {};
  const wellbeing = list(data.wellbeing).flatMap((item) => {
    const check = validateCheck(item);
    if (!check) dropped += 1;
    return check ? [check] : [];
  });

  const backup = buildBackup({ sessions, snapshots: normalizeSnapshots(snapshots), journal: sortEntries(journal), practiceLog, wellbeing: normalizeChecks(wellbeing) }, new Date(data.exportedAt));
  return {
    backup,
    summary: { sessions: Object.keys(sessions).length, snapshots: backup.snapshots.length, journal: backup.journal.length, practiceLog: Object.keys(practiceLog).length, wellbeing: backup.wellbeing?.length ?? 0, dropped },
  };
}
