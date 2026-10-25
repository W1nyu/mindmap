import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ModuleHub } from "@/components/module-hub";

export const metadata: Metadata = { title: "질문 모듈 고르기" };

export default function QuestionsPage() {
  return <div className="hub-page"><div className="eyebrow"><span className="tiny-line" /> LISTEN TO YOURSELF</div><h1 className="page-title">어떤 면부터 살펴볼까요?</h1><p className="page-description">네 가지 모듈은 서로 다른 시선으로 나를 비춰요. 하나만 해도 결과를 볼 수 있고, 여러 개를 마치면 결과가 하나의 지도로 연결돼요.</p><div className="preview-notice"><Icon name="spark" size={18} /><p><strong>자기이해를 위한 탐색 문항입니다.</strong><br />결과는 현재 응답에서 보이는 경향이며, 심리·의학적 진단이나 검증된 임상 척도가 아닙니다. 마음이 많이 힘들다면 <Link className="inline-link" href="/support">도움 받을 수 있는 곳</Link>을 먼저 확인해 주세요.</p></div><ModuleHub /><p className="quiet-note"><Icon name="shield" size={16} /> 응답은 서버나 AI API로 전송되지 않습니다.</p></div>;
}
