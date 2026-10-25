import { DefenseLadder, DmrsHierarchy, TierSummary } from "@/components/charts/defense-charts";
import { Icon } from "@/components/icon";
import { defenseMeasurementNote, defenseMeta, tierMeta } from "@/data/defense-mechanisms";
import { defenseQuestions } from "@/data/defense-questions";
import { HIGHLIGHT_MIN_SCORE, type DefenseProfile } from "@/lib/defense-analysis";
import { bandLabels, scoreBand } from "@/lib/interpretation";
import { QualityNote } from "./result-frame";

function Highlights({ profile }: { profile: DefenseProfile }) {
  if (profile.highlights.length === 0) {
    return <section className="viz-card" aria-labelledby="highlight-title"><h2 id="highlight-title">자주 꺼내는 방어</h2><p className="viz-text">{HIGHLIGHT_MIN_SCORE}점 이상으로 두드러진 방어기제는 없었어요. 아래 사다리에서 상대적으로 높은 항목을 살펴보세요.</p></section>;
  }
  return <section aria-labelledby="highlight-title" className="highlight-section">
    <div className="section-heading"><div><h2 id="highlight-title">자주 꺼내는 방어</h2></div></div>
    <div className="highlight-grid">{profile.highlights.map((item, index) => {
      const meta = defenseMeta(item.defense);
      return <article key={item.defense} className={`highlight-card tier-${item.tier}`}>
        <div className="highlight-top"><span className="tier-pill"><i aria-hidden="true" />{tierMeta(item.tier).name}</span><span className="highlight-rank">{index + 1}{item.closeToPrevious ? " · 비슷한 수준" : ""}</span></div>
        <h3>{meta.name} <small>{meta.englishName}</small></h3>
        <p className="highlight-score"><strong>{item.score}</strong> / 100 · {bandLabels[scoreBand(item.score)]}</p>
        <p className="highlight-summary">{meta.summary}</p>
        <dl className="highlight-details">
          <div><dt>지켜 주는 것</dt><dd>{meta.protects}</dd></div>
          <div><dt>생길 수 있는 비용</dt><dd>{meta.cost}</dd></div>
          <div className="growth"><dt>한 걸음 더</dt><dd>{meta.growth}</dd></div>
        </dl>
      </article>;
    })}</div>
    
  </section>;
}

function Resources({ profile }: { profile: DefenseProfile }) {
  return <section className="viz-card resource-card" aria-labelledby="resource-title">
    <div className="viz-heading"><div><h2 id="resource-title">이미 가진 자원</h2></div></div>
    {profile.resources.length > 0 ? <>
      <p className="viz-text">힘든 순간에 꺼내 쓸 수 있는 성숙한 대처예요.</p>
      <ul className="chip-list">{profile.resources.map((id) => <li key={id}><Icon name="leaf" size={14} /> {defenseMeta(id).name} · {profile.result.scales.find((scale) => scale.scale === id)!.score}</li>)}</ul>
    </> : <p className="viz-text">아직 {HIGHLIGHT_MIN_SCORE}점 이상인 성숙한 대처는 없었어요. 부족하다는 뜻이 아니라 앞으로 늘려 갈 여지예요.</p>}
  </section>;
}

export function DefenseCalculation({ profile }: { profile: DefenseProfile }) {
  const position = (id: string) => defenseQuestions.findIndex((item) => item.id === id) + 1;
  return <>
    <h2>점수는 이렇게 계산해요</h2>
    <p>방어기제마다 3문항(역채점 없음, 가중치 1) → 응답 합 ÷ 12 × 100 → 반올림. 수준 점수는 해당 수준 모든 문항의 같은 방식 평균입니다.</p>
    <p>무게중심 지수 = (3 × 성숙한 대처 평균 + 2 × 내면 조정형 평균 + 1 × 즉각 보호형 평균) ÷ 세 평균의 합. 1–3 범위를 0–100 위치로 옮겼어요. 개인 평균 대비 = 각 점수 − 15개 점수의 평균.</p>
    <p>7단계 위계(DMRS): 각 방어를 한 단계에 놓고, 단계의 몫 = 그 단계 방어 점수의 합 ÷ 15개 점수의 합(합 100, 최대 나머지 방식), 점수 가중 평균 수준 = Σ(단계 × 방어 점수) ÷ Σ방어 점수(범위 1–7). 4·2단계는 이 설문에서 묻지 않아 몫이 0입니다.</p>
    <p>응답 {profile.result.responseCount}개 · 질문지 {profile.result.instrumentVersion} · 채점 {profile.result.scoringVersion}</p>
    <details className="score-evidence"><summary>방어기제별 계산 내역 · 15개</summary>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="방어기제 계산 근거 표"><table><caption className="sr-only">방어기제별 문항 번호, 응답, 점수</caption><thead><tr><th scope="col">방어기제</th><th scope="col">수준</th><th scope="col">문항(응답)</th><th scope="col">합</th><th scope="col">점수</th></tr></thead><tbody>
        {profile.result.scales.map((scale) => {
          const meta = defenseMeta(scale.scale);
          return <tr key={scale.scale}><th scope="row">{meta.name}</th><td>{tierMeta(meta.tier).name}</td><td>{scale.evidence.map((item) => `${position(item.questionId)}번(${item.rawValue})`).join(" · ")}</td><td>{scale.weightedSum}</td><td>{scale.score}</td></tr>;
        })}
      </tbody></table></div>
    </details>
  </>;
}

export function DefenseResult({ profile }: { profile: DefenseProfile }) {
  return <div className="result-stack">
    <QualityNote quality={profile.quality} />
    <div className="result-two-col"><TierSummary profile={profile} /><Resources profile={profile} /></div>
    <Highlights profile={profile} />
    <div className="result-two-col"><DefenseLadder profile={profile} /><DmrsHierarchy profile={profile} /></div>
    <div className="measurement-note"><Icon name="shield" size={16} /><p>{defenseMeasurementNote}</p></div>
  </div>;
}
