import type { Metadata } from "next";
import Link from "next/link";
import { DefenseQuiz } from "@/components/defense-quiz";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "방어기제 찾기 연습" };

export default function QuizPage() {
  return <div className="question-page">
    <Link href="/learn" className="text-link back-link"><Icon name="chevron" size={14} style={{ transform: "rotate(180deg)" }} /> 방어기제 사전</Link>
    <div className="eyebrow"><span className="tiny-line" /> PRACTICE NOTICING</div>
    <h1 className="page-title">방어기제 찾기 연습</h1>
    <p className="page-description">일상의 짧은 장면을 읽고 어떤 방어기제에 가까운지 골라 보세요. 다른 사람을 판단하기 위한 연습이 아니라, 내 안에서 비슷한 순간을 알아차리는 눈을 기르기 위한 연습이에요.</p>
    <DefenseQuiz />
    <p className="quiet-note"><Icon name="shield" size={16} /> 연습 결과는 저장되지 않아요.</p>
  </div>;
}
