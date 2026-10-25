"use client";

import { assessmentModules, formIds, moduleIds, type FormId, type ModuleId } from "@/data/modules";
import { parseInstrumentSession } from "@/lib/session";
import { createSessionStore, type SessionStore } from "@/lib/session-store";

/** 모듈 × 검사지(간편·심층)마다 독립된 저장 키를 씁니다. */
export const moduleStores = Object.fromEntries(moduleIds.map((module) => [module, Object.fromEntries(formIds.map((form) => {
  const { storageKey, instrument } = assessmentModules[module].forms[form];
  return [form, createSessionStore(storageKey, (raw) => parseInstrumentSession(raw, instrument))];
}))])) as Record<ModuleId, Record<FormId, SessionStore>>;
