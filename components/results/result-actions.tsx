"use client";

import Link from "next/link";
import { useState } from "react";
import { newSnapshotId, snapshotStore } from "@/components/history/snapshot-store";
import { Icon } from "@/components/icon";
import type { ModuleId } from "@/data/modules";
import { moduleStores } from "@/lib/module-stores";
import { createSnapshot, normalizeSnapshots, sameAnswers } from "@/lib/snapshots";

/** 결과 화면의 저장·인쇄 동작. 저장은 사용자가 누를 때만 이 기기에 응답을 보관합니다. */
export function ResultActions({ id, example }: { id: ModuleId; example: boolean }) {
  const session = moduleStores[id].useSession().session;
  const snapshots = snapshotStore.useValue();
  const [message, setMessage] = useState("");
  const saved = snapshots.value.filter((item) => item.module === id);
  const alreadySaved = Boolean(session && saved.some((item) => sameAnswers(item.answers, session.answers)));

  function save() {
    if (!session) return;
    try {
      const snapshot = createSnapshot(id, session, newSnapshotId(), new Date());
      snapshotStore.set(normalizeSnapshots([...snapshots.value, snapshot]));
      setMessage(snapshots.available ? "이 기기에 결과 기록을 저장했어요." : "저장 기능을 쓸 수 없어 이 화면에서만 유지돼요.");
    } catch {
      setMessage("완료된 응답만 저장할 수 있어요.");
    }
  }

  return <div className="result-actions no-print">
    {!example && <button type="button" className={`button ${alreadySaved ? "button-secondary" : "button-primary"}`} onClick={save} disabled={!session?.completed || alreadySaved}><Icon name="download" size={15} /> {alreadySaved ? "이미 기록에 저장됨" : "결과를 기록에 저장"}</button>}
    <button type="button" className="button button-secondary" onClick={() => window.print()}><Icon name="book" size={15} /> 인쇄 · PDF로 저장</button>
    {!example && saved.length > 0 && <Link className="text-link" href={`/results/history?module=${id}`}>저장한 기록 {saved.length}개 · 변화 보기 <Icon name="chevron" size={13} /></Link>}
    {message && <span className="saved-note" role="status">{message}</span>}
    {!example && <p className="action-note">저장하면 응답(점수 아님)이 이 기기 브라우저에 보관되고, 나중에 다시 응답한 결과와 비교할 수 있어요. 서버로 전송되지 않아요.</p>}
  </div>;
}
