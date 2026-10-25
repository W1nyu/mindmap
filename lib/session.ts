import type { LikertInstrument } from "../types/assessment";
import type { LikertResponse, QuestionnaireSession } from "../types/psychology";
import { isLikertValue } from "./likert-engine";

export function createInstrumentSession(instrument: LikertInstrument): QuestionnaireSession {
  return { questionnaireVersion: instrument.version, answers: {}, currentQuestionIndex: 0, completed: false };
}

export function instrumentResponses(instrument: LikertInstrument, session: QuestionnaireSession): LikertResponse[] {
  return instrument.items.flatMap((item) => {
    const value = session.answers[item.id];
    return isLikertValue(value, instrument.points) ? [{ kind: "likert" as const, questionId: item.id, value }] : [];
  });
}

/** 저장 데이터도 버전·문항 ID·값·진행 위치·완료 상태를 다시 검증합니다. */
export function parseInstrumentSession(raw: string, instrument: LikertInstrument): QuestionnaireSession | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const session = value as Record<string, unknown>;
    const count = instrument.items.length;
    if (session.questionnaireVersion !== instrument.version ||
      !Number.isInteger(session.currentQuestionIndex) ||
      typeof session.currentQuestionIndex !== "number" || session.currentQuestionIndex < 0 ||
      session.currentQuestionIndex >= count || typeof session.completed !== "boolean" ||
      !session.answers || typeof session.answers !== "object" || Array.isArray(session.answers)) return null;
    const knownIds = new Set<string>(instrument.items.map((item) => item.id));
    const entries = Object.entries(session.answers);
    if (entries.some(([id, answer]) => !knownIds.has(id) || !isLikertValue(answer, instrument.points))) return null;
    if (session.completed && entries.length !== count) return null;
    return { questionnaireVersion: instrument.version, answers: Object.fromEntries(entries), currentQuestionIndex: session.currentQuestionIndex, completed: session.completed };
  } catch {
    return null;
  }
}
