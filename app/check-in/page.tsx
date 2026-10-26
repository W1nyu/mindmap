import type { Metadata } from "next";
import { CheckInTabs } from "@/components/check-in-tabs";

export const metadata: Metadata = { title: "마음 상태 체크" };

export default function CheckInPage() {
  return <div className="learn-page">
    <h1 className="page-title">마음 상태 체크</h1>
    <CheckInTabs />
  </div>;
}
