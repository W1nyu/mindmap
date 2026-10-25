"use client";

import { useEffect, useRef } from "react";

/**
 * 숫자 키 1–N으로 선택지를 고르고, 선택 뒤에는 Enter로 다음으로 넘어갑니다.
 * 입력란에서 누른 키와 조합 키는 건드리지 않습니다. 최신 콜백을 쓰도록 렌더 뒤 effect에서 ref를 갱신합니다.
 */
export function NumberKeys({ count, onPick, onEnter }: { count: number; onPick: (index: number) => void; onEnter?: () => void }) {
  const handlers = useRef({ onPick, onEnter });
  useEffect(() => { handlers.current = { onPick, onEnter }; });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.altKey || event.ctrlKey || event.metaKey || (target && ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target.tagName))) return;
      if (event.key === "Enter" && handlers.current.onEnter) {
        event.preventDefault();
        handlers.current.onEnter();
        return;
      }
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < count) {
        event.preventDefault();
        handlers.current.onPick(index);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [count]);
  return null;
}
