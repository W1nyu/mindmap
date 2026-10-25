import { AttachmentPlane } from "@/components/charts/attachment-plane";
import { ATTACHMENT_NORMS, attachmentMeta } from "@/data/attachment";
import type { AttachmentProfile } from "@/lib/attachment-analysis";
import { QualityNote } from "./result-frame";

export function AttachmentResult({ profile }: { profile: AttachmentProfile }) {
  const axes = [
    { meta: attachmentMeta[0], value: profile.anxiety, norm: ATTACHMENT_NORMS.anxiety },
    { meta: attachmentMeta[1], value: profile.avoidance, norm: ATTACHMENT_NORMS.avoidance },
  ];
  return <div className="result-stack">
    <QualityNote quality={profile.quality} />
    <div className="result-two-col">
      <section className="viz-card" aria-labelledby="plane-title">
        <div className="viz-heading"><div><h2 id="plane-title">가까운 관계 속 나의 위치</h2></div><span className="subtle-label">점선: 표본 평균</span></div>
        <AttachmentPlane anxiety={profile.anxiety.mean} avoidance={profile.avoidance.mean} />
      </section>
      <section className="viz-card" aria-labelledby="axes-title">
        <div className="viz-heading"><div><h2 id="axes-title">두 축</h2></div><span className="subtle-label">평균 1–7</span></div>
        <div className="axis-notes">{axes.map(({ meta, value, norm }) => {
          const above = value.mean > norm;
          return <article key={meta.id}>
            <div className="trait-row-head"><h3>{meta.name}</h3><span className="trait-score">{value.mean.toFixed(1)}<small> / 7 · 표본 평균 {norm}</small></span></div>
            <div className="trait-track" aria-hidden="true"><span className="trait-norm" style={{ left: `${((norm - 1) / 6) * 100}%` }} /><span className="trait-marker" style={{ left: `${value.score}%` }} /></div>
            <p className="viz-text">{above ? meta.high : meta.low}</p>
          </article>;
        })}</div>
        <p className="viz-caption">표본 평균은 Fraley가 공개한 ECR-R 온라인 응답자 약 17,000명의 평균이에요.</p>
      </section>
    </div>
  </div>;
}
