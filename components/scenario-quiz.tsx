"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { NumberKeys } from "@/components/number-keys";
import { useModuleResult } from "@/components/results/use-module-result";
import { defenseMeta, tierMeta } from "@/data/defense-mechanisms";
import { scenarios } from "@/data/scenarios";
import { createLocalStore } from "@/lib/local-store";
import { analyzeScenarios, createScenarioSession, parseScenarioSession, type ScenarioProfile, type ScenarioSession } from "@/lib/scenario-analysis";

export const scenarioStore = createLocalStore<ScenarioSession | null>("selfmap.scenarios", parseScenarioSession, null, "session");

function CompositionBar({ label, parts }: { label: string; parts: readonly { tier: "adaptive" | "inhibitory" | "immediate"; value: number }[] }) {
  return <div className="compare-bar"><span>{label}</span><div className="composition-bar small" role="img" aria-label={`${label}: ${parts.map((part) => `${tierMeta(part.tier).name} ${part.value}%`).join(", ")}`}>
    {parts.filter((part) => part.value > 0).map((part) => <span key={part.tier} className={`tier-${part.tier}`} style={{ flexGrow: part.value }} data-tip={`${tierMeta(part.tier).name} ${part.value}%`} />)}
  </div></div>;
}

function ScenarioResult({ profile, onReset }: { profile: ScenarioProfile; onReset: () => void }) {
  const defense = useModuleResult("defense", false);
  const composition = defense.result?.module === "defense" ? defense.result.profile.composition : null;
  return <div className="result-stack">
    <section className="viz-card" aria-labelledby="scenario-tiers-title">
      <div className="viz-heading"><div><span className="eyebrow small">FIRST IMPULSE</span><h2 id="scenario-tiers-title">상황에서 고른 첫 반응</h2></div><span className="subtle-label">{profile.total}개 상황</span></div>
      <div className="tier-tiles">{profile.tiers.map((tier) => <article key={tier.tier} className={`tier-tile tier-${tier.tier}`}><span className="tier-swatch" aria-hidden="true" /><h3>{tierMeta(tier.tier).name}</h3><p className="tier-score"><strong>{tier.count}</strong><small> / {profile.total}개 상황</small></p><div className="mini-track" aria-hidden="true"><span style={{ width: `${(tier.count / profile.total) * 100}%` }} /></div></article>)}</div>
      {profile.direct > 0 && <p className="viz-caption">성숙한 대처 중 {profile.direct}개는 방어 대신 문제를 직접 다루는 선택(사과·설명·질문)이었어요.</p>}
      {composition && <div className="compare-block"><h3>설문 응답과 비교</h3>
        <CompositionBar label="방어기제 설문" parts={composition.map((item) => ({ tier: item.tier, value: item.share }))} />
        <CompositionBar label="상황 선택" parts={profile.tiers.map((item) => ({ tier: item.tier, value: item.share }))} />
        <p className="viz-caption">설문은 ‘평소 나에 대한 생각’을, 상황 선택은 ‘구체적인 장면에서의 첫 반응’을 비춰요. 둘이 다르다면 어느 쪽이 틀렸다기보다, 상황이 구체적일 때 다른 방식이 먼저 나올 수 있다는 단서예요.</p>
      </div>}
    </section>
    <section className="viz-card" aria-labelledby="scenario-repeat-title">
      <div className="viz-heading"><div><span className="eyebrow small">REPEATED</span><h2 id="scenario-repeat-title">여러 상황에서 반복된 방식</h2></div></div>
      {profile.repeated.length > 0 ? <ul className="repeat-list">{profile.repeated.map((item) => {
        const meta = defenseMeta(item.defense);
        return <li key={item.defense} className={`tier-${meta.tier}`}><span className="tier-pill"><i aria-hidden="true" />{tierMeta(meta.tier).name}</span><strong>{meta.name} · {item.count}회</strong><p>{meta.summary}</p><p className="repeat-growth">{meta.growth}</p></li>;
      })}</ul> : <p className="viz-text">두 번 이상 고른 방식이 없어요. 상황에 따라 다양한 방식이 먼저 떠오르는 편일 수 있어요.</p>}
    </section>
    <section className="viz-card" aria-labelledby="scenario-review-title">
      <div className="viz-heading"><div><span className="eyebrow small">MY CHOICES</span><h2 id="scenario-review-title">내가 고른 반응</h2></div></div>
      <ol className="choice-review">{profile.choices.map((choice) => {
        const scenario = scenarios.find((item) => item.id === choice.scenario)!;
        const option = scenario.options.find((item) => item.id === choice.option)!;
        return <li key={choice.scenario}><p className="choice-situation">{scenario.situation}</p><p className="choice-option">{option.text}</p><span className={`tier-pill tier-${choice.tier}`}><i aria-hidden="true" />{choice.defense ? `${defenseMeta(choice.defense).name} · ${tierMeta(choice.tier).name}` : "직접 대처 · 성숙한 대처"}</span></li>;
      })}</ol>
    </section>
    <div className="measurement-note"><Icon name="shield" size={16} /><p>선택지는 실제 반응을 단순화한 예시예요. 한 장면에서의 선택이 나를 정의하지 않으며, 같은 상황도 그날의 상태에 따라 다르게 반응할 수 있어요. 점수가 아닌 ‘알아차림의 재료’로 써 주세요.</p></div>
    <div className="session-actions"><button type="button" className="text-link" onClick={onReset}>선택 지우고 다시 하기</button><Link className="text-link" href="/learn">방어기제 사전 보기 <Icon name="chevron" size={13} /></Link></div>
  </div>;
}

/** 일상 장면 8개에서 ‘가장 먼저 떠오를 것 같은 반응’을 고릅니다. 선택은 이 탭에만 저장돼요. */
export function ScenarioQuiz() {
  const store = scenarioStore.useValue();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  if (!store.ready) return <p role="status">저장된 선택을 확인하고 있어요.</p>;
  const session = store.value ?? createScenarioSession();
  const reset = () => { scenarioStore.clear(); setConfirmReset(false); };

  if (session.completed) {
    return <>{confirmReset ? <div className="reset-confirmation" role="group" aria-label="선택 삭제 확인"><p>이 탭에 저장된 상황 선택을 지우고 처음부터 할까요?</p><div className="session-actions"><button type="button" className="button button-primary" onClick={reset}>지우고 다시 하기</button><button type="button" className="text-link" onClick={() => setConfirmReset(false)}>취소</button></div></div> : null}
      <ScenarioResult profile={analyzeScenarios(session.choices)} onReset={() => setConfirmReset(true)} /></>;
  }

  const scenario = scenarios[session.currentIndex];
  const chosen = session.choices[scenario.id];
  function choose(optionId: string) {
    const choices = { ...session.choices, [scenario.id]: optionId };
    const isLast = session.currentIndex === scenarios.length - 1;
    scenarioStore.set({ ...session, choices, completed: isLast && Object.keys(choices).length === scenarios.length, currentIndex: isLast ? session.currentIndex : session.currentIndex + 1 });
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  return <>
    <NumberKeys count={scenario.options.length} onPick={(index) => choose(scenario.options[index].id)} />
    <section className="question-card" aria-labelledby="scenario-title">
      <div className="question-meta"><span>상황 {session.currentIndex + 1} / {scenarios.length}</span><span>{Object.keys(session.choices).length}개 선택</span></div>
      <div className="question-progress" aria-hidden="true"><span style={{ width: `${(Object.keys(session.choices).length / scenarios.length) * 100}%` }} /></div>
      <h2 id="scenario-title" ref={headingRef} tabIndex={-1}>{scenario.situation}</h2>
      <p className="question-hint">가장 바람직한 반응이 아니라, 솔직하게 <strong>가장 먼저 떠오를 것 같은 반응</strong>을 골라 주세요.</p>
      <div className="scenario-options" role="group" aria-labelledby="scenario-title">{scenario.options.map((option) => <button key={option.id} type="button" aria-pressed={chosen === option.id} className="scenario-option" onClick={() => choose(option.id)}><span className="option-key" aria-hidden="true">{scenario.options.indexOf(option) + 1}</span>{option.text}</button>)}</div>
      <div className="question-bottom"><button type="button" className="text-link" disabled={session.currentIndex === 0} onClick={() => scenarioStore.set({ ...session, currentIndex: session.currentIndex - 1 })}>이전 상황</button><span className="subtle-label">고르면 다음 상황으로 넘어가요<span className="kbd-hint"> · 숫자 키 <kbd>1</kbd>–<kbd>5</kbd></span></span></div>
    </section>
  </>;
}
