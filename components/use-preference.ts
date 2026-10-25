"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * 이 기기에서만 기억하는 작은 화면 설정(예: 자동 다음 문항). 저장이 막혀도 기본값으로 동작하며,
 * 응답·결과 같은 사용자 데이터에는 쓰지 않습니다.
 */
export function useBooleanPreference(key: string, fallback: boolean): [boolean, (value: boolean) => void] {
  const raw = useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, () => read(key), () => null);
  const value = raw === null ? fallback : raw === "1";
  const set = (next: boolean) => {
    try {
      window.localStorage.setItem(key, next ? "1" : "0");
    } catch {
      // 저장할 수 없으면 이번 화면에서만 바뀌지 않습니다.
    }
    listeners.forEach((listener) => listener());
  };
  return [value, set];
}
