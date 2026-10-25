"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip } from "recharts";
import { dimensions } from "@/data/dimensions";
import type { ScoringResult } from "@/types/psychology";

/** 8개 반응 차원 레이더. 같은 수치를 카드와 계산 표에서 텍스트로도 제공합니다. */
export function ReactionRadar({ result, compare }: { result: ScoringResult; compare?: { label: string; result: ScoringResult } }) {
  const data = dimensions.map((dimension) => ({
    name: dimension.shortName,
    score: result.dimensions.find((item) => item.dimension === dimension.id)!.score,
    compare: compare?.result.dimensions.find((item) => item.dimension === dimension.id)!.score,
  }));
  return <figure className="radar-figure">
    <RadarChart responsive data={data} outerRadius="72%" style={{ width: "100%", maxWidth: 460, aspectRatio: 1, margin: "0 auto" }} accessibilityLayer={false}>
      <PolarGrid stroke="var(--line-strong)" />
      <PolarAngleAxis dataKey="name" tick={{ fill: "var(--text-2)", fontSize: 13 }} />
      <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} angle={67.5} />
      {compare && <Radar name={compare.label} dataKey="compare" stroke="var(--tier-immediate)" strokeWidth={2} strokeDasharray="5 4" fill="var(--tier-immediate)" fillOpacity={0.06} isAnimationActive={false} />}
      <Radar name="현재 결과" dataKey="score" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.16} dot={{ r: 4, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }} isAnimationActive={false} />
      <Tooltip formatter={(value, name) => [`${value}점`, name]} contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12 }} />
    </RadarChart>
    <figcaption className="viz-caption">{compare ? `실선: 현재 결과 · 점선: ${compare.label}. ` : ""}중심 0 → 바깥 100. 각 축의 값은 아래 카드에 숫자로도 있어요.</figcaption>
  </figure>;
}
