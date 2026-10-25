"use client";

import { JOURNAL_STORAGE_KEY } from "@/data/journal";
import { parseJournal, type JournalEntry } from "@/lib/journal";
import { createLocalStore } from "@/lib/local-store";

const empty: JournalEntry[] = [];

/** 마음 기록은 이 기기 브라우저의 localStorage에만 저장합니다. 읽을 때마다 항목을 다시 검증합니다. */
export const journalStore = createLocalStore<JournalEntry[]>(JOURNAL_STORAGE_KEY, parseJournal, empty);

export function newEntryId() {
  try {
    return `j-${crypto.randomUUID()}`;
  } catch {
    return `j-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** 브라우저 다운로드로 JSON 파일을 저장합니다. 서버로 보내지 않습니다. */
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function localDateStamp(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
