import { ReactionRadar } from "@/components/charts/reaction-radar";
import { Icon } from "@/components/icon";
import { ScoreCard } from "@/components/score-card";
import { dimensionNotes } from "@/data/dimension-notes";
import { dimensions } from "@/data/dimensions";
import { FEATURE_MIN, FEATURE_NEAR_TIE, HIGH_MIN, LOW_MAX, reactionInsights } from "@/lib/reaction-insights";
import type { ResponseQuality } from "@/types/assessment";
import type { ScoringResult } from "@/types/psychology";
import { QualityNote } from "./result-frame";

const dimensionName = (id: string) => dimensions.find((item) => item.id === id)!.name;

export function ReactionCalculation({ result }: { result: ScoringResult }) {
  return <>
    <h2>점수는 이렇게 계산해요</h2>
    <p>응답 0–4 → 역채점 문항은 4 − 응답 → 차원별 가중 평균 ÷ 4 × 100 → 반올림. 각 차원에 4개 문항, 가중치는 모두 1입니다. 총점이나 성격 유형을 만들지 않습니다.</p>
    <p>해석 규칙: 상위 특징은 {FEATURE_MIN}점 이상 중 최대 3개(앞 순위와 {FEATURE_NEAR_TIE}점 이내면 비슷한 수준), 상호작용은 관련 차원이 모두 {HIGH_MIN}점 이상(또는 {LOW_MAX}점 이하)일 때만 표시합니다.</p>
    <p>응답 {result.responseCount}개 · 질문지 {result.questionnaireVersion} · 채점 {result.scoringVersion}</p>
  </>;
}

export function ReactionResult({ result, quality }: { result: ScoringResult; quality: ResponseQuality }) {
  const insights = reactionInsights(result);
  return <div className="result-stack">
    <QualityNote quality={quality} />
    <div className="result-two-col">
      <section className="viz-card" aria-labelledby="radar-title"><div className="viz-heading"><div><span className="eyebrow small">EIGHT DIMENSIONS</span><h2 id="radar-title">반응 패턴 지도</h2></div><span className="subtle-label">0–100 · 높고 낮음에 정답은 없어요</span></div><ReactionRadar result={result} /></section>
      <section className="viz-card" aria-labelledby="feature-title">
        <div className="viz-heading"><div><span className="eyebrow small">TOP FEATURES</span><h2 id="feature-title">지금 두드러진 경향</h2></div></div>
        {insights.features.length > 0 ? <ol className="feature-list">{insights.features.map((item, index) => <li key={item.dimension}>
          <span className="feature-rank">{index + 1}</span>
          <div><h3>{dimensionName(item.dimension)} <small>{item.score}점{item.closeToPrevious ? " · 앞 순위와 비슷한 수준" : ""}</small></h3>
            <p><b>강점 가능성</b> {dimensionNotes[item.dimension].strength}</p><p><b>어려움 가능성</b> {dimensionNotes[item.dimension].difficulty}</p></div>
        </li>)}</ol> : <p className="viz-text">{FEATURE_MIN}점 이상으로 두드러진 차원이 없어요. 여러 상황에서 반응이 비교적 고르게 나타나는 편일 수 있어요.</p>}
      </section>
    </div>
    <section aria-labelledby="flow-title">
      <div className="section-heading"><div><span className="eyebrow small">REACTION FLOW</span><h2 id="flow-title">이런 흐름이 나타날 수 있어요</h2><p>가장 높은 반응 차원을 바탕으로 그린 가능한 흐름이에요. 실제로 겪은 일이라고 단정하지 않아요. 맞지 않는 부분은 흘려보내 주세요.</p></div></div>
      {insights.flow ? <ol className="pattern-flow personal-flow" aria-label="상황에서 회복까지의 가능한 흐름">
        {([["상황", insights.flow.steps.situation], ["자동 해석", insights.flow.steps.thought], ["감정", insights.flow.steps.emotion], ["핵심 욕구", insights.flow.steps.need], ["행동 경향", insights.flow.steps.action], ["회복", `관점·회복 ${insights.recovery.score}점`]] as const).map(([label, text], index) => <li key={label}><div className={`flow-step ${index === 5 ? "recovery" : ""}`}><span>{String(index + 1).padStart(2, "0")} · {label}</span><strong>{text}</strong></div>{index < 5 && <Icon name="chevron" size={16} />}</li>)}
      </ol> : <p className="viz-text">두드러진 반응 차원이 없어 대표 흐름을 그리지 않았어요.</p>}
      <div className="recovery-line"><Icon name="leaf" size={16} /><p><strong>회복 흐름 · {insights.recovery.score}점</strong>{insights.recovery.text}</p></div>
    </section>
    <section aria-labelledby="interaction-title">
      <div className="section-heading"><div><span className="eyebrow small">INTERACTIONS</span><h2 id="interaction-title">차원이 만나는 지점</h2><p>두 차원이 함께 높거나 낮을 때 나타날 수 있는 흐름과, 시도해 볼 만한 작은 전략이에요.</p></div></div>
      {insights.rules.length > 0 ? <div className="interaction-grid">{insights.rules.map(({ rule, evidence }) => <article key={rule.id} className={`interaction-card ${rule.kind}`}>
        <span className="interaction-kind">{rule.kind === "resource" ? "자원" : "살펴볼 패턴"}</span>
        <h3>{rule.title}</h3><p>{rule.text}</p>
        <p className="interaction-strategy"><Icon name="spark" size={14} /> {rule.strategy}</p>
        <p className="interaction-evidence">근거: {evidence.map((item) => `${dimensionName(item.dimension)} ${item.score}`).join(" · ")}</p>
      </article>)}</div> : <p className="viz-text">함께 두드러진 차원 조합이 없어요. 아래 차원별 카드를 참고해 주세요.</p>}
    </section>
    <section className="result-grid" aria-label="8개 차원의 점수와 계산 근거">{result.dimensions.map((dimension) => <ScoreCard key={dimension.dimension} result={dimension} />)}</section>
  </div>;
}
