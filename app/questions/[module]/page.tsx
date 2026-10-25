import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { Questionnaire } from "@/components/questionnaire";
import { assessmentModules, formLabels, isFormId, isModuleId, moduleIds } from "@/data/modules";

export const dynamicParams = false;

export function generateStaticParams() {
  return moduleIds.map((id) => ({ module: id }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module: id } = await params;
  return { title: isModuleId(id) ? `${assessmentModules[id].title} 검사` : "검사" };
}

export default async function ModuleQuestionsPage({ params, searchParams }: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ form?: string | string[] }>;
}) {
  const [{ module: id }, query] = await Promise.all([params, searchParams]);
  if (!isModuleId(id)) notFound();
  const form = isFormId(query.form) ? query.form : "brief";
  const assessment = assessmentModules[id];
  const current = assessment.forms[form];
  const other = form === "brief" ? "deep" : "brief";
  return <div className="question-page">
    <Link href="/questions" className="text-link back-link"><Icon name="chevron" size={14} style={{ transform: "rotate(180deg)" }} /> 검사 목록</Link>
    <h1 className="page-title">{assessment.title} <span className="form-chip">{formLabels[form]}</span></h1>
    <p className="page-description">{current.name} · {current.instrument.items.length}문항 · 약 {current.estimatedMinutes}분 · {current.citation}</p>
    <p className="form-switch"><Link className="text-link" href={`/questions/${id}?form=${other}`}>{formLabels[other]}({assessment.forms[other].instrument.items.length}문항)로 바꾸기</Link></p>
    <Questionnaire key={form} moduleId={id} form={form} />
    <p className="quiet-note">결과는 진단이 아닌 경향이에요. 응답은 이 브라우저에만 저장돼요.</p>
  </div>;
}
