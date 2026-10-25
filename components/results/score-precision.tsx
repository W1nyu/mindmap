"use client";

import { assessmentModules, type ModuleId } from "@/data/modules";
import type { ModuleResult } from "@/lib/module-results";
import { agreementLabels, profileShape, scalePrecision } from "@/lib/precision";

/** 같은 값의 문항 점은 위아래로 나눠 겹치지 않게 놓습니다. */
function stacked(values: readonly number[]) {
  const seen = new Map<number, number>();
  return values.map((value) => {
    const order = seen.get(value) ?? 0;
    seen.set(value, order + 1);
    return { value, offset: order % 2 === 0 ? -(order / 2) * 5 : ((order + 1) / 2) * 5 };
  });
}

/**
 * 점수의 확실도: 점수 하나 뒤에 있는 문항 응답들을 점으로, 표준오차 범위를 띠로 보여줍니다.
 * 범위가 넓으면 문항마다 답이 엇갈렸다는 뜻이라 점수를 한 숫자로 단정하지 않도록 돕습니다.
 */
export function ScorePrecision({ id, result }: { id: ModuleId; result: ModuleResult }) {
  const scales = result.profile.result.scales.map((item) => ({ id: item.scale as string, score: item.score, evidence: item.evidence }));
  const rows = scales.map((scale) => scalePrecision(scale.id, scale.score, scale.evidence, result.profile.result.points));
  const names = new Map(assessmentModules[id].scales.map((meta) => [meta.id as string, meta.shortName]));
  const shape = profileShape(rows.map((row) => row.score));
  const shapeText = shape.scatter < 10 ? "척도끼리 점수 차이가 작은 고른 프로필이에요" : shape.scatter >= 20 ? "높고 낮은 척도가 뚜렷하게 갈리는 프로필이에요" : "몇몇 척도가 두드러지는 프로필이에요";

  return <section className="viz-card" aria-labelledby="precision-title">
    <div className="viz-heading"><div><h2 id="precision-title">점수의 확실도</h2><p className="viz-caption" style={{ marginTop: 2 }}>점은 문항 응답, 띠는 ±1 표준오차예요. 띠가 넓을수록 답이 엇갈렸어요.</p></div></div>
    <dl className="precision-summary">
      <div><dt>프로필 높이</dt><dd>{shape.elevation}</dd><small>척도 점수 평균</small></div>
      <div><dt>프로필 퍼짐</dt><dd>{shape.scatter}</dd><small>척도 점수 표준편차</small></div>
      <p>{shapeText}.</p>
    </dl>
    <ul className="precision-list">
      {rows.map((row) => <li key={row.id}>
        <span className="precision-name">{names.get(row.id) ?? row.id}</span>
        <span className="precision-track" aria-hidden="true">
          <span className={`precision-band ${row.agreement}`} style={{ left: `${row.low}%`, width: `${Math.max(0.8, row.high - row.low)}%` }} />
          {stacked(row.itemScores).map((item, index) => <i key={index} className="precision-item" style={{ left: `${item.value}%`, marginTop: item.offset }} />)}
          <b className="precision-score" style={{ left: `${row.score}%` }} />
        </span>
        <span className="precision-value"><strong>{row.score}</strong> <small>{row.low}–{row.high}</small></span>
        <span className={`precision-agreement ${row.agreement}`}>{agreementLabels[row.agreement]}</span>
        <span className="sr-only">{`점수 ${row.score}, 범위 ${row.low}에서 ${row.high}, 문항 ${row.items}개, ${agreementLabels[row.agreement]}`}</span>
      </li>)}
    </ul>
  </section>;
}
