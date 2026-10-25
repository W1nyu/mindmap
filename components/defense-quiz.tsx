"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { NumberKeys } from "@/components/number-keys";
import { defenseMeta, tierMeta } from "@/data/defense-mechanisms";
import { defenseVignettes } from "@/data/defense-quiz";
import type { DefenseId } from "@/types/defense";

/** 사례를 읽고 어떤 방어기제에 가까운지 고르는 연습. 결과는 저장하지 않습니다. */
export function DefenseQuiz() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<DefenseId | null>(null);
  const [correct, setCorrect] = useState(0);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const finished = index >= defenseVignettes.length;

  if (finished) {
    return <section className="viz-card quiz-card" aria-labelledby="quiz-done-title">
      <span className="eyebrow small">DONE</span>
      <h2 id="quiz-done-title" ref={headingRef} tabIndex={-1}>{defenseVignettes.length}개 사례 중 {correct}개를 맞혔어요</h2>
      <p className="viz-text">점수보다 중요한 건 비슷한 방어 사이의 차이를 알아차리는 감각이에요. 실제 삶에서는 한 행동에 여러 방어가 겹치기도 해요. 내 일상에서 비슷한 장면이 떠올랐다면 마음 기록에 적어 보세요.</p>
      <div className="hero-actions"><button type="button" className="button button-primary" onClick={() => { setIndex(0); setChoice(null); setCorrect(0); }}>처음부터 다시 <Icon name="arrow" size={16} /></button><Link className="text-link" href="/journal">마음 기록 쓰기 <Icon name="chevron" size={14} /></Link></div>
    </section>;
  }

  const vignette = defenseVignettes[index];
  const answered = choice !== null;
  function pick(option: DefenseId) {
    if (answered) return;
    setChoice(option);
    if (option === vignette.answer) setCorrect((value) => value + 1);
    requestAnimationFrame(() => feedbackRef.current?.focus());
  }
  function next() {
    setIndex((value) => value + 1);
    setChoice(null);
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  const answerMeta = defenseMeta(vignette.answer);

  return <>
  <NumberKeys count={vignette.options.length} onPick={(position) => pick(vignette.options[position])} onEnter={answered ? next : undefined} />
  <section className="viz-card quiz-card" aria-labelledby="quiz-title">
    <div className="question-meta"><span>사례 {index + 1} / {defenseVignettes.length}</span><span>맞힌 사례 {correct}개</span></div>
    <div className="question-progress" aria-hidden="true"><span style={{ width: `${(index / defenseVignettes.length) * 100}%` }} /></div>
    <h2 id="quiz-title" ref={headingRef} tabIndex={-1} className="quiz-story">{vignette.story}</h2>
    <p className="question-hint">이 장면에 가장 가까운 방어기제는 무엇일까요?<span className="kbd-hint"> 숫자 키 <kbd>1</kbd>–<kbd>4</kbd>로 고르고 <kbd>Enter</kbd>로 다음 사례.</span></p>
    <div className="quiz-options" role="group" aria-label="방어기제 선택지">{vignette.options.map((option) => {
      const meta = defenseMeta(option);
      const state = !answered ? "" : option === vignette.answer ? "correct" : option === choice ? "wrong" : "dim";
      return <button key={option} type="button" className={`quiz-option ${state}`} onClick={() => pick(option)} disabled={answered && state === "dim"} aria-pressed={choice === option}>
        <span className="option-key" aria-hidden="true">{vignette.options.indexOf(option) + 1}</span><strong>{meta.name}</strong><small>{meta.englishName}</small>
        {state === "correct" && <span className="quiz-mark"><Icon name="check" size={14} /> 가장 가까운 답</span>}
        {state === "wrong" && <span className="quiz-mark">내가 고른 답</span>}
      </button>;
    })}</div>
    <div ref={feedbackRef} tabIndex={-1} aria-live="polite" className="quiz-feedback-wrap">{answered && <div className={`quiz-feedback tier-${answerMeta.tier}`}>
      <p className="quiz-verdict">{choice === vignette.answer ? "맞아요." : `이 장면은 ‘${answerMeta.name}’에 더 가까워요.`} <span className="tier-pill"><i aria-hidden="true" />{tierMeta(answerMeta.tier).name}</span></p>
      <p className="viz-text">{vignette.explanation}</p>
      <div className="question-bottom"><Link className="text-link" href={`/learn#defense-${vignette.answer}`}>{answerMeta.name} 자세히 보기</Link><button type="button" className="button button-primary" onClick={next}>{index === defenseVignettes.length - 1 ? "결과 보기" : "다음 사례"} <Icon name="arrow" size={16} /></button></div>
    </div>}</div>
  </section>
  </>;
}
