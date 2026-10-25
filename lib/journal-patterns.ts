import { emotionOptions, needOptions, type EmotionId, type NeedId } from "../data/journal";
import type { JournalEntry } from "./journal";

/**
 * 마음 기록 속 연결: 어떤 감정이 어떤 바람(욕구)과 함께 적혔는지, 언제 기록이 몰리는지.
 * 기록에 적힌 선택만 세며 해석이나 점수를 만들지 않습니다.
 */
export interface FlowNode<T extends string> {
  id: T;
  count: number;
}

export interface EmotionNeedFlow {
  emotions: readonly FlowNode<EmotionId>[];
  needs: readonly FlowNode<NeedId>[];
  links: readonly { emotion: EmotionId; need: NeedId; count: number }[];
  /** 욕구를 고르지 않아 흐름에서 빠진 기록 수 */
  withoutNeed: number;
}

const emotionOrder = emotionOptions.map((item) => item.id);
const needOrder = needOptions.map((item) => item.id);

function ranked<T extends string>(counts: Map<T, number>, order: readonly T[]): FlowNode<T>[] {
  return order.filter((id) => counts.has(id)).map((id, index) => ({ id, count: counts.get(id)!, index }))
    .sort((a, b) => b.count - a.count || a.index - b.index).map(({ id, count }) => ({ id, count }));
}

/** 한 기록의 감정마다 그 기록의 욕구로 이어지는 선을 하나씩 셉니다. 노드는 많은 순, 같으면 선택지 순서. */
export function emotionNeedFlow(entries: readonly JournalEntry[]): EmotionNeedFlow {
  const linkCounts = new Map<string, number>();
  const emotionCounts = new Map<EmotionId, number>();
  const needCounts = new Map<NeedId, number>();
  let withoutNeed = 0;
  for (const entry of entries) {
    if (!entry.need) {
      withoutNeed += 1;
      continue;
    }
    for (const emotion of entry.emotions) {
      const key = `${emotion}|${entry.need}`;
      linkCounts.set(key, (linkCounts.get(key) ?? 0) + 1);
      emotionCounts.set(emotion, (emotionCounts.get(emotion) ?? 0) + 1);
      needCounts.set(entry.need, (needCounts.get(entry.need) ?? 0) + 1);
    }
  }
  const emotions = ranked(emotionCounts, emotionOrder);
  const needs = ranked(needCounts, needOrder);
  const emotionRank = new Map(emotions.map((item, index) => [item.id, index]));
  const needRank = new Map(needs.map((item, index) => [item.id, index]));
  const links = [...linkCounts.entries()].map(([key, count]) => {
    const [emotion, need] = key.split("|") as [EmotionId, NeedId];
    return { emotion, need, count };
  }).sort((a, b) => emotionRank.get(a.emotion)! - emotionRank.get(b.emotion)! || needRank.get(a.need)! - needRank.get(b.need)!);
  return { emotions, needs, links, withoutNeed };
}

export const dayPeriods = [
  { id: "dawn", label: "새벽", from: 0, to: 6 },
  { id: "morning", label: "오전", from: 6, to: 12 },
  { id: "afternoon", label: "오후", from: 12, to: 18 },
  { id: "evening", label: "저녁", from: 18, to: 24 },
] as const;

export const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"] as const;

export interface MomentCell {
  /** 0 = 월요일 */
  weekday: number;
  period: (typeof dayPeriods)[number]["id"];
  count: number;
  averageIntensity: number | null;
}

/** 요일(월–일) × 시간대(새벽·오전·오후·저녁) 격자. 기기의 지역 시간으로 나눕니다. */
export function momentGrid(entries: readonly JournalEntry[]): MomentCell[] {
  const sums = new Map<string, { count: number; intensity: number }>();
  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    const weekday = (date.getDay() + 6) % 7;
    const period = dayPeriods.find((item) => date.getHours() >= item.from && date.getHours() < item.to)!.id;
    const key = `${weekday}|${period}`;
    const cell = sums.get(key) ?? { count: 0, intensity: 0 };
    cell.count += 1;
    cell.intensity += entry.intensity;
    sums.set(key, cell);
  }
  return weekdayLabels.flatMap((_, weekday) => dayPeriods.map((period) => {
    const cell = sums.get(`${weekday}|${period.id}`);
    return { weekday, period: period.id, count: cell?.count ?? 0, averageIntensity: cell ? Math.round((cell.intensity / cell.count) * 10) / 10 : null };
  }));
}
