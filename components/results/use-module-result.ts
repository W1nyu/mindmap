"use client";

import { useMemo } from "react";
import { assessmentModules, moduleIds, type ModuleId } from "@/data/modules";
import type { ModuleResults } from "@/lib/integration";
import { computeExampleResult, computeModuleResult, type ModuleResult } from "@/lib/module-results";
import { moduleStores } from "@/lib/module-stores";
import { instrumentResponses } from "@/lib/session";
import type { SessionSnapshot } from "@/lib/session-store";

export interface ModuleResultState {
  state: SessionSnapshot;
  result: ModuleResult | null;
  failed: boolean;
}

/** 예시는 고정 mock 응답, 그 외에는 완료된 탭 세션만 같은 계산 함수로 채점합니다. */
export function computeFromSnapshot(id: ModuleId, state: SessionSnapshot): { result: ModuleResult | null; failed: boolean } {
  if (!state.session?.completed) return { result: null, failed: false };
  try {
    return { result: computeModuleResult(id, instrumentResponses(assessmentModules[id].instrument, state.session)), failed: false };
  } catch {
    return { result: null, failed: true };
  }
}

/** 모든 모듈의 탭 세션을 모두 읽어 완료된 모듈만 결과로 묶습니다. */
export function useAllModuleResults(example: boolean): { ready: boolean; results: ModuleResults } {
  const reaction = moduleStores.reaction.useSession();
  const defense = moduleStores.defense.useSession();
  const traits = moduleStores.traits.useSession();
  const attachment = moduleStores.attachment.useSession();
  const results = useMemo(() => {
    const states: Record<ModuleId, SessionSnapshot> = { reaction, defense, traits, attachment };
    const entries: ModuleResults = {};
    for (const id of moduleIds) {
      const result = example ? computeExampleResult(id) : computeFromSnapshot(id, states[id]).result;
      if (result) Object.assign(entries, { [id]: result });
    }
    return entries;
  }, [example, reaction, defense, traits, attachment]);
  return { ready: example || (reaction.ready && defense.ready && traits.ready && attachment.ready), results };
}

export function useModuleResult(id: ModuleId, example: boolean): ModuleResultState {
  const state = moduleStores[id].useSession();
  const computed = useMemo(() => (example ? { result: computeExampleResult(id), failed: false } : computeFromSnapshot(id, state)), [id, example, state]);
  return { state, ...computed };
}
