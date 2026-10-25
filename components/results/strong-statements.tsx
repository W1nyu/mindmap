import { assessmentModules, type ModuleId } from "@/data/modules";
import { likertOptions } from "@/data/questions";
import { strongestStatements } from "@/lib/interpretation";
import { moduleResponses, type ModuleResult } from "@/lib/module-results";

/** 내가 가장 강하게 동의한 문장. 점수를 실제로 고른 말과 다시 연결해 줍니다. */
export function StrongStatements({ id, result }: { id: ModuleId; result: ModuleResult }) {
  const assessment = assessmentModules[id];
  const statements = strongestStatements(assessment.instrument, moduleResponses(result));
  return <section className="viz-card" aria-labelledby="statements-title">
    <div className="viz-heading"><div><span className="eyebrow small">IN MY OWN WORDS</span><h2 id="statements-title">내가 강하게 동의한 문장</h2></div><span className="subtle-label">‘꽤 그렇다’ 이상 · 최대 5개</span></div>
    {statements.length > 0 ? <ol className="statement-list">{statements.map((statement) => <li key={statement.questionId}>
      <p>“{statement.text}”</p>
      <span>{likertOptions.find((option) => option.value === statement.value)?.label} · {assessment.scales.find((scale) => scale.id === statement.scale)?.name}{statement.reverse ? " · 반대 방향 문항(동의할수록 이 경향이 낮게 계산돼요)" : ""}</span>
    </li>)}</ol> : <p className="viz-text">‘꽤 그렇다’ 이상으로 답한 문장이 없어요. 대부분의 문장에 조심스럽게 답한 편이에요.</p>}
    <p className="viz-caption">점수보다 이 문장들이 더 와닿는다면, 그 문장을 출발점으로 마음 기록을 써 보세요.</p>
  </section>;
}
