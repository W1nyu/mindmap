import { dimensions } from "@/data/dimensions";
import { dimensionNotes } from "@/data/dimension-notes";
import { questions } from "@/data/questions";
import type { DimensionScore } from "@/types/psychology";

export function ScoreCard({ result }: { result: DimensionScore }) {
  const dimension = dimensions.find((item) => item.id === result.dimension)!;
  const notes = dimensionNotes[result.dimension];
  return <article className="score-card dimension-result">
    <div className="card-heading"><h2>{dimension.name}</h2><strong className="dimension-score">{result.score}<small> / 100</small></strong></div>
    <div className="score-track" aria-hidden="true"><span style={{ width: `${result.score}%` }} /></div>
    <p className="dimension-description">{dimension.description}</p>
    <p className="dimension-note-label">차원의 일반적인 가능성 · 개인 분석 아님</p>
    <dl className="dimension-notes"><dt>강점 가능성</dt><dd>{notes.strength}</dd><dt>어려움 가능성</dt><dd>{notes.difficulty}</dd></dl>
    <details className="score-evidence"><summary>계산 내역 · {result.evidence.length}개 문항</summary>
      <p>가중 합 {result.weightedSum} ÷ 가중치 합 {result.weightSum} ÷ 4 × 100 = {result.score} (반올림)</p>
      <div className="table-scroll" tabIndex={0} role="region" aria-label={`${dimension.name} 계산 근거 표`}><table><caption className="sr-only">응답과 역채점, 가중치</caption><thead><tr><th scope="col">문항</th><th scope="col">응답</th><th scope="col">역채점</th><th scope="col">채점값</th><th scope="col">가중치</th></tr></thead><tbody>{result.evidence.map((item) => <tr key={item.questionId}><th scope="row">{questions.findIndex((question) => question.id === item.questionId) + 1}번</th><td>{item.rawValue}</td><td>{item.reverse ? "4 − 응답" : "없음"}</td><td>{item.scoredValue}</td><td>{item.weight}</td></tr>)}</tbody></table></div>
    </details>
  </article>;
}
