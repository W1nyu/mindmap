import { traitMeta, traitQuestions } from "@/data/traits";
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
    <ul className="trait-list">{profile.leanings.map((item) => {
      const trait = meta(item.trait);
      return <li key={item.trait}>
        <div className="trait-row-head"><h3>{trait.name}</h3><span className="trait-score">{item.score}<small> / 100</small></span></div>
        <div className="trait-track" role="img" aria-label={`${trait.name} ${item.score}점, ${leaningText(item.leaning, trait.lowPole, trait.highPole)}`} data-tip={`${trait.name} ${item.score}점`}>
          <span className="trait-mid" style={{ left: `${LOW_LEANING_MAX + 1}%`, width: `${HIGH_LEANING_MIN - LOW_LEANING_MAX - 2}%` }} />
          <span className="trait-marker" style={{ left: `${item.score}%` }} />
        </div>
        <div className="trait-poles"><span>{trait.lowPole}</span><span>{trait.highPole}</span></div>
        <p className="trait-leaning">{leaningText(item.leaning, trait.lowPole, trait.highPole)}</p>
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

export function TraitCalculation({ profile }: { profile: TraitProfile }) {
  const position = (id: string) => traitQuestions.findIndex((item) => item.id === id) + 1;
  return <>
    <h2>점수는 이렇게 계산해요</h2>
    <p>요인마다 4문항(역채점 2개, 가중치 1) → 역채점 문항은 4 − 응답 → 합 ÷ 16 × 100 → 반올림. {LOW_LEANING_MAX} 이하·{HIGH_LEANING_MIN} 이상을 한쪽으로 기운 범위로 봅니다. 백분위가 아니며 다른 사람과 비교한 값이 아닙니다.</p>
    <p>응답 {profile.result.responseCount}개 · 질문지 {profile.result.instrumentVersion} · 채점 {profile.result.scoringVersion}</p>
    <details className="score-evidence"><summary>요인별 계산 내역 · 5개</summary>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="성격 요인 계산 근거 표"><table><caption className="sr-only">요인별 문항 번호, 응답, 채점값</caption><thead><tr><th scope="col">요인</th><th scope="col">문항(응답→채점)</th><th scope="col">합</th><th scope="col">점수</th></tr></thead><tbody>
        {profile.result.scales.map((scale) => <tr key={scale.scale}><th scope="row">{meta(scale.scale).name}</th><td>{scale.evidence.map((item) => `${position(item.questionId)}번(${item.rawValue}${item.reverse ? `→${item.scoredValue}` : ""})`).join(" · ")}</td><td>{scale.weightedSum}</td><td>{scale.score}</td></tr>)}
      </tbody></table></div>
    </details>
  </>;
}

export function TraitResult({ profile }: { profile: TraitProfile }) {
  return <div className="result-stack">
    <QualityNote quality={profile.quality} />
    <TraitSpectrum profile={profile} />
    <TraitNotes profile={profile} />
  </div>;
}
