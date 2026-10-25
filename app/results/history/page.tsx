import type { Metadata } from "next";
import Link from "next/link";
import { HistoryView } from "@/components/history/history-view";
import { Icon } from "@/components/icon";
import { isModuleId } from "@/data/modules";

export const metadata: Metadata = { title: "결과 기록과 변화" };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ module?: string | string[] }> }) {
  const { module: moduleParam } = await searchParams;
  return <>
    <Link href="/results" className="text-link back-link"><Icon name="chevron" size={14} style={{ transform: "rotate(180deg)" }} /> 전체 지도</Link>
    <div className="eyebrow"><span className="tiny-line" /> OVER TIME</div>
    <h1 className="page-title">결과 기록과 변화</h1>
    <p className="page-description">저장한 결과를 시간에 따라 비교해요. 같은 사람도 시기와 상황에 따라 다르게 응답할 수 있다는 점을 함께 기억해 주세요.</p>
    <HistoryView initialModule={isModuleId(moduleParam) ? moduleParam : null} />
  </>;
}
