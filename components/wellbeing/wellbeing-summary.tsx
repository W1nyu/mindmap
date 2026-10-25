"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@/components/icon";
import { wellbeingBands } from "@/data/wellbeing";
import { wellbeingTrend } from "@/lib/wellbeing";
import { wellbeingStore } from "./wellbeing-store";

/** 홈 대시보드용: 최근 웰빙 체크 점수와 짧은 흐름. 체크가 없으면 첫 체크를 권합니다. */
export function WellbeingSummaryCard() {
  const store = wellbeingStore.useValue();
  const points = useMemo(() => wellbeingTrend(store.value), [store.value]);
  if (!store.ready) return null;
  const latest = points[points.length - 1];
  const recent = points.slice(-8);
  return <section className="viz-card wb-summary" aria-labelledby="wb-summary-title">
    <div className="viz-heading" style={{ marginBottom: 8 }}><h2 id="wb-summary-title">요즘의 상태</h2><Link className="text-link" href="/check-in">{latest ? "체크 보기" : "체크하기"} <Icon name="chevron" size={13} /></Link></div>
    {latest ? <>
      <div className="wb-summary-line">
        <strong>{latest.score}</strong>
        <span>{wellbeingBands.find((band) => band.id === latest.band)!.label}{latest.change !== null ? ` · 직전보다 ${latest.change > 0 ? "+" : ""}${latest.change}` : ""}</span>
      </div>
      {recent.length > 1 && <svg className="wb-summary-spark" viewBox="0 0 160 36" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" x2="160" y1={36 - 0.5 * 36} y2={36 - 0.5 * 36} className="wb-grid" />
        <polyline className="wb-line" points={recent.map((point, index) => `${(index / (recent.length - 1)) * 156 + 2},${(36 - (point.score / 100) * 32 - 2).toFixed(1)}`).join(" ")} />
      </svg>}
      <p className="viz-caption">WHO-5 웰빙 지표 · 최근 2주 기준</p>
    </> : <p className="viz-text">네 모듈이 ‘평소의 나’라면 이건 ‘요즘의 나’예요. 다섯 문장, 1분이면 최근 2주의 웰빙을 0–100으로 볼 수 있어요.</p>}
  </section>;
}
