import { ATTACHMENT_NORMS } from "@/data/attachment";

const SIZE = 240;
const PAD = { left: 44, top: 14, right: 14, bottom: 40 };
/** 원 척도 1–7을 평면 좌표로 옮깁니다. */
const toX = (mean: number) => PAD.left + ((mean - 1) / 6) * SIZE;
const toY = (mean: number) => PAD.top + ((7 - mean) / 6) * SIZE;

const quadrants = [
  { name: "안정형", x: 0.5, y: 6.6, anchor: "start" },
  { name: "몰입형", x: 0.5, y: 1.4, anchor: "start" },
  { name: "거부-회피형", x: 7, y: 6.6, anchor: "end" },
  { name: "두려움-회피형", x: 7, y: 1.4, anchor: "end" },
] as const;

/**
 * 관계 불안(세로) × 친밀 회피(가로) 평면(원 척도 1–7) 위의 위치. 점선은 ECR-R 온라인 표본 평균이며,
 * 네 칸에는 Bartholomew & Horowitz(1991)의 유형 이름을 옅게 적었습니다.
 */
export function AttachmentPlane({ anxiety, avoidance, compact = false }: { anxiety: number; avoidance: number; compact?: boolean }) {
  return <svg className={`attachment-plane ${compact ? "compact" : ""}`} viewBox={`0 0 ${PAD.left + SIZE + PAD.right} ${PAD.top + SIZE + PAD.bottom}`} role="img" aria-label={`관계 불안 평균 ${anxiety.toFixed(1)}, 친밀 회피 평균 ${avoidance.toFixed(1)} (1–7)`}>
    <rect x={PAD.left} y={PAD.top} width={SIZE} height={SIZE} className="plane-bg" />
    {[1, 4, 7].map((tick) => <g key={tick}>
      <line x1={toX(tick)} y1={PAD.top} x2={toX(tick)} y2={PAD.top + SIZE} className="plane-grid" />
      <line x1={PAD.left} y1={toY(tick)} x2={PAD.left + SIZE} y2={toY(tick)} className="plane-grid" />
      {!compact && <text x={toX(tick)} y={PAD.top + SIZE + 14} textAnchor="middle" className="plane-tick">{tick}</text>}
      {!compact && <text x={PAD.left - 6} y={toY(tick) + 3} textAnchor="end" className="plane-tick">{tick}</text>}
    </g>)}
    <line x1={toX(ATTACHMENT_NORMS.avoidance)} y1={PAD.top} x2={toX(ATTACHMENT_NORMS.avoidance)} y2={PAD.top + SIZE} className="plane-norm" />
    <line x1={PAD.left} y1={toY(ATTACHMENT_NORMS.anxiety)} x2={PAD.left + SIZE} y2={toY(ATTACHMENT_NORMS.anxiety)} className="plane-norm" />
    {!compact && quadrants.map((quadrant) => <text key={quadrant.name} x={quadrant.anchor === "start" ? PAD.left + 6 : PAD.left + SIZE - 6} y={quadrant.y > 4 ? PAD.top + SIZE - 8 : PAD.top + 16} textAnchor={quadrant.anchor} className="plane-quadrant">{quadrant.name}</text>)}
    <text x={PAD.left + SIZE / 2} y={PAD.top + SIZE + (compact ? 16 : 32)} textAnchor="middle" className="plane-axis">친밀 회피 →</text>
    <text x={12} y={PAD.top + SIZE / 2} textAnchor="middle" className="plane-axis" transform={`rotate(-90 12 ${PAD.top + SIZE / 2})`}>관계 불안 →</text>
    <circle cx={toX(avoidance)} cy={toY(anxiety)} r={compact ? 7 : 9} className="plane-point" />
    {!compact && <text x={toX(avoidance)} y={toY(anxiety) - 14} textAnchor="middle" className="plane-label">{`(${avoidance.toFixed(1)}, ${anxiety.toFixed(1)})`}</text>}
  </svg>;
}
