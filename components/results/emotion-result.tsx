import { ProfileRadar } from "@/components/charts/profile-radar";
import { emotionMeta } from "@/data/emotion";
import type { EmotionProfile } from "@/lib/emotion-analysis";
import { QualityNote } from "./result-frame";

const meta = (id: string) => emotionMeta.find((item) => item.id === id)!;

/** DERS 여섯 영역. 점수가 높을수록 그 영역의 조절이 어렵다는 뜻이며, 낮은 영역은 강점으로 함께 보여줍니다. */
export function EmotionResult({ profile }: { profile: EmotionProfile }) {
  const scales = profile.result.scales;
  return <div className="result-stack">
    <QualityNote quality={profile.quality} />
    <div className="result-two-col">
      <section className="viz-card" aria-labelledby="emotion-radar-title">
        <div className="viz-heading"><div><h2 id="emotion-radar-title">정서조절곤란 여섯 하위요인</h2></div><span className="subtle-label">바깥일수록 어려움</span></div>
        <ProfileRadar data={scales.map((scale) => ({ name: meta(scale.scale).shortName, score: scale.score }))} />
        <p className="viz-caption">DERS 총점 {profile.total.sum}점 (범위 {profile.total.min}–{profile.total.max})</p>
      </section>
      <section className="viz-card" aria-labelledby="emotion-list-title">
        <div className="viz-heading"><div><h2 id="emotion-list-title">영역별로 보면</h2></div><span className="subtle-label">평균 1–5</span></div>
        <ul className="emotion-list">{[...scales].sort((a, b) => b.score - a.score).map((scale) => {
          const item = meta(scale.scale);
          const hard = scale.score >= 50;
          return <li key={scale.scale} className={hard ? "hard" : "easy"}>
            <div className="emotion-row-head"><h3>{item.shortName}</h3><span>{scale.mean.toFixed(1)}<small> / 5</small></span></div>
            <div className="score-track" aria-hidden="true"><span style={{ width: `${scale.score}%` }} /></div>
            <p>{hard ? item.difficulty : item.strength}</p>
          </li>;
        })}</ul>
      </section>
    </div>
  </div>;
}
