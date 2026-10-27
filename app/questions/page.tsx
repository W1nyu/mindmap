import type { Metadata } from "next";
import { ModuleHub } from "@/components/module-hub";
import { PageHero } from "@/components/page-hero";
import { ProgressBloom } from "@/components/progress-bloom";

export const metadata: Metadata = { title: "검사" };

export default function QuestionsPage() {
  return <div className="hub-page">
    <PageHero title="어떤 면부터 살펴볼까요?" aside={<ProgressBloom />}
      description={<p>검사 하나가 지도의 가지 하나예요. 하나만 해도 결과를 볼 수 있고, 여러 개를 마치면 가지 사이의 연결이 보여요. 간편 검사는 단축형, 심층 검사는 같은 척도의 전체형이에요.</p>} />
    <ModuleHub />
  </div>;
}
