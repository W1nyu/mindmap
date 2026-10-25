import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModuleResultView } from "@/components/results/module-result-view";
import { assessmentModules, isFormId, isModuleId, moduleIds } from "@/data/modules";

export const dynamicParams = false;

export function generateStaticParams() {
  return moduleIds.map((id) => ({ module: id }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module: id } = await params;
  return { title: isModuleId(id) ? `${assessmentModules[id].title} 결과` : "결과" };
}

export default async function ModuleResultPage({ params, searchParams }: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ example?: string | string[]; form?: string | string[] }>;
}) {
  const [{ module: id }, query] = await Promise.all([params, searchParams]);
  if (!isModuleId(id)) notFound();
  return <ModuleResultView id={id} example={query.example === "1"} form={isFormId(query.form) ? query.form : undefined} />;
}
