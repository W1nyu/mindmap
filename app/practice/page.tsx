import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { BreathingGuide } from "@/components/breathing-guide";
import { PracticeBoard } from "@/components/practice-board";

export const metadata: Metadata = { title: "실천 카드" };

export default function PracticePage() {
  return <div className="learn-page">
    <div className="eyebrow"><span className="tiny-line" /> SMALL STEPS</div>
    <h1 className="page-title">실천 카드</h1>
    <p className="page-description">이해에서 한 걸음 더. 결과와 연결된 짧은 연습을 골라 일상에서 시도해 보세요.</p>
    <div className="preview-notice"><Icon name="spark" size={18} /><p><strong>상담이나 치료를 대신하지 않는 자기 돌봄 연습이에요.</strong><br />하다가 불편함이 커지면 언제든 멈춰도 괜찮아요. 추천은 고정된 규칙으로 고른 것이며, 점수가 나를 정의하지 않아요.</p></div>
    <BreathingGuide />
    <PracticeBoard />
  </div>;
}
