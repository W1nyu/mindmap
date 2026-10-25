import { HIGH_LEANING_MIN, LOW_LEANING_MAX } from "@/lib/trait-analysis";

const SIZE = 240;
const PAD = { left: 44, top: 14, right: 14, bottom: 40 };
const toX = (score: number) => PAD.left + (score / 100) * SIZE;
const toY = (score: number) => PAD.top + ((100 - score) / 100) * SIZE;

/**
 * 관계 불안(세로)×친밀 회피(가로) 평면 위의 현재 위치. 사분면 이름(유형)을 붙이지 않고,
 * 가운데 범위(38–62)만 옅게 표시합니다. 같은 수치를 옆 텍스트로도 제공합니다.
 */
export function AttachmentPlane({ anxiety, avoidance, compact = false, compare }: { anxiety: number; avoidance: number; compact?: boolean; compare?: { anxiety: number; avoidance: number; label: string } }) {
  const midStart = LOW_LEANING_MAX + 1;
  const midSize = HIGH_LEANING_MIN - LOW_LEANING_MAX - 2;
  return <svg className={`attachment-plane ${compact ? "compact" : ""}`} viewBox={`0 0 ${PAD.left + SIZE + PAD.right} ${PAD.top + SIZE + PAD.bottom}`} role="img" aria-label={`관계 불안 ${anxiety}점, 친밀 회피 ${avoidance}점 위치${compare ? `. ${compare.label}: 관계 불안 ${compare.anxiety}, 친밀 회피 ${compare.avoidance}` : ""}`}>
    <rect x={PAD.left} y={PAD.top} width={SIZE} height={SIZE} className="plane-bg" />
    <rect x={toX(midStart)} y={PAD.top} width={(midSize / 100) * SIZE} height={SIZE} className="plane-mid" />
    <rect x={PAD.left} y={toY(midStart + midSize)} width={SIZE} height={(midSize / 100) * SIZE} className="plane-mid" />
    {[0, 50, 100].map((tick) => <g key={tick}>
      <line x1={toX(tick)} y1={PAD.top} x2={toX(tick)} y2={PAD.top + SIZE} className="plane-grid" />
      <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + SIZE} y2={toY(tick)} className="plane-grid" />
      {!compact && <text x={toX(tick)} y={PAD.top + SIZE + 14} textAnchor="middle" className="plane-tick">{tick}</text>}
      {!compact && <text x={PAD.left - 6} y={toY(tick) + 3} textAnchor="end" className="plane-tick">{tick}</text>}
    </g>)}
    <text x={PAD.left + SIZE / 2} y={PAD.top + SIZE + (compact ? 16 : 32)} textAnchor="middle" className="plane-axis">친밀 회피 →</text>
    <text x={12} y={PAD.top + SIZE / 2} textAnchor="middle" className="plane-axis" transform={`rotate(-90 12 ${PAD.top + SIZE / 2})`}>관계 불안 →</text>
    {compare && <g className="plane-compare">
      <line x1={toX(compare.avoidance)} y1={toY(compare.anxiety)} x2={toX(avoidance)} y2={toY(anxiety)} />
      <circle cx={toX(compare.avoidance)} cy={toY(compare.anxiety)} r={6} />
    </g>}
    <circle cx={toX(avoidance)} cy={toY(anxiety)} r={compact ? 7 : 9} className="plane-point" />
    {!compact && <text x={toX(avoidance)} y={toY(anxiety) - 14} textAnchor="middle" className="plane-label">{`(${avoidance}, ${anxiety})`}</text>}
  </svg>;
}
