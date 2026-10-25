import { COMPARE_GAP, comparePrompts, type ComparePrompt } from "../data/compare-prompts";
import { moduleIds, type ModuleId } from "../data/modules";
import { scaleScores, type ModuleResults } from "./integration";

export interface CompareInsight {
  prompt: ComparePrompt;
  a: number;
  b: number;
  gap: number;
}

/** 두 사람이 모두 공유한 모듈만 비교합니다. */
export function sharedModules(a: ModuleResults, b: ModuleResults): ModuleId[] {
  return moduleIds.filter((id) => a[id] && b[id]);
}

/** 순수 함수: 차이가 기준(25점) 이상인 척도의 대화 질문을 차이가 큰 순서(동률은 데이터 순서)로 돌려줍니다. */
export function compareInsights(a: ModuleResults, b: ModuleResults, gapMin = COMPARE_GAP): CompareInsight[] {
  return comparePrompts.map((prompt, index) => {
    const ra = a[prompt.module];
    const rb = b[prompt.module];
    if (!ra || !rb) return null;
    const sa = scaleScores(ra).get(prompt.scale)!;
    const sb = scaleScores(rb).get(prompt.scale)!;
    return { prompt, a: sa, b: sb, gap: Math.abs(sa - sb), index };
  }).filter((item): item is CompareInsight & { index: number } => item !== null && item.gap >= gapMin)
    .sort((x, y) => y.gap - x.gap || x.index - y.index)
    .map(({ prompt, a: sa, b: sb, gap }) => ({ prompt, a: sa, b: sb, gap }));
}
