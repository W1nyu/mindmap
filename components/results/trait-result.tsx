import { traitMeta } from "@/data/traits";
import type { TraitProfile } from "@/lib/trait-analysis";
import { HIGH_LEANING_MIN, LOW_LEANING_MAX } from "@/lib/trait-analysis";
import type { TraitLeaning } from "@/types/traits";
import { QualityNote } from "./result-frame";

const meta = (id: string) => traitMeta.find((item) => item.id === id)!;

function leaningText(leaning: TraitLeaning, low: string, high: string) {
  if (leaning === "low") return `‘${low}’ 쪽으로 기우는 편`;
  if (leaning === "high") return `‘${high}’ 쪽으로 기우는 편`;
  return "상황에 따라 양쪽을 오가는 편";
}

/** 양극 스펙트럼. 가운데 구간(38–62)은 음영으로만 표시하고 어느 쪽 끝도 강조하지 않습니다. */
function TraitSpectrum({ profile }: { profile: TraitProfile }) {
  return <section className="viz-card" aria-labelledby="trait-spectrum-title">
    <div className="viz-heading"><div><h2 id="trait-spectrum-title">다섯 가지 스펙트럼 위의 나</h2></div><span className="subtle-label">가운데 음영: 양쪽을 오가는 범위</span></div>
    <ul className="trait-list module-traits">{profile.leanings.map((item) => {
      const trait = meta(item.trait);
      return <li key={item.trait}>
        <div className="trait-row-head"><h3>{trait.name}</h3><span className="trait-score">{item.mean.toFixed(1)}<small> / 5</small></span></div>
        <div className="trait-track" role="img" aria-label={`${trait.name} ${item.score}점, ${leaningText(item.leaning, trait.lowPole, trait.highPole)}`} data-tip={`${trait.name} ${item.score}점`}>
          <span className="trait-mid" style={{ left: `${LOW_LEANING_MAX + 1}%`, width: `${HIGH_LEANING_MIN - LOW_LEANING_MAX - 2}%` }} />
          <span className="trait-marker" style={{ left: `${item.score}%` }} />
        </div>
        <div className="trait-poles"><span>{trait.lowPole}</span><span>{trait.highPole}</span></div>
        <p className="trait-leaning">{leaningText(item.leaning, trait.lowPole, trait.highPole)}</p>
        {profile.facets.length > 0 && <ul className="facet-list" aria-label={`${trait.name} 하위 측면`}>{profile.facets.filter((facet) => facet.domain === item.trait).map((facet) => <li key={facet.id}>
          <span>{facet.name}</span><span className="facet-track" aria-hidden="true"><span style={{ width: `${Math.max(2, facet.score)}%` }} /></span><b>{facet.mean.toFixed(1)}</b>
        </li>)}</ul>}
      </li>;
    })}</ul>
  </section>;
}

function TraitNotes({ profile }: { profile: TraitProfile }) {
  return <section aria-labelledby="trait-notes-title">
    <div className="section-heading"><div><h2 id="trait-notes-title">강점과 살펴볼 점</h2></div></div>
    <div className="trait-note-grid">{profile.leanings.map((item) => {
      const trait = meta(item.trait);
      const strength = item.leaning === "low" ? trait.lowStrength : item.leaning === "high" ? trait.highStrength : `${trait.lowStrength}, 그리고 ${trait.highStrength}을(를) 상황에 맞게 오갈 수 있어요`;
      const challenge = item.leaning === "low" ? trait.lowChallenge : item.leaning === "high" ? trait.highChallenge : "어느 쪽이 더 편한지 스스로도 헷갈리거나, 상황마다 에너지가 다르게 들 수 있어요.";
      return <article key={item.trait} className="trait-note">
        <h3>{trait.name}</h3>
        <dl className="dimension-notes"><dt>강점</dt><dd>{strength}</dd><dt>살펴볼 점</dt><dd>{challenge}</dd></dl>
      </article>;
    })}</div>
  </section>;
}

export function TraitResult({ profile }: { profile: TraitProfile }) {
  return <div className="result-stack">
    <QualityNote quality={profile.quality} />
    <TraitSpectrum profile={profile} />
    <TraitNotes profile={profile} />
  </div>;
}
