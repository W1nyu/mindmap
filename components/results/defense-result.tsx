import { DefenseLadder, DmrsHierarchy, TierSummary } from "@/components/charts/defense-charts";
import { Icon } from "@/components/icon";
import { defenseMeasurementNote, defenseMeta, tierMeta } from "@/data/defense-mechanisms";
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
        <p className="highlight-score"><strong>{item.mean.toFixed(1)}</strong> / 9 · {bandLabels[scoreBand(item.score)]}</p>
        <p className="highlight-summary">{meta.summary}</p>
        <dl className="highlight-details">
          <div><dt>지켜 주는 것</dt><dd>{meta.protects}</dd></div>
          <div><dt>생길 수 있는 비용</dt><dd>{meta.cost}</dd></div>
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
      <ul className="chip-list">{profile.resources.map((id) => <li key={id}><Icon name="leaf" size={14} /> {defenseMeta(id).name} · {profile.result.scales.find((scale) => scale.scale === id)!.mean.toFixed(1)}</li>)}</ul>
    </> : <p className="viz-text">아직 {HIGHLIGHT_MIN_SCORE}점 이상인 성숙한 대처는 없었어요. 부족하다는 뜻이 아니라 앞으로 늘려 갈 여지예요.</p>}
  </section>;
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
