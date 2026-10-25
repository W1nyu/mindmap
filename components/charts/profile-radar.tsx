"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip } from "recharts";

/** 척도 점수 레이더(0–100). 같은 수치를 목록과 계산 표에서 텍스트로도 제공합니다. */
export function ProfileRadar({ data }: { data: readonly { name: string; score: number }[] }) {
  return <figure className="radar-figure">
    <RadarChart responsive data={[...data]} outerRadius="72%" style={{ width: "100%", maxWidth: 420, aspectRatio: 1, margin: "0 auto" }} accessibilityLayer={false}>
      <PolarGrid stroke="var(--line-strong)" />
      <PolarAngleAxis dataKey="name" tick={{ fill: "var(--text-2)", fontSize: 13 }} />
      <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} angle={60} />
      <Radar name="점수" dataKey="score" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.16} dot={{ r: 4, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }} isAnimationActive={false} />
      <Tooltip formatter={(value) => [`${value}점`, "점수"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12 }} />
    </RadarChart>
  </figure>;
}
