"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { defenseMechanisms } from "@/data/defense-mechanisms";
import { emotionOptions, JOURNAL_LIMITS, needOptions, type EmotionId, type NeedId } from "@/data/journal";
import { draftErrors, type JournalDraft } from "@/lib/journal";
import type { DefenseId } from "@/types/defense";

const emptyDraft: JournalDraft = { situation: "", thought: "", emotions: [], intensity: 5, need: null, action: "", defenses: [], recovery: "", afterIntensity: null };

function toggle<T>(list: readonly T[], value: T, max: number): T[] {
  if (list.includes(value)) return list.filter((item) => item !== value);
  return list.length >= max ? [...list] : [...list, value];
}

export function JournalForm({ onSave }: { onSave: (draft: JournalDraft) => void }) {
  const [draft, setDraft] = useState<JournalDraft>(emptyDraft);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const update = (patch: Partial<JournalDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setSaved(false);
  };

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const problems = draftErrors(draft);
    setErrors(problems);
    if (problems.length > 0) return;
    onSave(draft);
    setDraft(emptyDraft);
    setSaved(true);
  }

  return <form className="journal-form viz-card" onSubmit={submit} aria-labelledby="journal-form-title" noValidate onKeyDown={(event) => {
    // 입력 중 Ctrl/⌘ + Enter로 바로 저장합니다.
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); event.currentTarget.requestSubmit(); }
  }}>
    <div className="viz-heading"><div><span className="eyebrow small">NEW ENTRY</span><h2 id="journal-form-title">오늘의 마음 흐름 적기</h2></div><span className="subtle-label">상황 → 생각 → 감정 → 욕구 → 행동 → 회복</span></div>
    <label className="field"><span>1. 무슨 일이 있었나요?</span><textarea value={draft.situation} maxLength={JOURNAL_LIMITS.situation} rows={2} placeholder="예: 회의에서 내 의견이 그냥 넘어갔다" onChange={(event) => update({ situation: event.target.value })} /><small>{draft.situation.length} / {JOURNAL_LIMITS.situation}</small></label>
    <label className="field"><span>2. 그 순간 떠오른 생각</span><input value={draft.thought} maxLength={JOURNAL_LIMITS.thought} placeholder="예: 내 말은 중요하지 않구나" onChange={(event) => update({ thought: event.target.value })} /></label>
    <fieldset className="field"><legend>3. 느낀 감정 <small>최대 {JOURNAL_LIMITS.maxEmotions}개</small></legend>
      <div className="chip-options">{emotionOptions.map((option) => <button key={option.id} type="button" className="chip-option" aria-pressed={draft.emotions.includes(option.id)} onClick={() => update({ emotions: toggle<EmotionId>(draft.emotions, option.id, JOURNAL_LIMITS.maxEmotions) })}>{option.label}</button>)}</div>
    </fieldset>
    <label className="field range-field"><span>4. 감정의 강도 <output>{draft.intensity} / 10</output></span><input type="range" min={0} max={10} step={1} value={draft.intensity} onChange={(event) => update({ intensity: Number(event.target.value) })} /></label>
    <fieldset className="field"><legend>5. 그때 바랐던 것 <small>선택</small></legend>
      <div className="chip-options">{needOptions.map((option) => <button key={option.id} type="button" className="chip-option" aria-pressed={draft.need === option.id} onClick={() => update({ need: draft.need === option.id ? null : option.id as NeedId })}>{option.label}</button>)}</div>
    </fieldset>
    <label className="field"><span>6. 그래서 나는…</span><input value={draft.action} maxLength={JOURNAL_LIMITS.action} placeholder="예: 말없이 노트북만 봤다" onChange={(event) => update({ action: event.target.value })} /></label>
    <fieldset className="field"><legend>7. 떠오르는 방어 방식 <small>선택 · 최대 {JOURNAL_LIMITS.maxDefenses}개 · 잘 모르겠으면 비워 두세요</small></legend>
      <div className="chip-options">{defenseMechanisms.map((item) => <button key={item.id} type="button" className={`chip-option tier-${item.tier}`} title={item.summary} aria-pressed={draft.defenses.includes(item.id)} onClick={() => update({ defenses: toggle<DefenseId>(draft.defenses, item.id, JOURNAL_LIMITS.maxDefenses) })}><i aria-hidden="true" />{item.name}</button>)}</div>
    </fieldset>
    <label className="field"><span>8. 회복 · 다음에 다르게 해 보고 싶은 것 <small>선택</small></span><textarea value={draft.recovery} maxLength={JOURNAL_LIMITS.recovery} rows={2} placeholder="예: 다음 회의 전에 의견을 한 줄로 정리해 가기" onChange={(event) => update({ recovery: event.target.value })} /></label>
    <div className="field range-field">
      <label className="toggle-option"><input type="checkbox" checked={draft.afterIntensity !== null} onChange={(event) => update({ afterIntensity: event.target.checked ? Math.max(0, draft.intensity - 2) : null })} /> 감정이 가라앉은 지금의 강도도 기록하기</label>
      {draft.afterIntensity !== null && <label className="range-inline"><span>지금의 강도 <output>{draft.afterIntensity} / 10</output></span><input type="range" min={0} max={10} step={1} value={draft.afterIntensity} onChange={(event) => update({ afterIntensity: Number(event.target.value) })} /></label>}
    </div>
    {errors.length > 0 && <ul className="form-message" role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
    <div className="journal-submit"><button type="submit" className="button button-primary" aria-keyshortcuts="Control+Enter">기록 저장 <Icon name="check" size={16} /></button><span className="kbd-hint subtle-label"><kbd>Ctrl</kbd> <kbd>Enter</kbd>로도 저장</span>{saved && <span role="status" className="saved-note">저장했어요. 아래 기록에서 흐름을 볼 수 있어요.</span>}</div>
  </form>;
}
