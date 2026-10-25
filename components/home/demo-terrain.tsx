"use client";

import { useMemo } from "react";
import { TerrainMap } from "@/components/charts/terrain-map";
import { moduleIds } from "@/data/modules";
import type { ModuleResults } from "@/lib/integration";
import { computeExampleResult } from "@/lib/module-results";

/** 홈 첫 화면의 살아 있는 예시: 고정 mock 응답을 같은 계산 함수로 채점해 그린 지형도입니다. */
export function DemoTerrain() {
  const results = useMemo<ModuleResults>(() => Object.fromEntries(moduleIds.map((id) => [id, computeExampleResult(id)])), []);
  return <TerrainMap results={results} example compact />;
}
