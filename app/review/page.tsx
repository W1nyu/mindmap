import type { Metadata } from "next";
import { WeeklyReview } from "@/components/weekly-review";

export const metadata: Metadata = { title: "주간 돌아보기" };

export default function ReviewPage() {
  return <div className="learn-page">
    <div className="eyebrow"><span className="tiny-line" /> WEEKLY REVIEW</div>
    <h1 className="page-title">주간 돌아보기</h1>
    <p className="page-description">한 주 동안 남긴 마음 기록, 해 본 실천, 저장한 결과를 모아 봐요. 월요일부터 일요일까지를 한 주로 셉니다.</p>
    <WeeklyReview />
  </div>;
}
