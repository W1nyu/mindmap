import type { Metadata } from "next";
import { DataManager } from "@/components/data-manager";

export const metadata: Metadata = { title: "내 데이터" };

export default function MyDataPage() {
  return <div className="learn-page">
    <div className="eyebrow"><span className="tiny-line" /> YOUR DATA, YOUR DEVICE</div>
    <h1 className="page-title">내 데이터</h1>
    <p className="page-description">SelfMap은 회원가입도 서버 저장도 없어요. 모든 응답과 기록은 지금 쓰는 브라우저 안에만 있고, 여기서 확인하고 옮기고 지울 수 있어요.</p>
    <DataManager />
  </div>;
}
