import { ReactionRadar } from "@/components/charts/reaction-radar";
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
      <section className="viz-card" aria-labelledby="radar-title"><div className="viz-heading"><div><h2 id="radar-title">반응 패턴 지도</h2></div><span className="subtle-label">0–100</span></div><ReactionRadar result={result} /></section>
      <section className="viz-card" aria-labelledby="feature-title">
        <div className="viz-heading"><div><h2 id="feature-title">지금 두드러진 경향</h2></div></div>
        {insights.features.length > 0 ? <ol className="feature-list">{insights.features.map((item, index) => <li key={item.dimension}>
          <span className="feature-rank">{index + 1}</span>
          <div><h3>{dimensionName(item.dimension)} <small>{item.score}점{item.closeToPrevious ? " · 비슷한 수준" : ""}</small></h3>
            <p><b>강점</b> {dimensionNotes[item.dimension].strength}</p><p><b>어려움</b> {dimensionNotes[item.dimension].difficulty}</p></div>
        </li>)}</ol> : <p className="viz-text">{FEATURE_MIN}점 이상으로 두드러진 차원이 없어요. 여러 상황에서 반응이 비교적 고르게 나타나는 편일 수 있어요.</p>}
      </section>
    </div>
  </div>;
}
