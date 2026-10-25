import type { Metadata } from "next";
import { WellbeingCheckApp } from "@/components/wellbeing/wellbeing-check";

export const metadata: Metadata = { title: "마음 상태 체크" };

export default function CheckInPage() {
  return <div className="learn-page">
    <h1 className="page-title">마음 상태 체크</h1>
    <p className="page-description">WHO-5 웰빙 지표로 오늘이나 이번 주의 상태를 0–100으로 기록해요. 진단이 아니에요.</p>
    <WellbeingCheckApp />
  </div>;
}
