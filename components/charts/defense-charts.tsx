import { dmrsLevels, dmrsMeasurementNote } from "@/data/defense-levels";
import { defenseMeta, defenseTiers, tierMeta } from "@/data/defense-mechanisms";
import { balanceZone, type DefenseProfile } from "@/lib/defense-analysis";
import { dmrsProfile } from "@/lib/defense-levels";
import { bandLabels, scoreBand } from "@/lib/interpretation";
import type { DefenseTierId } from "@/types/defense";

const tierClass = (tier: DefenseTierId) => `tier-${tier}`;
const signed = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : "±"}${Math.abs(value).toFixed(1)}`;

/** 세 수준의 점수 타일과 상대 구성비(합 100) 막대. 색 외에 수준 이름과 수치를 항상 함께 표시합니다. */
export function TierSummary({ profile }: { profile: DefenseProfile }) {
  return <section className="viz-card" aria-labelledby="tier-summary-title">
    <div className="viz-heading"><div><span className="eyebrow small">THREE LEVELS</span><h2 id="tier-summary-title">세 가지 수준의 방어</h2></div><span className="subtle-label">수준별 문항 평균 · 0–100</span></div>
    <div className="tier-tiles">{profile.tiers.map((tier) => {
      const meta = tierMeta(tier.tier);
      return <article key={tier.tier} className={`tier-tile ${tierClass(tier.tier)}`}>
        <span className="tier-swatch" aria-hidden="true" />
        <h3>{meta.name}</h3>
        <p className="tier-score"><strong>{tier.score}</strong><small> / 100 · {bandLabels[scoreBand(tier.score)]}</small></p>
        <div className="mini-track" aria-hidden="true"><span style={{ width: `${tier.score}%` }} /></div>
        <p className="tier-defenses">{tier.defenses.map((id) => defenseMeta(id).name).join(" · ")}</p>
      </article>;
    })}</div>
    {profile.composition ? <div className="composition">
      <p className="viz-caption">세 수준 평균을 합 100으로 나눈 상대 비중</p>
      <div className="composition-bar" role="img" aria-label={`상대 비중: ${profile.composition.map((item) => `${tierMeta(item.tier).name} ${item.share}%`).join(", ")}`}>
        {profile.composition.filter((item) => item.share > 0).map((item) => <span key={item.tier} className={tierClass(item.tier)} style={{ flexGrow: item.share }} data-tip={`${tierMeta(item.tier).name} ${item.share}%`}>{item.share >= 12 ? `${item.share}%` : ""}</span>)}
      </div>
      <ul className="viz-legend">{profile.composition.map((item) => <li key={item.tier} className={tierClass(item.tier)}><i aria-hidden="true" />{tierMeta(item.tier).name} {item.share}%</li>)}</ul>
    </div> : <p className="viz-caption">모든 방어 점수가 0이라 상대 비중을 계산하지 않았어요.</p>}
  </section>;
}

/** 무게중심 스펙트럼. 좌(즉각 보호)→우(성숙한 대처)의 위치만 표시하고 좋고 나쁨의 색 그라데이션은 쓰지 않습니다. */
export function BalanceSpectrum({ profile }: { profile: DefenseProfile }) {
  const balance = profile.balance;
  const zone = balance ? balanceZone(balance.position) : null;
  return <section className="viz-card" aria-labelledby="balance-title">
    <div className="viz-heading"><div><span className="eyebrow small">CENTER OF GRAVITY</span><h2 id="balance-title">스트레스 속 방어의 무게중심</h2></div><span className="subtle-label">DMRS 전반 방어 기능(ODF)에서 착안한 참고 지표</span></div>
    {balance && zone ? <>
      <div className="spectrum" role="img" aria-label={`무게중심 위치 ${balance.position} / 100, ${zone.label}`}>
        <div className="spectrum-track">{defenseTiers.map((tier) => <span key={tier.id} className={`spectrum-anchor ${tierClass(tier.id)}`} style={{ left: `${(tier.level - 1) * 50}%` }} />)}</div>
        <span className="spectrum-marker" style={{ left: `${balance.position}%` }}><b>{balance.position}</b></span>
      </div>
      <div className="spectrum-labels" aria-hidden="true"><span>즉각 보호형</span><span>내면 조정형</span><span>성숙한 대처</span></div>
      <p className="spectrum-zone"><strong>{zone.label}</strong> · 위치 {balance.position} / 100 (지수 {balance.value.toFixed(2)}, 범위 1–3)</p>
      <p className="viz-text">{zone.text}</p>
    </> : <p className="viz-text">모든 방어 점수가 0이라 무게중심을 계산하지 않았어요.</p>}
  </section>;
}

/** 15개 방어기제를 수준별로 묶은 사다리. 수준 안에서는 점수 내림차순(동점은 기본 순서)입니다. */
export function DefenseLadder({ profile }: { profile: DefenseProfile }) {
  return <section className="viz-card" aria-labelledby="ladder-title">
    <div className="viz-heading"><div><span className="eyebrow small">DEFENSE LADDER</span><h2 id="ladder-title">15가지 방어기제 사다리</h2></div><span className="subtle-label">0–24 드묾 · 25–49 가끔 · 50–74 자주 · 75+ 두드러짐</span></div>
    <div className="ladder">{profile.tiers.map((tier) => {
      const rows = profile.result.scales.filter((scale) => tier.defenses.includes(scale.scale))
        .map((scale, index) => ({ scale, index })).sort((a, b) => b.scale.score - a.scale.score || a.index - b.index).map(({ scale }) => scale);
      return <div key={tier.tier} className={`ladder-group ${tierClass(tier.tier)}`}>
        <h3><i aria-hidden="true" />{tierMeta(tier.tier).name} <small>{tier.score}</small></h3>
        <ul>{rows.map((scale) => {
          const meta = defenseMeta(scale.scale);
          const band = bandLabels[scoreBand(scale.score)];
          return <li key={scale.scale} data-tip={`${meta.name}(${meta.englishName}) · ${scale.score}점 · ${band} · 응답 ${scale.evidence.map((item) => item.rawValue).join(", ")}`}>
            <span className="ladder-name">{meta.name}</span>
            <span className="ladder-track" aria-hidden="true"><span style={{ width: `${scale.score}%` }} /></span>
            <span className="ladder-value">{scale.score}<small>{band}</small></span>
          </li>;
        })}</ul>
      </div>;
    })}</div>
  </section>;
}

/** 개인 평균 대비 차이. 위치가 방향(평균보다 높음/낮음)을, 색이 수준을 나타냅니다. */
export function DeviationBars({ profile }: { profile: DefenseProfile }) {
  const max = Math.max(10, ...profile.relative.map((item) => Math.abs(item.deviation)));
  const rows = profile.relative.map((item, index) => ({ item, index })).sort((a, b) => b.item.deviation - a.item.deviation || a.index - b.index).map(({ item }) => item);
  return <section className="viz-card" aria-labelledby="deviation-title">
    <div className="viz-heading"><div><span className="eyebrow small">RELATIVE TO MY AVERAGE</span><h2 id="deviation-title">나의 평균과 비교하면</h2></div><span className="subtle-label">개인 평균 {profile.personalMean.toFixed(1)}점 기준</span></div>
    <p className="viz-text">전반적으로 높게 또는 낮게 답하는 응답 스타일의 영향을 덜어 내고, 내 안에서 상대적으로 자주·드물게 꺼내는 방어를 보여줘요.</p>
    <ul className="deviation-list">{rows.map((item) => {
      const meta = defenseMeta(item.defense);
      const width = (Math.abs(item.deviation) / max) * 50;
      return <li key={item.defense} className={tierClass(meta.tier)} data-tip={`${meta.name} ${item.score}점 · 평균 대비 ${signed(item.deviation)}`}>
        <span className="deviation-name">{meta.name}</span>
        <span className="deviation-track" aria-hidden="true"><i className="deviation-axis" /><span className={item.deviation >= 0 ? "pos" : "neg"} style={{ width: `${width}%`, [item.deviation >= 0 ? "left" : "right"]: "50%" }} /></span>
        <span className="deviation-value">{signed(item.deviation)}</span>
      </li>;
    })}</ul>
    <ul className="viz-legend">{defenseTiers.map((tier) => <li key={tier.id} className={tierClass(tier.id)}><i aria-hidden="true" />{tier.name}</li>)}</ul>
  </section>;
}

/**
 * DMRS 7단계 위계. 위가 7(높은 적응)이고, 왼쪽 레일의 표시는 점수 가중 평균 수준이에요.
 * 막대는 전체 방어 점수 중 그 수준의 몫, 칩은 그 수준에 속한 방어와 점수입니다.
 */
export function DmrsHierarchy({ profile }: { profile: DefenseProfile }) {
  const dmrs = dmrsProfile(profile.result.scales);
  const metaOf = new Map(dmrsLevels.map((meta) => [meta.level, meta]));
  const top = [...dmrs.levels].filter((level) => level.measured).sort((a, b) => b.share - a.share || b.level - a.level)[0];
  const markerTop = dmrs.index === null ? null : (((7 - dmrs.index) + 0.5) / 7) * 100;
  return <section className="viz-card" aria-labelledby="dmrs-title">
    <div className="viz-heading"><div><h2 id="dmrs-title">방어 위계 7단계</h2><p className="viz-caption" style={{ marginTop: 2 }}>방어 기제 평정 척도(DMRS, Perry)와 DSM-IV 방어기능척도의 위계에 15개 방어를 놓았어요. 위로 갈수록 감정과 현실을 그대로 둔 채 다루는 방식이에요.</p></div></div>
    {dmrs.index !== null && top ? <p className="dmrs-summary"><span>점수 가중 평균 수준</span><strong>{dmrs.index.toFixed(2)}</strong><small>/ 7</small><span className="dmrs-summary-text">가장 큰 몫은 {top.level}단계 {metaOf.get(top.level)!.name}({top.share}%)이에요.</span></p>
      : <p className="viz-text">모든 방어 점수가 0이라 위계 위치를 계산하지 않았어요.</p>}
    <div className="dmrs">
      <div className="dmrs-rail" aria-hidden="true">
        {markerTop !== null && <span className="dmrs-marker" style={{ top: `${markerTop}%` }}><b>{dmrs.index!.toFixed(2)}</b></span>}
      </div>
      <ol className="dmrs-levels">
        {dmrs.levels.map((level) => {
          const meta = metaOf.get(level.level)!;
          return <li key={level.level} className={`dmrs-level ${meta.tier ? `tier-${meta.tier}` : "unmeasured"}`}>
            <span className="dmrs-badge">{level.level}</span>
            <div className="dmrs-head">
              <h3>{meta.name} <small>{meta.academicName}</small></h3>
              {level.measured ? <span className="dmrs-bar" aria-hidden="true"><span style={{ width: `${level.share}%` }} /></span> : null}
            </div>
            <div className="dmrs-value">{level.measured ? <><strong>{level.share}%</strong><small>평균 {level.score}</small></> : <small>묻지 않음</small>}</div>
            {level.measured
              ? <ul className="dmrs-chips">{[...level.defenses].sort((a, b) => b.score - a.score).map((item) => <li key={item.defense}>{defenseMeta(item.defense).name} <b>{item.score}</b></li>)}</ul>
              : <p className="dmrs-note">{meta.description}</p>}
            <span className="sr-only">{level.measured ? `${level.level}단계 ${meta.name}: 전체 몫 ${level.share}%, 평균 ${level.score}점` : `${level.level}단계 ${meta.name}: 이 설문에서 묻지 않는 수준`}</span>
          </li>;
        })}
      </ol>
    </div>
    <details className="dmrs-details"><summary>각 단계는 어떤 방식인가요?</summary>
      <dl>{dmrsLevels.filter((meta) => meta.defenses.length > 0).map((meta) => <div key={meta.level}><dt>{meta.level}단계 · {meta.name}</dt><dd>{meta.description}</dd></div>)}</dl>
    </details>
    <p className="viz-caption">{dmrsMeasurementNote} 낮은 단계의 방어도 힘든 순간에 나를 지켜 온 방식이며, 누구나 상황에 따라 여러 단계를 오가요.</p>
  </section>;
}
