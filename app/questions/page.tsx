import type { Metadata } from "next";
import { ModuleHub } from "@/components/module-hub";

export const metadata: Metadata = { title: "질문" };

export default function QuestionsPage() {
  return <div className="hub-page"><h1 className="page-title">어떤 면부터 살펴볼까요?</h1><p className="page-description">하나만 해도 결과를 볼 수 있고, 여러 개를 마치면 하나의 지도로 이어져요.</p><ModuleHub /></div>;
}
