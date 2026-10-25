"use client";

import { assessmentModules, moduleIds, type ModuleId } from "@/data/modules";
import { moduleStores } from "@/lib/module-stores";
import { instrumentResponses } from "@/lib/session";

export interface ModuleProgress {
  id: ModuleId;
  answered: number;
  total: number;
  completed: boolean;
}

/** 네 모듈의 탭 세션에서 응답 수와 완료 여부만 읽습니다. 점수는 계산하지 않습니다. */
export function useModuleProgress(): { ready: boolean; modules: readonly ModuleProgress[]; completedCount: number } {
  const states = {
    reaction: moduleStores.reaction.useSession(),
    defense: moduleStores.defense.useSession(),
    traits: moduleStores.traits.useSession(),
    attachment: moduleStores.attachment.useSession(),
  };
  const modules = moduleIds.map((id) => {
    const { instrument } = assessmentModules[id];
    const session = states[id].session;
    return { id, answered: session ? instrumentResponses(instrument, session).length : 0, total: instrument.items.length, completed: Boolean(session?.completed) };
  });
  return { ready: moduleIds.every((id) => states[id].ready), modules, completedCount: modules.filter((item) => item.completed).length };
}
