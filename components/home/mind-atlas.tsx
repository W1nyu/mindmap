import Link from "next/link";
import type { CSSProperties } from "react";
import { attachmentMeta } from "@/data/attachment";
import { defenseTiers } from "@/data/defense-mechanisms";
import { emotionMeta } from "@/data/emotion";
import { assessmentModules, type ModuleId } from "@/data/modules";
import { traitMeta } from "@/data/traits";

/** 첫 화면의 마인드맵: 가운데의 나에서 네 검사로, 검사에서 실제로 재는 지표로 가지가 뻗습니다. */
const W = 760;
const H = 520;
const C = { x: W / 2, y: H / 2 };
const LEAF_R = 118;

/** turn: 잎 부채를 돌려 아래쪽 글자가 겹치지 않게 합니다(라디안). */
const branches: { id: ModuleId; x: number; y: number; bend: number; turn?: number; leaves: readonly string[] }[] = [
  { id: "emotion", x: 222, y: 150, bend: 34, leaves: emotionMeta.map((item) => item.shortName) },
  { id: "defense", x: 552, y: 128, bend: -30, leaves: defenseTiers.map((item) => item.name) },
  { id: "traits", x: 206, y: 388, bend: -36, turn: 0.3, leaves: traitMeta.map((item) => item.shortName) },
  { id: "attachment", x: 556, y: 392, bend: 30, leaves: attachmentMeta.map((item) => item.shortName) },
];

const f = (n: number) => n.toFixed(1);

/** 두 점 사이를 옆으로 bend만큼 휜 곡선 */
function curve(x0: number, y0: number, x1: number, y1: number, bend: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (x0 + x1) / 2 - (dy / len) * bend;
  const cy = (y0 + y1) / 2 + (dx / len) * bend;
  return `M${f(x0)},${f(y0)} Q${f(cx)},${f(cy)} ${f(x1)},${f(y1)}`;
}

function leafPositions(x: number, y: number, count: number, turn = 0) {
  const dir = Math.atan2(y - C.y, x - C.x) + turn;
  const spread = Math.min(2, (count - 1) * 0.4);
  return Array.from({ length: count }, (_, index) => {
    const angle = dir + (count === 1 ? 0 : -spread / 2 + (spread * index) / (count - 1));
    return { x: x + LEAF_R * Math.cos(angle), y: y + LEAF_R * Math.sin(angle), right: Math.cos(angle) >= 0 };
  });
}

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export function MindAtlas() {
  return <svg className="atlas" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="네 검사와 각 검사가 재는 지표">
    {branches.map((branch, b) => {
      const assessment = assessmentModules[branch.id];
      const leaves = leafPositions(branch.x, branch.y, branch.leaves.length, branch.turn);
      const pill = assessment.title.length * 16 + 34;
      return <g key={branch.id} className={`atlas-branch module-${branch.id}`}>
        <path className="atlas-stem" pathLength={1} style={delay(0.15 + b * 0.12)} d={curve(C.x, C.y, branch.x, branch.y, branch.bend)} />
        {leaves.map((leaf, index) => <g key={branch.leaves[index]} className="atlas-leaf" style={delay(0.75 + b * 0.12 + index * 0.05)}>
          <path pathLength={1} d={curve(branch.x, branch.y, leaf.x, leaf.y, leaf.right ? -10 : 10)} />
          <circle cx={f(leaf.x)} cy={f(leaf.y)} r="3.5" />
          <text x={f(leaf.x + (leaf.right ? 10 : -10))} y={f(leaf.y + 5.5)} textAnchor={leaf.right ? "start" : "end"}>{branch.leaves[index]}</text>
        </g>)}
        <Link href={`/questions/${branch.id}`} className="atlas-node" style={delay(0.55 + b * 0.12)} aria-label={`${assessment.title} 검사 시작`}>
          <rect x={f(branch.x - pill / 2)} y={f(branch.y - 21)} width={pill} height="42" rx="21" />
          <text x={f(branch.x)} y={f(branch.y + 6)} textAnchor="middle">{assessment.title}</text>
        </Link>
      </g>;
    })}
    <g className="atlas-center">
      <circle cx={C.x} cy={C.y} r="62" className="atlas-halo" />
      <circle cx={C.x} cy={C.y} r="42" />
      <text x={C.x} y={C.y + 10} textAnchor="middle">나</text>
    </g>
  </svg>;
}
