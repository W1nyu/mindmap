"use client";

import { useRef, useState } from "react";
import { snapshotStore } from "@/components/history/snapshot-store";
import { Icon } from "@/components/icon";
import { TextSizeToggle, ThemeToggle } from "@/components/theme-toggle";
import { downloadJson, journalStore, localDateStamp } from "@/components/journal/journal-store";
import { practiceLogStore } from "@/components/practice-board";
import { wellbeingStore } from "@/components/wellbeing/wellbeing-store";
import { scenarioStore } from "@/components/scenario-quiz";
import { assessmentModules, moduleIds, type ModuleId } from "@/data/modules";
import { BACKUP_MAX_BYTES, buildBackup, parseBackup, type BackupSummary, type SelfMapBackup } from "@/lib/backup";
import { moduleStores } from "@/lib/module-stores";
import { instrumentResponses } from "@/lib/session";

export function DataManager() {
  const sessions = { reaction: moduleStores.reaction.useSession(), defense: moduleStores.defense.useSession(), traits: moduleStores.traits.useSession(), attachment: moduleStores.attachment.useSession() };
  const snapshots = snapshotStore.useValue();
  const journal = journalStore.useValue();
  const practiceLog = practiceLogStore.useValue();
  const scenario = scenarioStore.useValue();
  const wellbeing = wellbeingStore.useValue();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ backup: SelfMapBackup; summary: BackupSummary } | null>(null);
  const [message, setMessage] = useState("");
  const [confirmWipe, setConfirmWipe] = useState(false);
  const ready = moduleIds.every((id) => sessions[id].ready) && snapshots.ready && journal.ready && practiceLog.ready && scenario.ready && wellbeing.ready;
  if (!ready) return <p role="status">저장된 데이터를 확인하고 있어요.</p>;

  function exportAll() {
    const current: SelfMapBackup["sessions"] = {};
    for (const id of moduleIds) if (sessions[id].session) current[id] = sessions[id].session!;
    downloadJson(`selfmap-backup-${localDateStamp()}.json`, buildBackup({ sessions: current, snapshots: snapshots.value, journal: journal.value, practiceLog: practiceLog.value, wellbeing: wellbeing.value }, new Date()));
    setMessage("모든 데이터를 JSON 파일로 내보냈어요. 파일에는 응답과 기록이 담겨 있으니 안전한 곳에 보관해 주세요.");
  }

  async function readFile(file: File | undefined) {
    setPending(null);
    if (!file) return;
    if (file.size > BACKUP_MAX_BYTES) {
      setMessage("파일이 너무 커요. SelfMap에서 내보낸 백업 파일인지 확인해 주세요.");
      return;
    }
    const parsed = parseBackup(await file.text());
    if (!parsed) setMessage("SelfMap 백업 파일 형식이 아니거나 버전이 달라 가져올 수 없어요.");
    else {
      setPending(parsed);
      setMessage("");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function applyImport() {
    if (!pending) return;
    const { backup } = pending;
    for (const id of moduleIds) {
      const session = backup.sessions[id];
      if (session) moduleStores[id].save(session);
      else moduleStores[id].clear();
    }
    snapshotStore.set([...backup.snapshots]);
    journalStore.set([...backup.journal]);
    practiceLogStore.set({ ...backup.practiceLog });
    wellbeingStore.set([...(backup.wellbeing ?? [])]);
    setPending(null);
    setMessage("백업을 가져왔어요. 설문 응답은 이 탭에, 기록은 이 기기 브라우저에 저장됐어요.");
  }

  function wipe() {
    moduleIds.forEach((id) => moduleStores[id].clear());
    snapshotStore.clear();
    journalStore.clear();
    practiceLogStore.clear();
    wellbeingStore.clear();
    scenarioStore.clear();
    setConfirmWipe(false);
    setMessage("SelfMap이 이 브라우저에 저장한 모든 데이터를 지웠어요.");
  }

  const sessionLabel = (id: ModuleId) => {
    const session = sessions[id].session;
    if (!session) return "없음";
    const answered = instrumentResponses(assessmentModules[id].instrument, session).length;
    return session.completed ? "완료한 응답" : `응답 ${answered}개 진행 중`;
  };

  return <>
    <section className="viz-card" aria-labelledby="inventory-title">
      <div className="viz-heading"><div><span className="eyebrow small">WHAT IS STORED</span><h2 id="inventory-title">이 브라우저에 저장된 것</h2></div></div>
      <div className="table-scroll"><table className="inventory-table"><caption className="sr-only">저장 위치별 데이터</caption>
        <thead><tr><th scope="col">데이터</th><th scope="col">저장 위치</th><th scope="col">유지 기간</th><th scope="col">현재</th></tr></thead>
        <tbody>
          {moduleIds.map((id) => <tr key={id}><th scope="row">{assessmentModules[id].title} 응답</th><td>sessionStorage</td><td>이 탭을 닫을 때까지</td><td>{sessionLabel(id)}</td></tr>)}
          <tr><th scope="row">상황 반응 선택</th><td>sessionStorage</td><td>이 탭을 닫을 때까지</td><td>{scenario.value ? (scenario.value.completed ? "완료한 선택" : `${Object.keys(scenario.value.choices).length}개 선택 중`) : "없음"}</td></tr>
          <tr><th scope="row">저장한 결과 기록</th><td>localStorage</td><td>직접 지울 때까지</td><td>{snapshots.value.length}개</td></tr>
          <tr><th scope="row">마음 기록</th><td>localStorage</td><td>직접 지울 때까지</td><td>{journal.value.length}개</td></tr>
          <tr><th scope="row">실천 카드 ‘해 봤어요’</th><td>localStorage</td><td>직접 지울 때까지</td><td>{Object.keys(practiceLog.value).length}개</td></tr>
          <tr><th scope="row">마음 상태 체크(WHO-5)</th><td>localStorage</td><td>직접 지울 때까지</td><td>{wellbeing.value.length}회</td></tr>
        </tbody></table></div>
      <p className="viz-caption">어떤 데이터도 SelfMap 서버나 외부 AI API로 전송되지 않아요. 공유 기기라면 사용 후 모두 지워 주세요.</p>
    </section>

    <div className="data-actions">
      <section className="viz-card"><h2>내보내기</h2><p className="viz-text">응답, 결과 기록, 마음 기록, 실천 기록을 하나의 JSON 파일로 저장해요. 다른 기기로 옮기거나 백업할 때 써요.</p><button type="button" className="button button-primary" onClick={exportAll}><Icon name="download" size={16} /> 전체 내보내기</button></section>
      <section className="viz-card"><h2>가져오기</h2><p className="viz-text">SelfMap에서 내보낸 파일만 가져올 수 있어요. 항목마다 다시 검증하고, 형식이 맞지 않는 항목은 건너뛰어요.</p>
        <label className="file-picker"><input ref={fileRef} type="file" accept="application/json,.json" onChange={(event) => readFile(event.target.files?.[0])} /> 백업 파일 선택</label>
        {pending && <div className="reset-confirmation" role="group" aria-label="가져오기 확인"><p>설문 응답 {pending.summary.sessions}개 모듈, 결과 기록 {pending.summary.snapshots}개, 마음 기록 {pending.summary.journal}개, 실천 기록 {pending.summary.practiceLog}개, 상태 체크 {pending.summary.wellbeing}회를 찾았어요{pending.summary.dropped > 0 ? ` (형식이 맞지 않은 ${pending.summary.dropped}개는 제외)` : ""}. 가져오면 지금 이 브라우저의 SelfMap 데이터가 파일 내용으로 바뀌어요.</p><div className="session-actions"><button type="button" className="button button-primary" onClick={applyImport}>가져와서 바꾸기</button><button type="button" className="text-link" onClick={() => setPending(null)}>취소</button></div></div>}
      </section>
      <section className="viz-card"><h2>모두 지우기</h2><p className="viz-text">SelfMap이 이 브라우저에 저장한 모든 응답과 기록을 지워요. 되돌릴 수 없어요.</p>
        {confirmWipe ? <div className="session-actions"><button type="button" className="button button-primary" onClick={wipe}>정말 모두 지우기</button><button type="button" className="text-link" onClick={() => setConfirmWipe(false)}>취소</button></div>
          : <button type="button" className="button button-secondary" onClick={() => setConfirmWipe(true)}><Icon name="trash" size={15} /> 모든 데이터 삭제</button>}
      </section>
    </div>
    {message && <p className="form-message" role="status">{message}</p>}
    <section className="viz-card theme-section" aria-labelledby="theme-title"><h2 id="theme-title">화면 설정</h2><p className="viz-text">테마(밝게·어둡게·기기 설정)와 글자 크기를 고를 수 있어요. 이 선택만 이 기기 브라우저에 저장돼요.</p><ThemeToggle /><TextSizeToggle /></section>
  </>;
}
