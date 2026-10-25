import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { JournalApp } from "@/components/journal/journal-app";

export const metadata: Metadata = { title: "마음 기록" };

export default function JournalPage() {
  return <div className="journal-page">
    <div className="eyebrow"><span className="tiny-line" /> NOTICE THE FLOW</div>
    <h1 className="page-title">마음 기록</h1>
    <p className="page-description">설문이 ‘평소의 나’를 비춘다면, 기록은 ‘그 순간의 나’를 담아요. 반응이 크게 일었던 순간을 상황부터 회복까지의 흐름으로 적어 보세요.</p>
    <div className="preview-notice"><Icon name="spark" size={18} /><p><strong>정답도, 잘 써야 할 이유도 없어요.</strong><br />모든 칸을 채우지 않아도 괜찮아요. 쌓인 기록은 감정·욕구·방어 방식이 어떤 상황에서 반복되는지 알아차리는 데 도움이 될 수 있어요.</p></div>
    <JournalApp />
  </div>;
}
