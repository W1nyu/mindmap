import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { Questionnaire } from "@/components/questionnaire";
import { assessmentModules, isModuleId, moduleIds } from "@/data/modules";

export const dynamicParams = false;

export function generateStaticParams() {
  return moduleIds.map((id) => ({ module: id }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module: id } = await params;
  return { title: isModuleId(id) ? `${assessmentModules[id].title} 질문` : "질문" };
}

export default async function ModuleQuestionsPage({ params }: { params: Promise<{ module: string }> }) {
  const { module: id } = await params;
  if (!isModuleId(id)) notFound();
  const assessment = assessmentModules[id];
  return <div className="question-page">
    <Link href="/questions" className="text-link back-link"><Icon name="chevron" size={14} style={{ transform: "rotate(180deg)" }} /> 모듈 목록</Link>
    <div className="eyebrow"><span className="tiny-line" /> LISTEN TO YOURSELF</div>
    <h1 className="page-title">{assessment.title}</h1>
    <p className="page-description">{assessment.tagline}. 정답은 없어요. 내가 경험한 순간에 가까운 답이면 충분합니다.</p>
    <div className="preview-notice"><Icon name="spark" size={18} /><p><strong>{assessment.instrument.items.length}개 질문 · 0–4 응답 · 약 {assessment.estimatedMinutes}분</strong><br />{assessment.basis}. 결과는 경향이며, 심리·의학적 진단이나 검증된 임상 척도가 아닙니다.</p></div>
    <Questionnaire moduleId={id} />
    <p className="quiet-note"><Icon name="shield" size={16} /> 응답은 서버나 AI API로 전송되지 않습니다.</p>
  </div>;
}
