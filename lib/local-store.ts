"use client";

import { useSyncExternalStore } from "react";

export interface LocalSnapshot<T> {
  ready: boolean;
  value: T;
  available: boolean;
  /** 저장된 값이 있었지만 검증에 실패해 비어 있는 값으로 대체했는지 */
  invalid: boolean;
}

export interface LocalStore<T> {
  useValue: () => LocalSnapshot<T>;
  set: (value: T) => void;
  clear: () => void;
}

/**
 * 브라우저 저장소 키 하나를 React 상태와 연결합니다. 기본은 이 기기에 남는 localStorage이고,
 * area가 "session"이면 탭을 닫을 때 사라지는 sessionStorage를 씁니다.
 * 읽을 때마다 parse로 다시 검증하고, 저장이 막히면 메모리에서만 유지합니다.
 */
export function createLocalStore<T>(key: string, parse: (raw: string) => T | null, empty: T, area: "local" | "session" = "local"): LocalStore<T> {
  const storage = () => (area === "local" ? window.localStorage : window.sessionStorage);
  const serverSnapshot: LocalSnapshot<T> = { ready: false, value: empty, available: true, invalid: false };
  let snapshot: LocalSnapshot<T> = { ...serverSnapshot, ready: true };
  let lastRaw: string | null | undefined;
  let memoryOnly = false;
  const listeners = new Set<() => void>();

  function getSnapshot(): LocalSnapshot<T> {
    if (memoryOnly) return snapshot;
    try {
      const raw = storage().getItem(key);
      if (raw !== lastRaw) {
        lastRaw = raw;
        const value = raw === null ? null : parse(raw);
        snapshot = { ready: true, value: value ?? empty, available: true, invalid: raw !== null && value === null };
      }
    } catch {
      memoryOnly = true;
      snapshot = { ...snapshot, ready: true, available: false };
    }
    return snapshot;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function write(value: T | null) {
    getSnapshot();
    const raw = value === null ? null : JSON.stringify(value);
    if (!memoryOnly) {
      try {
        if (raw === null) storage().removeItem(key);
        else storage().setItem(key, raw);
        lastRaw = raw;
      } catch {
        memoryOnly = true;
      }
    }
    snapshot = { ready: true, value: value ?? empty, available: !memoryOnly, invalid: false };
    listeners.forEach((listener) => listener());
  }

  return {
    useValue: () => useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot),
    set: (value) => write(value),
    clear: () => write(null),
  };
}
