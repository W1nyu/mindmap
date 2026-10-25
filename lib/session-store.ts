"use client";

import { useSyncExternalStore } from "react";
import type { QuestionnaireSession } from "@/types/psychology";

export interface SessionSnapshot {
  ready: boolean;
  session: QuestionnaireSession | null;
  storageAvailable: boolean;
  invalidSavedSession: boolean;
}

export interface SessionStore {
  useSession: () => SessionSnapshot;
  save: (session: QuestionnaireSession) => void;
  clear: () => void;
}

const serverSnapshot: SessionSnapshot = { ready: false, session: null, storageAvailable: true, invalidSavedSession: false };

/** 이 기기의 localStorage 키 하나를 React 상태와 연결합니다. 저장이 차단되면 메모리로 진행합니다. */
export function createSessionStore(storageKey: string, parse: (raw: string) => QuestionnaireSession | null): SessionStore {
  let snapshot: SessionSnapshot = { ...serverSnapshot, ready: true };
  let lastRaw: string | null | undefined;
  let memoryOnly = false;
  const listeners = new Set<() => void>();

  function getSnapshot(): SessionSnapshot {
    if (memoryOnly) return snapshot;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== lastRaw) {
        lastRaw = raw;
        const session = raw === null ? null : parse(raw);
        snapshot = { ready: true, session, storageAvailable: true, invalidSavedSession: raw !== null && session === null };
      }
    } catch {
      memoryOnly = true;
      snapshot = { ...snapshot, ready: true, storageAvailable: false };
    }
    return snapshot;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function update(session: QuestionnaireSession | null) {
    getSnapshot();
    const raw = session ? JSON.stringify(session) : null;
    if (!memoryOnly) {
      try {
        if (raw === null) window.localStorage.removeItem(storageKey);
        else window.localStorage.setItem(storageKey, raw);
        lastRaw = raw;
      } catch {
        memoryOnly = true;
      }
    }
    snapshot = { ready: true, session, storageAvailable: !memoryOnly, invalidSavedSession: false };
    listeners.forEach((listener) => listener());
  }

  return {
    useSession: () => useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot),
    save: (session) => update(session),
    clear: () => update(null),
  };
}
