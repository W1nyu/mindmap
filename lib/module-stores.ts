"use client";

import { assessmentModules, type ModuleId } from "@/data/modules";
import { parseInstrumentSession } from "@/lib/session";
import { clearSession, createSessionStore, saveSession, useQuestionnaireSession, type SessionStore } from "@/lib/session-store";

function storeFor(module: Exclude<ModuleId, "reaction">): SessionStore {
  const { storageKey, instrument } = assessmentModules[module];
  return createSessionStore(storageKey, (raw) => parseInstrumentSession(raw, instrument));
}

/** 모듈마다 독립된 sessionStorage 키를 씁니다. 반응 패턴은 기존 키와 저장소를 그대로 사용합니다. */
export const moduleStores: Record<ModuleId, SessionStore> = {
  reaction: { useSession: useQuestionnaireSession, save: saveSession, clear: clearSession },
  defense: storeFor("defense"),
  traits: storeFor("traits"),
  attachment: storeFor("attachment"),
};
