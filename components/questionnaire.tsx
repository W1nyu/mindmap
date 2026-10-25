"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { LikertInput } from "@/components/likert-input";
import { useBooleanPreference } from "@/components/use-preference";
import { assessmentModules, type ModuleId } from "@/data/modules";
import { isLikertValue } from "@/lib/questionnaire";
import { scoreLikertInstrument } from "@/lib/likert-engine";
import { moduleStores } from "@/lib/module-stores";
import { createInstrumentSession, instrumentResponses } from "@/lib/session";

export function Questionnaire({ moduleId }: { moduleId: ModuleId }) {
  const assessment = assessmentModules[moduleId];
  const store = moduleStores[moduleId];
  const items = assessment.instrument.items;
  const router = useRouter();
  const state = store.useSession();
  const [reviewing, setReviewing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [autoAdvance, setAutoAdvance] = useBooleanPreference("selfmap.pref.autoAdvance", true);
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const session = state.session ?? createInstrumentSession(assessment.instrument);
  const question = items[session.currentQuestionIndex];
  const selected = session.answers[question.id];
  const answeredCount = instrumentResponses(assessment.instrument, session).length;
  const complete = answeredCount === items.length;
  const isLast = session.currentQuestionIndex === items.length - 1;

  function focusHeading() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function goTo(index: number) {
    store.save({ ...session, currentQuestionIndex: index });
    setReviewing(false);
    setError("");
    focusHeading();
  }

  function answer(value: number) {
    if (!isLikertValue(value)) return;
    const answers = { ...session.answers, [question.id]: value };
    const advance = autoAdvance && !isLast;
    store.save({ ...session, answers, completed: false, currentQuestionIndex: advance ? session.currentQuestionIndex + 1 : session.currentQuestionIndex });
    setError("");
    if (advance) focusHeading();
  }

  function next() {
    if (!isLast) goTo(session.currentQuestionIndex + 1);
    else {
      setReviewing(true);
      focusHeading();
    }
  }

  function submit() {
    try {
      scoreLikertInstrument(assessment.instrument, instrumentResponses(assessment.instrument, session));
      store.save({ ...session, completed: true });
      router.push(`/results/${moduleId}`);
    } catch {
      setError(`${items.length}개 문항에 모두 응답한 뒤 결과를 확인할 수 있어요.`);
    }
  }

  // 숫자 키 0–4로 응답, Enter로 다음 문항. 입력란·버튼에서 누른 키는 기본 동작을 지킵니다.
  const keyHandler = useRef<(event: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyHandler.current = (event: KeyboardEvent) => {
      if (reviewing || confirmReset || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "BUTTON" || target.tagName === "A" || (target.tagName === "INPUT" && (target as HTMLInputElement).type !== "radio"))) return;
      if (/^[0-4]$/.test(event.key)) {
        event.preventDefault();
        answer(Number(event.key));
      } else if (event.key === "Enter" && selected !== undefined) {
        event.preventDefault();
        next();
      }
    };
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => keyHandler.current(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  if (!state.ready) return <p className="quiet-note" role="status">저장된 응답을 확인하고 있어요.</p>;
  const category = assessment.showScaleLabel ? assessment.scales.find((scale) => scale.id === question.scale)?.name : assessment.title;

  return <>
    <p className="storage-note" role="status">{state.storageAvailable
      ? "응답은 이 브라우저 탭의 sessionStorage에만 임시 저장됩니다. 새로고침 후 이어갈 수 있고, ‘응답 삭제’로 지울 수 있어요. 공유 기기에서는 사용 후 삭제해 주세요."
      : "브라우저 저장 기능을 사용할 수 없어 응답은 현재 화면에만 유지됩니다. 새로고침하면 사라져요."}</p>
    {state.invalidSavedSession && <p className="form-message" role="status">저장된 응답의 버전이나 형식이 달라 복원하지 않았어요. 처음부터 응답해 주세요.</p>}
    <div className="question-card">
      <div className="question-meta"><span>{assessment.title} · {session.currentQuestionIndex + 1} / {items.length}</span><span>{answeredCount}개 응답 완료</span></div>
      <div className="question-progress" role="progressbar" aria-label="응답 완료 진행률" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={answeredCount}><span style={{ width: `${answeredCount / items.length * 100}%` }} /></div>
      {reviewing ? <>
        <h2 ref={headingRef} tabIndex={-1}>응답을 확인하고 결과로 이동해요</h2>
        <p className="question-hint">문항 번호를 선택하면 답을 수정할 수 있어요. 점수는 고정된 계산식으로 산출됩니다.</p>
        <div className="review-grid" aria-label="문항별 응답 확인">{items.map((item, index) => <button key={item.id} type="button" className="review-button" onClick={() => goTo(index)} aria-label={`${index + 1}번 문항 수정, 응답 ${session.answers[item.id] ?? "미응답"}`}><span>{index + 1}번</span><strong>{session.answers[item.id] ?? "—"}</strong></button>)}</div>
        <p className="question-hint">결과는 현재 응답에서 살펴보는 경향이며, 진단이나 고정된 성격 유형이 아닙니다.</p>
        <div className="question-bottom"><button type="button" className="text-link" onClick={() => goTo(session.currentQuestionIndex)}>질문으로 돌아가기</button><button type="button" className="button button-primary" disabled={!complete} onClick={submit}>결과 확인 <Icon name="arrow" size={17} /></button></div>
      </> : <>
        {items.length >= 30 && answeredCount >= Math.floor(items.length / 2) && answeredCount < Math.floor(items.length / 2) + 3 && <p className="halfway-note" role="status"><Icon name="leaf" size={15} /> 절반을 지났어요. 잠시 숨을 고르고 이어가도 괜찮아요. 응답은 이 탭에 그대로 남아 있어요.</p>}
        <span className="question-category">{category}</span>
        <h2 ref={headingRef} tabIndex={-1} id="question-label">{question.text}</h2>
        <p className="question-hint" id="question-hint">{assessment.questionHint}</p>
        <div aria-labelledby="question-label"><LikertInput key={question.id} questionId={question.id} value={selected} onChange={answer} /></div>
        <div className="question-bottom"><button type="button" className="text-link" disabled={session.currentQuestionIndex === 0} onClick={() => goTo(session.currentQuestionIndex - 1)}>이전 질문</button><button type="button" className="button button-primary" disabled={selected === undefined} onClick={next}>{isLast ? "응답 확인" : "다음 질문"} <Icon name="arrow" size={17} /></button></div>
        <p className="question-feedback" aria-live="polite">{selected === undefined ? <>답을 고르면 {autoAdvance ? "다음 문항으로 넘어가요" : "다음 질문으로 이동할 수 있어요"}. <span className="kbd-hint">키보드 <kbd>0</kbd>–<kbd>4</kbd>로 고르고 <kbd>Enter</kbd>로 넘어가요.</span></> : `${selected}점을 선택했어요. 이전 질문으로 돌아가 답을 바꿀 수 있어요.`}</p>
      </>}
      {error && <p className="form-message" role="alert">{error}</p>}
    </div>
    <div className="session-actions">
      <label className="toggle-option"><input type="checkbox" checked={autoAdvance} onChange={(event) => setAutoAdvance(event.target.checked)} /> 답을 고르면 다음 문항으로 바로 이동</label>
      {complete && !reviewing && <button type="button" className="text-link" onClick={() => setReviewing(true)}>전체 응답 확인</button>}
      <button type="button" className="text-link" onClick={() => setConfirmReset(true)}>응답 삭제</button>
    </div>
    {confirmReset && <div className="reset-confirmation" role="group" aria-label="응답 삭제 확인"><p>이 탭에 저장된 {assessment.title} 응답을 모두 지우고 처음부터 시작할까요?</p><div className="session-actions"><button type="button" className="button button-primary" onClick={() => {
      store.clear(); setReviewing(false); setConfirmReset(false); setError("");
    }}>삭제하고 다시 시작</button><button type="button" className="text-link" onClick={() => setConfirmReset(false)}>계속 응답하기</button></div></div>}
  </>;
}
