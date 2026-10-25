import { assessmentModules, moduleIds, type ModuleId } from "../data/modules";
import type { LikertResponse } from "../types/assessment";
import { isLikertValue } from "./questionnaire";

export const SHARE_VERSION = "s1";

/**
 * 공유 링크의 URL 조각(#) 형식: s1.<모듈 키>-<질문지 버전>-<응답 숫자열>~...
 * 조각은 브라우저가 서버로 보내지 않으므로, 링크를 연 사람의 브라우저에서만 계산됩니다.
 * 응답 숫자열은 문항 순서대로 0–4 한 자리씩입니다.
 */
const KEYS: Record<ModuleId, string> = { reaction: "r", defense: "d", traits: "t", attachment: "a" };

export type SharedAnswers = Partial<Record<ModuleId, readonly LikertResponse[]>>;

export function encodeShare(answers: SharedAnswers): string {
  const parts = moduleIds.flatMap((id) => {
    const responses = answers[id];
    if (!responses) return [];
    const instrument = assessmentModules[id].instrument;
    const values = new Map(responses.map((response) => [response.questionId, response.value]));
    if (instrument.items.some((item) => !values.has(item.id))) throw new Error("완료된 모듈만 공유할 수 있습니다.");
    return [`${KEYS[id]}-${instrument.version}-${instrument.items.map((item) => values.get(item.id)).join("")}`];
  });
  if (parts.length === 0) throw new Error("공유할 모듈이 없습니다.");
  return `${SHARE_VERSION}.${parts.join("~")}`;
}

/** 형식·버전·문항 수·값을 모두 검증합니다. 하나라도 어긋나면 null을 반환합니다. */
export function decodeShare(fragment: string): SharedAnswers | null {
  const raw = fragment.startsWith("#") ? fragment.slice(1) : fragment;
  if (raw.length > 2000 || !raw.startsWith(`${SHARE_VERSION}.`)) return null;
  const result: SharedAnswers = {};
  for (const part of raw.slice(SHARE_VERSION.length + 1).split("~")) {
    const match = /^([a-z])-([a-z0-9-]+)-([0-4]+)$/.exec(part);
    const id = match ? moduleIds.find((moduleId) => KEYS[moduleId] === match[1]) : undefined;
    if (!match || !id || result[id]) return null;
    const instrument = assessmentModules[id].instrument;
    const digits = match[3];
    if (match[2] !== instrument.version || digits.length !== instrument.items.length) return null;
    const responses = instrument.items.map((item, index) => ({ kind: "likert" as const, questionId: item.id, value: Number(digits[index]) }));
    if (!responses.every((response) => isLikertValue(response.value))) return null;
    result[id] = responses as LikertResponse[];
  }
  return Object.keys(result).length > 0 ? result : null;
}
