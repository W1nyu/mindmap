import type { Metadata } from "next";
import { ResultsOverview } from "@/components/results/results-overview";

export const metadata: Metadata = { title: "나의 마음 지형도" };

export default async function ResultsPage({ searchParams }: {
  searchParams: Promise<{ example?: string | string[] }>;
}) {
  const params = await searchParams;
  return <ResultsOverview example={params.example === "1"} />;
}
