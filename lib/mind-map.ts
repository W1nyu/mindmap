import { defenseMeta } from "../data/defense-mechanisms";
import { dimensions } from "../data/dimensions";
import { assessmentModules, moduleIds, type ModuleId } from "../data/modules";
import { traitMeta } from "../data/traits";
import { balanceZone } from "./defense-analysis";
import type { ModuleResults } from "./integration";
import { reactionInsights } from "./reaction-insights";

export interface MindMapLeaf {
  label: string;
  detail: string;
}

export interface MindMapBranch {
  module: ModuleId;
  title: string;
  completed: boolean;
  leaves: readonly MindMapLeaf[];
}

const LEAF_LIMIT = 3;
const leaningWord = { low: "낮은 편", mixed: "가운데", high: "높은 편" } as const;

/** 완료한 모듈의 요약을 마음 지도 가지로 바꿉니다. 같은 결과에서 항상 같은 가지가 만들어집니다. */
export function buildMindMap(results: ModuleResults): MindMapBranch[] {
  return moduleIds.map((id) => {
    const result = results[id];
    const title = assessmentModules[id].title;
    if (!result) return { module: id, title, completed: false, leaves: [] };
    if (result.module === "reaction") {
      const insights = reactionInsights(result.result);
      const leaves = insights.features.map((item) => ({ label: dimensions.find((dimension) => dimension.id === item.dimension)!.shortName, detail: `${item.score}점` }));
      return { module: id, title, completed: true, leaves: leaves.length ? leaves : [{ label: "고르게 분포", detail: "50점 이상 없음" }] };
    }
    if (result.module === "defense") {
      const leaves: MindMapLeaf[] = result.profile.highlights.slice(0, LEAF_LIMIT - 1).map((item) => ({ label: defenseMeta(item.defense).name, detail: `${item.score}점` }));
      if (result.profile.balance) leaves.push({ label: "무게중심", detail: balanceZone(result.profile.balance.position).shortLabel });
      return { module: id, title, completed: true, leaves: leaves.length ? leaves : [{ label: "두드러진 방어 없음", detail: "고르게 낮음" }] };
    }
    if (result.module === "traits") {
      const leaning = result.profile.leanings.filter((item) => item.leaning !== "mixed")
        .map((item, index) => ({ item, index, distance: Math.abs(item.score - 50) }))
        .sort((a, b) => b.distance - a.distance || a.index - b.index).slice(0, LEAF_LIMIT)
        .map(({ item }) => {
          const meta = traitMeta.find((trait) => trait.id === item.trait)!;
          return { label: meta.shortName, detail: item.leaning === "high" ? meta.highPole : meta.lowPole };
        });
      return { module: id, title, completed: true, leaves: leaning.length ? leaning : [{ label: "균형", detail: "다섯 축 모두 가운데 범위" }] };
    }
    const { anxiety, avoidance } = result.profile;
    return { module: id, title, completed: true, leaves: [
      { label: "관계 불안", detail: `${anxiety.score}점 · ${leaningWord[anxiety.leaning]}` },
      { label: "친밀 회피", detail: `${avoidance.score}점 · ${leaningWord[avoidance.leaning]}` },
    ] };
  });
}
