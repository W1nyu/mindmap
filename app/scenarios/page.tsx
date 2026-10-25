import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ScenarioQuiz } from "@/components/scenario-quiz";

export const metadata: Metadata = { title: "상황 반응 살펴보기" };

export default function ScenariosPage() {
  return <div className="question-page">
    <Link href="/questions" className="text-link back-link"><Icon name="chevron" size={14} style={{ transform: "rotate(180deg)" }} /> 모듈 목록</Link>
    <div className="eyebrow"><span className="tiny-line" /> IN THE MOMENT</div>
    <h1 className="page-title">상황 반응 살펴보기</h1>
    <p className="page-description">설문이 ‘평소의 나’를 묻는다면, 여기서는 구체적인 장면 8개에서 가장 먼저 나올 것 같은 반응을 골라요. 방어기제 프로필과 함께 보면, 생각하는 나와 장면 속의 나를 비교해 볼 수 있어요.</p>
    <div className="preview-notice"><Icon name="spark" size={18} /><p><strong>8개 장면 · 장면마다 5개 선택지 · 약 2분</strong><br />선택지마다 연결된 방어 방식이 있지만, 좋고 나쁨의 순서는 없어요. 결과는 진단이 아니며 선택은 이 탭에만 저장돼요.</p></div>
    <ScenarioQuiz />
  </div>;
}
