"use client";

import { useMemo } from "react";
import { assessmentModules, moduleIds, type FormId, type ModuleId } from "@/data/modules";
import type { ModuleResults } from "@/lib/integration";
import { computeExampleResult, computeModuleResult, type ModuleResult } from "@/lib/module-results";
import { moduleStores } from "@/lib/module-stores";
import { instrumentResponses } from "@/lib/session";
import type { SessionSnapshot } from "@/lib/session-store";

export interface ModuleResultState {
  ready: boolean;
  states: Record<FormId, SessionSnapshot>;
  result: ModuleResult | null;
  failed: boolean;
}

function computeForm(id: ModuleId, form: FormId, state: SessionSnapshot): { result: ModuleResult | null; failed: boolean } {
  if (!state.session?.completed) return { result: null, failed: false };
  try {
    return { result: computeModuleResult(id, form, instrumentResponses(assessmentModules[id].forms[form].instrument, state.session)), failed: false };
  } catch {
    return { result: null, failed: true };
  }
}

/** 심층 검사를 마쳤으면 심층, 아니면 간편 검사 결과를 씁니다. preferred로 특정 검사지를 고를 수 있습니다. */
export function pickResult(id: ModuleId, states: Record<FormId, SessionSnapshot>, preferred?: FormId): { result: ModuleResult | null; failed: boolean } {
  const deep = computeForm(id, "deep", states.deep);
  const brief = computeForm(id, "brief", states.brief);
  if (preferred === "brief" && brief.result) return brief;
  if (preferred === "deep" && deep.result) return deep;
  return deep.result ? deep : brief.result ? brief : { result: null, failed: deep.failed || brief.failed };
}

function useStates(id: ModuleId): Record<FormId, SessionSnapshot> {
  const brief = moduleStores[id].brief.useSession();
  const deep = moduleStores[id].deep.useSession();
  return useMemo(() => ({ brief, deep }), [brief, deep]);
}

/** 네 모듈의 저장된 응답을 모두 읽어 완료된 모듈만 결과로 묶습니다. */
export function useAllModuleResults(example: boolean): { ready: boolean; results: ModuleResults } {
  const emotion = useStates("emotion");
  const defense = useStates("defense");
  const traits = useStates("traits");
  const attachment = useStates("attachment");
  const results = useMemo(() => {
    const all: Record<ModuleId, Record<FormId, SessionSnapshot>> = { emotion, defense, traits, attachment };
    const entries: ModuleResults = {};
    for (const id of moduleIds) {
      const result = example ? computeExampleResult(id) : pickResult(id, all[id]).result;
      if (result) Object.assign(entries, { [id]: result });
    }
    return entries;
  }, [example, emotion, defense, traits, attachment]);
  const ready = example || [emotion, defense, traits, attachment].every((states) => states.brief.ready && states.deep.ready);
  return { ready, results };
}

export function useModuleResult(id: ModuleId, example: boolean, preferred?: FormId): ModuleResultState {
  const states = useStates(id);
  const computed = useMemo(() => (example ? { result: computeExampleResult(id), failed: false } : pickResult(id, states, preferred)), [id, example, states, preferred]);
  return { ready: states.brief.ready && states.deep.ready, states, ...computed };
}
