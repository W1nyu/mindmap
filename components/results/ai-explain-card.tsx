"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { buildExplainPayload, validateExplanation, type Explanation } from "@/lib/explain";
import type { ModuleResults } from "@/lib/integration";

type State =
  | { status: "checking" | "disabled" | "idle" | "loading" }
  | { status: "done"; explanation: Explanation; model: string }
  | { status: "error"; message: string };

const errorMessages: Record<string, string> = {
  rate_limited: "요청이 많아 잠시 후 다시 시도해 주세요.",
  refusal: "이번에는 해설을 만들지 못했어요.",
  invalid: "해설이 SelfMap의 원칙(숫자·진단 표현 금지)을 지키지 않아 보여드리지 않았어요.",
};

/**
 * 선택형 AI 해설. 사용자가 동의하고 누를 때만 척도 점수를 서버로 보내고, 서버가 Claude API에 해설을 요청합니다.
 * 점수는 이미 계산된 값 그대로이며, 해설은 화면에서도 한 번 더 검증합니다.
 */
export function AiExplainCard({ results }: { results: ModuleResults }) {
  const [state, setState] = useState<State>({ status: "checking" });
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/explain").then((response) => response.json()).then((data: { enabled?: boolean }) => {
      if (active) setState({ status: data.enabled ? "idle" : "disabled" });
    }).catch(() => active && setState({ status: "disabled" }));
    return () => { active = false; };
  }, []);

  if (state.status === "checking" || state.status === "disabled") return null;

  async function request() {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/explain", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...buildExplainPayload(results), consent: true }) });
      const data = await response.json();
      const explanation = response.ok ? validateExplanation(data.explanation) : null;
      if (explanation) setState({ status: "done", explanation, model: String(data.model ?? "") });
      else setState({ status: "error", message: errorMessages[data.error] ?? "해설을 만들지 못했어요. 위의 규칙 기반 해석을 참고해 주세요." });
    } catch {
      setState({ status: "error", message: "연결에 실패했어요. 위의 규칙 기반 해석을 참고해 주세요." });
    }
  }

  return <section className="viz-card ai-card no-print" aria-labelledby="ai-title">
    <div className="viz-heading"><div><span className="eyebrow small">OPTIONAL · AI</span><h2 id="ai-title">AI 해설 받아 보기</h2></div><span className="subtle-label">선택 기능</span></div>
    {state.status !== "done" && <>
      <p className="viz-text">완료한 모듈의 <strong>척도 이름과 점수만</strong> 이 서버를 거쳐 Anthropic의 Claude API로 보내 해설을 받아요. 문항 응답, 마음 기록, 저장 기록은 보내지 않아요. 보낸 데이터는 Anthropic의 정책에 따라 처리돼요.</p>
      <label className="toggle-option"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> 위 내용을 이해했고, 점수를 보내는 데 동의해요</label>
      <div className="hero-actions"><button type="button" className="button button-primary" disabled={!consent || state.status === "loading"} onClick={request}>{state.status === "loading" ? "해설을 쓰는 중…" : "AI 해설 받기"} <Icon name="spark" size={15} /></button></div>
      {state.status === "error" && <p className="form-message" role="alert">{state.message}</p>}
    </>}
    {state.status === "done" && <div className="ai-result" role="status">
      <p className="ai-badge"><Icon name="spark" size={13} /> AI가 쓴 해설 · 점수는 위 계산 결과 그대로이며 AI가 바꿀 수 없어요{state.model ? ` · ${state.model}` : ""}</p>
      <p className="ai-overview">{state.explanation.overview}</p>
      <div className="ai-columns">
        <div><h3>강점 가능성</h3><ul>{state.explanation.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h3>살펴볼 점</h3><ul>{state.explanation.cautions.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h3>스스로에게 묻기</h3><ul>{state.explanation.questions.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
      <p className="viz-caption">AI 해설은 틀릴 수 있고, 진단이 아니에요. 맞지 않는다고 느끼는 부분은 흘려보내 주세요. 해설은 저장되지 않아요.</p>
    </div>}
  </section>;
}
