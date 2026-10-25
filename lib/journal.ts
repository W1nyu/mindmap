import { emotionOptions, JOURNAL_LIMITS, needOptions, type EmotionId, type NeedId } from "../data/journal";
import { defenseIds, type DefenseId } from "../types/defense";

export interface JournalEntry {
  id: string;
  createdAt: string;
  situation: string;
  thought: string;
  emotions: readonly EmotionId[];
  intensity: number;
  need: NeedId | null;
  action: string;
  defenses: readonly DefenseId[];
  recovery: string;
  afterIntensity: number | null;
}

export type JournalDraft = Omit<JournalEntry, "id" | "createdAt">;

export interface CountItem<T extends string> {
  id: T;
  count: number;
}

export interface JournalStats {
  count: number;
  averageIntensity: number | null;
  /** 나중 강도를 기록한 항목만으로 계산한 평균 감소폭 */
  averageDrop: number | null;
  recordedAfter: number;
  emotions: readonly CountItem<EmotionId>[];
  defenses: readonly CountItem<DefenseId>[];
  needs: readonly CountItem<NeedId>[];
  daily: readonly { date: string; intensity: number; after: number | null; count: number }[];
}

const emotionIds = new Set<string>(emotionOptions.map((item) => item.id));
const needIds = new Set<string>(needOptions.map((item) => item.id));
const defenseIdSet = new Set<string>(defenseIds);
const round1 = (value: number) => Math.round(value * 10) / 10;

const isIntensity = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 10;
const isText = (value: unknown, max: number): value is string => typeof value === "string" && value.length <= max;
const uniqueFrom = (value: unknown, allowed: Set<string>, max: number, min: number) =>
  Array.isArray(value) && value.length >= min && value.length <= max && new Set(value).size === value.length && value.every((item) => typeof item === "string" && allowed.has(item));

/** 입력 초안을 검증합니다. 상황 또는 생각 중 하나와 감정 1개 이상이 필요합니다. 오류 메시지 목록을 반환합니다. */
export function draftErrors(draft: JournalDraft): string[] {
  const errors: string[] = [];
  if (!draft.situation.trim() && !draft.thought.trim()) errors.push("상황이나 떠오른 생각 중 하나는 적어 주세요.");
  if (draft.emotions.length === 0) errors.push("감정을 하나 이상 골라 주세요.");
  if (!uniqueFrom(draft.emotions, emotionIds, JOURNAL_LIMITS.maxEmotions, 0)) errors.push(`감정은 ${JOURNAL_LIMITS.maxEmotions}개까지 고를 수 있어요.`);
  if (!uniqueFrom(draft.defenses, defenseIdSet, JOURNAL_LIMITS.maxDefenses, 0)) errors.push(`방어기제는 ${JOURNAL_LIMITS.maxDefenses}개까지 고를 수 있어요.`);
  if (!isIntensity(draft.intensity) || (draft.afterIntensity !== null && !isIntensity(draft.afterIntensity))) errors.push("강도는 0–10 사이의 정수예요.");
  if (draft.need !== null && !needIds.has(draft.need)) errors.push("욕구 선택지가 올바르지 않아요.");
  for (const key of ["situation", "thought", "action", "recovery"] as const) {
    if (!isText(draft[key], JOURNAL_LIMITS[key])) errors.push(`입력이 너무 길어요 (${JOURNAL_LIMITS[key]}자까지).`);
  }
  return errors;
}

export function createEntry(draft: JournalDraft, id: string, now: Date): JournalEntry {
  if (draftErrors(draft).length > 0) throw new Error("기록 내용이 올바르지 않습니다.");
  return {
    id, createdAt: now.toISOString(),
    situation: draft.situation.trim(), thought: draft.thought.trim(), emotions: [...draft.emotions], intensity: draft.intensity,
    need: draft.need, action: draft.action.trim(), defenses: [...draft.defenses], recovery: draft.recovery.trim(), afterIntensity: draft.afterIntensity,
  };
}

/** 저장된 항목 하나를 다시 검증합니다. 알 수 없는 필드는 버립니다. */
export function validateEntry(value: unknown): JournalEntry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entry = value as Record<string, unknown>;
  if (typeof entry.id !== "string" || !entry.id || entry.id.length > 80 ||
    typeof entry.createdAt !== "string" || Number.isNaN(Date.parse(entry.createdAt))) return null;
  const draft = {
    situation: entry.situation, thought: entry.thought, emotions: entry.emotions, intensity: entry.intensity,
    need: entry.need ?? null, action: entry.action, defenses: entry.defenses, recovery: entry.recovery, afterIntensity: entry.afterIntensity ?? null,
  } as JournalDraft;
  if ([draft.situation, draft.thought, draft.action, draft.recovery].some((text) => typeof text !== "string")) return null;
  if (!uniqueFrom(draft.emotions, emotionIds, JOURNAL_LIMITS.maxEmotions, 1) || draftErrors(draft).length > 0) return null;
  return { id: entry.id, createdAt: new Date(entry.createdAt).toISOString(), ...draft, emotions: [...draft.emotions], defenses: [...draft.defenses] };
}

/** 배열이 아니면 null. 항목은 하나씩 검증해 유효한 것만, 중복 ID는 처음 것만, 최신순 최대 500개를 남깁니다. */
export function parseJournal(raw: string): JournalEntry[] | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return null;
    const seen = new Set<string>();
    const entries = value.flatMap((item) => {
      const entry = validateEntry(item);
      if (!entry || seen.has(entry.id)) return [];
      seen.add(entry.id);
      return [entry];
    });
    return sortEntries(entries).slice(0, JOURNAL_LIMITS.maxEntries);
  } catch {
    return null;
  }
}

export function sortEntries(entries: readonly JournalEntry[]): JournalEntry[] {
  return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
}

function countBy<T extends string>(values: readonly T[], order: readonly T[]): CountItem<T>[] {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return order.filter((id) => counts.has(id)).map((id) => ({ id, count: counts.get(id)! }))
    .map((item, index) => ({ item, index })).sort((a, b) => b.item.count - a.item.count || a.index - b.index).map(({ item }) => item);
}

/** 날짜 키는 기록 시각의 로컬 날짜가 아니라 UTC 기준 YYYY-MM-DD 입니다(결정론적 집계). */
export function journalStats(entries: readonly JournalEntry[]): JournalStats {
  const withAfter = entries.filter((entry) => entry.afterIntensity !== null);
  const days = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const date = entry.createdAt.slice(0, 10);
    days.set(date, [...(days.get(date) ?? []), entry]);
  }
  const daily = [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => {
    const after = items.filter((item) => item.afterIntensity !== null);
    return {
      date, count: items.length,
      intensity: round1(items.reduce((sum, item) => sum + item.intensity, 0) / items.length),
      after: after.length ? round1(after.reduce((sum, item) => sum + item.afterIntensity!, 0) / after.length) : null,
    };
  });
  return {
    count: entries.length,
    averageIntensity: entries.length ? round1(entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length) : null,
    averageDrop: withAfter.length ? round1(withAfter.reduce((sum, entry) => sum + entry.intensity - entry.afterIntensity!, 0) / withAfter.length) : null,
    recordedAfter: withAfter.length,
    emotions: countBy(entries.flatMap((entry) => entry.emotions), emotionOptions.map((item) => item.id)),
    defenses: countBy(entries.flatMap((entry) => entry.defenses), defenseIds),
    needs: countBy(entries.flatMap((entry) => (entry.need ? [entry.need] : [])), needOptions.map((item) => item.id)),
    daily,
  };
}

export interface DefenseSourceComparison {
  /** 설문에서 자주(50점 이상) 쓴다고 답했고 기록에서도 알아차린 방어 */
  both: readonly DefenseId[];
  /** 설문에서는 자주 쓴다고 답했지만 아직 기록에는 없는 방어 */
  profileOnly: readonly DefenseId[];
  /** 기록에서는 알아차렸지만 설문 점수는 50점 미만인 방어 */
  journalOnly: readonly DefenseId[];
}

/** 순수 함수: 설문 점수(척도 ID→점수)와 기록 빈도를 방어기제 순서대로 나눕니다. */
export function compareDefenseSources(profileScores: ReadonlyMap<string, number>, recorded: readonly CountItem<DefenseId>[], minScore = 50): DefenseSourceComparison {
  const seen = new Set(recorded.map((item) => item.id));
  const frequent = new Set(defenseIds.filter((id) => (profileScores.get(id) ?? 0) >= minScore));
  return {
    both: defenseIds.filter((id) => frequent.has(id) && seen.has(id)),
    profileOnly: defenseIds.filter((id) => frequent.has(id) && !seen.has(id)),
    journalOnly: defenseIds.filter((id) => !frequent.has(id) && seen.has(id)),
  };
}

export interface JournalFilter {
  emotion: EmotionId | null;
  defense: DefenseId | null;
  /** 상황·생각·행동·회복에서 찾는 글자(대소문자 무시) */
  text: string;
}

export const emptyFilter: JournalFilter = { emotion: null, defense: null, text: "" };

/** 순수 함수: 모든 조건을 만족하는 기록만 남깁니다. 순서는 그대로입니다. */
export function filterEntries(entries: readonly JournalEntry[], filter: JournalFilter): JournalEntry[] {
  const query = filter.text.trim().toLowerCase();
  return entries.filter((entry) => (!filter.emotion || entry.emotions.includes(filter.emotion)) &&
    (!filter.defense || entry.defenses.includes(filter.defense)) &&
    (!query || [entry.situation, entry.thought, entry.action, entry.recovery].some((text) => text.toLowerCase().includes(query))));
}
