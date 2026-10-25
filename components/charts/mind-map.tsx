import type { MindMapBranch } from "@/lib/mind-map";

/**
 * 고정 정수 좌표 배치(삼각함수 없음): 서버와 브라우저의 부동소수 차이로 인한 hydration 불일치를 막고,
 * 왼쪽·오른쪽 가지는 잎을 세로로, 위·아래 가지는 가로로 펼쳐 겹치지 않게 합니다.
 */
const CENTER = { x: 400, y: 255 };
const NODE = { width: 124, height: 50 };
const LEAF_HEIGHT = 44;
/** moduleIds 순서: 반응 패턴(왼쪽), 방어기제(오른쪽), 성격(아래), 애착(위) */
const slots = [
  { node: { x: 262, y: 255 }, leaf: (i: number, n: number) => ({ x: 88, y: 255 + (i - (n - 1) / 2) * 62 }), side: "left" },
  { node: { x: 538, y: 255 }, leaf: (i: number, n: number) => ({ x: 712, y: 255 + (i - (n - 1) / 2) * 62 }), side: "right" },
  { node: { x: 400, y: 383 }, leaf: (i: number, n: number) => ({ x: 400 + (i - (n - 1) / 2) * 180, y: 489 }), side: "bottom" },
  { node: { x: 400, y: 127 }, leaf: (i: number, n: number) => ({ x: 400 + (i - (n - 1) / 2) * 200, y: 30 }), side: "top" },
] as const;

const leafWidth = (label: string, detail: string) => Math.min(160, Math.max(label.length * 13, detail.length * 11) + 24);

function connector(side: (typeof slots)[number]["side"], node: { x: number; y: number }, leaf: { x: number; y: number }, width: number) {
  if (side === "bottom" || side === "top") {
    const direction = side === "bottom" ? 1 : -1;
    const startY = node.y + direction * (NODE.height / 2);
    const endY = leaf.y - direction * (LEAF_HEIGHT / 2);
    return `M${node.x},${startY} C${node.x},${(startY + endY) / 2} ${leaf.x},${(startY + endY) / 2} ${leaf.x},${endY}`;
  }
  const direction = side === "left" ? -1 : 1;
  const startX = node.x + direction * (NODE.width / 2);
  const endX = leaf.x - direction * (width / 2);
  const midX = (startX + endX) / 2;
  return `M${startX},${node.y} C${midX},${node.y} ${midX},${leaf.y} ${endX},${leaf.y}`;
}

/** 나 → 모듈 → 요약 잎으로 이어지는 마음 지도. 좁은 화면에서는 같은 내용을 목록으로 보여줍니다. */
export function MindMap({ branches, example, interactive = true }: { branches: readonly MindMapBranch[]; example: boolean; interactive?: boolean }) {
  const summary = branches.map((branch) => branch.completed ? `${branch.title}: ${branch.leaves.map((leaf) => `${leaf.label} ${leaf.detail}`).join(", ")}` : `${branch.title}: 응답 전`).join(". ");
  return <figure className="mindmap-figure">
    <svg className="mindmap" viewBox="0 0 800 520" role="img" aria-label={`마음 지도. ${summary}`}>
      {branches.map((branch, index) => {
        const slot = slots[index];
        const node = slot.node;
        const trunk = slot.side === "bottom" ? `M${CENTER.x},${CENTER.y + 40} L${node.x},${node.y - NODE.height / 2}`
          : slot.side === "top" ? `M${CENTER.x},${CENTER.y - 40} L${node.x},${node.y + NODE.height / 2}`
          : `M${CENTER.x + (slot.side === "left" ? -40 : 40)},${CENTER.y} L${node.x + (slot.side === "left" ? NODE.width / 2 : -NODE.width / 2)},${node.y}`;
        return <g key={branch.module} className={`mindmap-branch ${branch.completed ? "" : "pending"}`}>
          <path d={trunk} className="mindmap-link" />
          {branch.leaves.map((leaf, leafIndex) => {
            const point = slot.leaf(leafIndex, branch.leaves.length);
            const width = leafWidth(leaf.label, leaf.detail);
            return <g key={leaf.label} className="mindmap-leaf">
              <path d={connector(slot.side, node, point, width)} className="mindmap-sublink" />
              <rect x={point.x - width / 2} y={point.y - LEAF_HEIGHT / 2} width={width} height={LEAF_HEIGHT} rx={10} />
              <text x={point.x} y={point.y - 4} textAnchor="middle" className="leaf-label">{leaf.label}</text>
              <text x={point.x} y={point.y + 13} textAnchor="middle" className="leaf-detail">{leaf.detail}</text>
            </g>;
          })}
          {interactive ? <a href={branch.completed ? `/results/${branch.module}${example ? "?example=1" : ""}` : `/questions/${branch.module}`} aria-label={branch.completed ? `${branch.title} 결과 보기` : `${branch.title} 시작하기`}>
            <rect x={node.x - NODE.width / 2} y={node.y - NODE.height / 2} width={NODE.width} height={NODE.height} rx={25} className="mindmap-node" />
            <text x={node.x} y={node.y - 3} textAnchor="middle" className="node-label">{branch.title}</text>
            <text x={node.x} y={node.y + 14} textAnchor="middle" className="node-detail">{branch.completed ? "결과 보기 →" : "응답 전 · 시작하기"}</text>
          </a> : <g>
            <rect x={node.x - NODE.width / 2} y={node.y - NODE.height / 2} width={NODE.width} height={NODE.height} rx={25} className="mindmap-node" />
            <text x={node.x} y={node.y - 3} textAnchor="middle" className="node-label">{branch.title}</text>
            <text x={node.x} y={node.y + 14} textAnchor="middle" className="node-detail">{branch.completed ? "공유된 결과" : "공유되지 않음"}</text>
          </g>}
        </g>;
      })}
      <circle cx={CENTER.x} cy={CENTER.y} r={40} className="mindmap-center" />
      <text x={CENTER.x} y={CENTER.y + 7} textAnchor="middle" className="center-label">나</text>
    </svg>
    <ul className="mindmap-list" aria-hidden="true">{branches.map((branch) => <li key={branch.module}><strong>{branch.title}</strong>{branch.completed ? <ul>{branch.leaves.map((leaf) => <li key={leaf.label}>{leaf.label} · {leaf.detail}</li>)}</ul> : <span> · 응답 전</span>}</li>)}</ul>
  </figure>;
}
