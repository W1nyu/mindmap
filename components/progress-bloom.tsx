"use client";

import { useModuleProgress } from "@/components/use-module-progress";
import type { ModuleId } from "@/data/modules";

/** 로고와 같은 네 가지. 마친 검사는 가지가 끝까지 칠해지고, 응답 중이면 응답한 만큼 칠해집니다. */
const stems: Record<ModuleId, string> = {
  emotion: "M32 32C30 22 22 14 12 13",
  defense: "M32 32c9-3 15-11 17-21",
  attachment: "M32 32c3 10 11 17 21 18",
  traits: "M32 32c-9 2-16 10-18 20",
};
const tips: Record<ModuleId, [number, number]> = { emotion: [12, 13], defense: [49, 11], attachment: [53, 50], traits: [14, 52] };

export function ProgressBloom() {
  const { ready, modules, completedCount } = useModuleProgress();
  return <figure className="bloom">
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {modules.map((item) => {
        const share = !ready ? 0 : item.completed ? 1 : item.answered / item.total;
        const [x, y] = tips[item.id];
        return <g key={item.id} className={`module-${item.id}`}>
          <path className="bloom-track" d={stems[item.id]} />
          {share > 0 && <path className="bloom-fill" d={stems[item.id]} pathLength={1} strokeDasharray={`${share} 1`} />}
          {item.completed && <circle className="bloom-tip" cx={x} cy={y} r="3.2" />}
        </g>;
      })}
      <circle cx="32" cy="32" r="8" className="bloom-center" />
    </svg>
    <figcaption>{ready ? (completedCount === 0 ? "아직 그린 가지가 없어요" : `${modules.length}갈래 중 ${completedCount}갈래를 그렸어요`) : " "}</figcaption>
  </figure>;
}
