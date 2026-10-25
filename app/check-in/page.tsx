import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { WellbeingCheckApp } from "@/components/wellbeing/wellbeing-check";

export const metadata: Metadata = { title: "마음 상태 체크" };

export default function CheckInPage() {
  return <div className="learn-page">
    <h1 className="page-title">마음 상태 체크</h1>
    <p className="page-description">네 모듈이 ‘평소의 나’를 그린다면, 이 체크는 ‘요즘의 나’를 재요. 국제적으로 쓰이는 WHO-5 웰빙 지표로 최근 2주의 기분과 활력을 0–100으로 나타내고, 체크가 쌓이면 변화를 보여줘요.</p>
    <div className="preview-notice"><Icon name="spark" size={18} /><p><strong>상태를 살펴보는 지표이며, 진단이 아니에요.</strong><br />점수는 다섯 응답을 고정된 계산식(원점수 × 4)으로 바꾼 값이에요. 응답은 이 기기 브라우저에만 저장돼요.</p></div>
    <WellbeingCheckApp />
  </div>;
}
