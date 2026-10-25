"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/icon";
import { TEXT_SIZE_STORAGE_KEY, THEME_STORAGE_KEY, type TextSizePreference, type ThemePreference } from "@/lib/theme";

const options: readonly { value: ThemePreference; label: string }[] = [
  { value: "light", label: "밝게" },
  { value: "dark", label: "어둡게" },
  { value: "system", label: "기기 설정" },
];

const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  const value = document.documentElement.dataset.themePref;
  return value === "light" || value === "dark" ? value : "system";
}

function readResolved(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function setThemePreference(preference: ThemePreference) {
  const root = document.documentElement;
  root.dataset.themePref = preference;
  root.dataset.theme = preference === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : preference;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // 저장이 막혀도 현재 화면에는 적용됩니다.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function ThemeToggle() {
  const preference = useSyncExternalStore(subscribe, readPreference, () => "system" as ThemePreference);
  return <div className="theme-toggle" role="group" aria-label="화면 테마">
    {options.map((option) => <button key={option.value} type="button" aria-pressed={preference === option.value} onClick={() => setThemePreference(option.value)}>{option.label}</button>)}
  </div>;
}

/** 좁은 화면 머리말용: 누를 때마다 밝게 ↔ 어둡게를 바꿉니다. */
export function ThemeQuickButton() {
  const resolved = useSyncExternalStore(subscribe, readResolved, () => "light" as const);
  const next = resolved === "dark" ? "light" : "dark";
  return <button type="button" className="icon-button" onClick={() => setThemePreference(next)} aria-label={next === "dark" ? "어두운 테마로 바꾸기" : "밝은 테마로 바꾸기"}>
    <Icon name={resolved === "dark" ? "sun" : "moon"} size={19} />
  </button>;
}

function readTextSize(): TextSizePreference {
  return document.documentElement.dataset.text === "large" ? "large" : "normal";
}

export function setTextSize(size: TextSizePreference) {
  const root = document.documentElement;
  if (size === "large") root.dataset.text = "large";
  else delete root.dataset.text;
  try {
    window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
  } catch {
    // 저장이 막혀도 현재 화면에는 적용됩니다.
  }
  listeners.forEach((listener) => listener());
}

/** 글자 크기: 보통(1배) · 크게(1.12배). 이 기기에서만 기억합니다. */
export function TextSizeToggle() {
  const size = useSyncExternalStore(subscribe, readTextSize, () => "normal" as TextSizePreference);
  return <div className="theme-toggle" role="group" aria-label="글자 크기">
    <button type="button" aria-pressed={size === "normal"} onClick={() => setTextSize("normal")}>글자 보통</button>
    <button type="button" aria-pressed={size === "large"} onClick={() => setTextSize("large")}><span style={{ fontSize: "1.15em" }}>글자 크게</span></button>
  </div>;
}
