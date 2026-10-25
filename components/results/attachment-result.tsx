import { AttachmentPlane } from "@/components/charts/attachment-plane";
import { attachmentMeta, attachmentQuestions } from "@/data/attachment";
import type { AttachmentProfile } from "@/lib/attachment-analysis";
import { HIGH_LEANING_MIN, LOW_LEANING_MAX } from "@/lib/trait-analysis";
import { QualityNote } from "./result-frame";

const leaningLabel = { low: "낮은 편", mixed: "가운데 범위", high: "높은 편" } as const;

export function AttachmentCalculation({ profile }: { profile: AttachmentProfile }) {
  const position = (id: string) => attachmentQuestions.findIndex((item) => item.id === id) + 1;
  return <>
    <h2>점수는 이렇게 계산해요</h2>
    <p>차원마다 6문항(역채점 2개, 가중치 1) → 역채점 문항은 4 − 응답 → 합 ÷ 24 × 100 → 반올림. {LOW_LEANING_MAX} 이하·{HIGH_LEANING_MIN} 이상을 한쪽으로 기운 범위로 봅니다. 애착 ‘유형’을 판정하지 않습니다.</p>
    <p>응답 {profile.result.responseCount}개 · 질문지 {profile.result.instrumentVersion} · 채점 {profile.result.scoringVersion}</p>
    <details className="score-evidence"><summary>차원별 계산 내역 · 2개</summary>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="애착 차원 계산 근거 표"><table><caption className="sr-only">차원별 문항 번호, 응답, 채점값</caption><thead><tr><th scope="col">차원</th><th scope="col">문항(응답→채점)</th><th scope="col">합</th><th scope="col">점수</th></tr></thead><tbody>
        {profile.result.scales.map((scale) => <tr key={scale.scale}><th scope="row">{attachmentMeta.find((item) => item.id === scale.scale)!.name}</th><td>{scale.evidence.map((item) => `${position(item.questionId)}번(${item.rawValue}${item.reverse ? `→${item.scoredValue}` : ""})`).join(" · ")}</td><td>{scale.weightedSum}</td><td>{scale.score}</td></tr>)}
      </tbody></table></div>
    </details>
  </>;
}

export function AttachmentResult({ profile }: { profile: AttachmentProfile }) {
  const axes = [
    { meta: attachmentMeta[0], value: profile.anxiety },
    { meta: attachmentMeta[1], value: profile.avoidance },
  ];
  return <div className="result-stack">
    <QualityNote quality={profile.quality} />
    <div className="result-two-col">
      <section className="viz-card" aria-labelledby="plane-title">
        <div className="viz-heading"><div><span className="eyebrow small">TWO DIMENSIONS</span><h2 id="plane-title">가까운 관계 속 나의 위치</h2></div><span className="subtle-label">옅은 띠: 가운데 범위</span></div>
        <AttachmentPlane anxiety={profile.anxiety.score} avoidance={profile.avoidance.score} />
        <p className="viz-caption">가로는 친밀 회피, 세로는 관계 불안이에요. 칸을 나누는 이름은 붙이지 않았어요. 두 차원은 연속적이고, 관계와 시기에 따라 위치가 달라질 수 있어요.</p>
      </section>
      <section className="viz-card" aria-labelledby="axes-title">
        <div className="viz-heading"><div><span className="eyebrow small">EACH AXIS</span><h2 id="axes-title">두 축이 말해 주는 것</h2></div></div>
        <div className="axis-notes">{axes.map(({ meta, value }) => <article key={meta.id}>
          <div className="trait-row-head"><h3>{meta.name}</h3><span className="trait-score">{value.score}<small> / 100 · {leaningLabel[value.leaning]}</small></span></div>
          <div className="trait-track" aria-hidden="true"><span className="trait-mid" style={{ left: `${LOW_LEANING_MAX + 1}%`, width: `${HIGH_LEANING_MIN - LOW_LEANING_MAX - 2}%` }} /><span className="trait-marker" style={{ left: `${value.score}%` }} /></div>
          <p className="trait-description">{meta.description}</p>
          <p className="viz-text">{meta[value.leaning]}</p>
        </article>)}</div>
        {profile.combined && <p className="combined-note">{profile.combined}</p>}
      </section>
    </div>
    <div className="measurement-note"><p>애착 경향은 어린 시절의 경험뿐 아니라 지금의 관계, 상대, 삶의 상황에 따라 계속 달라질 수 있어요. 한 관계에서의 모습이 모든 관계를 대표하지 않으며, 안정적인 관계 경험이 쌓이면 위치도 움직일 수 있어요.</p></div>
  </div>;
}
