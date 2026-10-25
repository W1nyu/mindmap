"use client";

import { assessmentModules, formIds, moduleIds, type FormId, type ModuleId } from "@/data/modules";
import { moduleStores } from "@/lib/module-stores";
import { instrumentResponses } from "@/lib/session";
import type { SessionSnapshot } from "@/lib/session-store";

export interface FormProgress {
  form: FormId;
  answered: number;
  total: number;
  completed: boolean;
}

export interface ModuleProgress {
  id: ModuleId;
  forms: Record<FormId, FormProgress>;
  /** 간편이든 심층이든 하나라도 마쳤는지 */
  completed: boolean;
  /** 이어서 할 검사지(응답 중인 것 우선, 없으면 간편) */
  next: FormProgress;
  answered: number;
  total: number;
}

function formProgress(id: ModuleId, form: FormId, state: SessionSnapshot): FormProgress {
  const { instrument } = assessmentModules[id].forms[form];
  const session = state.session;
  return { form, answered: session ? instrumentResponses(instrument, session).length : 0, total: instrument.items.length, completed: Boolean(session?.completed) };
}

/** 네 모듈 × 두 검사지의 응답 수와 완료 여부만 읽습니다. 점수는 계산하지 않습니다. */
export function useModuleProgress(): { ready: boolean; modules: readonly ModuleProgress[]; completedCount: number } {
  const states: Record<ModuleId, Record<FormId, SessionSnapshot>> = {
    emotion: { brief: moduleStores.emotion.brief.useSession(), deep: moduleStores.emotion.deep.useSession() },
    defense: { brief: moduleStores.defense.brief.useSession(), deep: moduleStores.defense.deep.useSession() },
    traits: { brief: moduleStores.traits.brief.useSession(), deep: moduleStores.traits.deep.useSession() },
    attachment: { brief: moduleStores.attachment.brief.useSession(), deep: moduleStores.attachment.deep.useSession() },
  };
  const modules = moduleIds.map((id) => {
    const forms = Object.fromEntries(formIds.map((form) => [form, formProgress(id, form, states[id][form])])) as Record<FormId, FormProgress>;
    const inProgress = formIds.map((form) => forms[form]).find((item) => !item.completed && item.answered > 0);
    const next = inProgress ?? forms.brief;
    return { id, forms, completed: forms.brief.completed || forms.deep.completed, next, answered: next.answered, total: next.total };
  });
  const ready = moduleIds.every((id) => states[id].brief.ready && states[id].deep.ready);
  return { ready, modules, completedCount: modules.filter((item) => item.completed).length };
}
