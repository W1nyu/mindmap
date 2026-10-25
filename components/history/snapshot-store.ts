"use client";

import { createLocalStore } from "@/lib/local-store";
import { parseSnapshots, SNAPSHOT_STORAGE_KEY, type ResultSnapshot } from "@/lib/snapshots";

const empty: ResultSnapshot[] = [];

/** 사용자가 ‘기록에 저장’을 누른 결과만 이 기기의 localStorage에 보관합니다. */
export const snapshotStore = createLocalStore<ResultSnapshot[]>(SNAPSHOT_STORAGE_KEY, parseSnapshots, empty);

export function newSnapshotId() {
  try {
    return `s-${crypto.randomUUID()}`;
  } catch {
    return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
