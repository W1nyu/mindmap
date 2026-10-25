"use client";

import { useMemo } from "react";
import { ProfileMap } from "@/components/charts/profile-map";
import { moduleIds } from "@/data/modules";
import type { ModuleResults } from "@/lib/integration";
import { computeExampleResult } from "@/lib/module-results";

/** 홈 첫 화면의 예시: 고정 예시 응답을 같은 계산 함수로 채점해 그린 통합 프로필입니다. */
export function DemoProfile() {
  const results = useMemo<ModuleResults>(() => Object.fromEntries(moduleIds.map((id) => [id, computeExampleResult(id)])), []);
  return <ProfileMap results={results} example compact />;
}
