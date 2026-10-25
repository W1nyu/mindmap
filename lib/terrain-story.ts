import { assessmentModules, moduleIds } from "../data/modules";
import { traitMeta } from "../data/traits";
import type { TerrainPeak, TerrainRoute } from "./terrain";

/**
 * 지도 이야기: 지형도를 읽기 쉬운 문장으로 풀어 줍니다. 문장은 고정 틀이고, 들어가는 숫자는
 * 모두 봉우리 점수(또는 그 차이)뿐이라 새 점수를 만들지 않습니다. 같은 지형에서는 항상 같은 문장이 나옵니다.
 */
export const STORY_TIE_POINTS = 5;
export const STORY_FLAT_RANGE = 15;

export interface StoryLine {
  kind: "summit" | "region" | "route" | "trait-note" | "note";
  text: string;
  /** 문장에 등장한 봉우리 ID(화면에서 강조용) */
  peaks: readonly string[];
}

const name = (peak: TerrainPeak) => `${peak.label} ${peak.score}`;
const byHeight = (a: TerrainPeak, b: TerrainPeak) => b.score - a.score || a.id.localeCompare(b.id);

export function terrainStory(peaks: readonly TerrainPeak[], routes: readonly TerrainRoute[]): StoryLine[] {
  if (peaks.length === 0) return [];
  const lines: StoryLine[] = [];
  const sorted = [...peaks].sort(byHeight);
  const [first, ...rest] = sorted;
  const ties = rest.filter((peak) => first.score - peak.score <= STORY_TIE_POINTS).slice(0, 2);
  const followers = rest.filter((peak) => !ties.includes(peak)).slice(0, 2);
  lines.push({
    kind: "summit",
    text: ties.length
      ? `가장 높이 솟은 곳은 ${name(first)}(${assessmentModules[first.module].title})이고, ${ties.map(name).join(", ")}도 거의 같은 높이예요. 한 봉우리보다 이 몇 곳이 함께 지형을 이끌고 있어요.`
      : `가장 높이 솟은 곳은 ${name(first)}(${assessmentModules[first.module].title})이에요.${followers.length ? ` 그 뒤로 ${followers.map(name).join(", ")} 순으로 이어져요.` : ""}`,
    peaks: [first, ...ties, ...(ties.length ? [] : followers)].map((peak) => peak.id),
  });

  for (const id of moduleIds) {
    const local = peaks.filter((peak) => peak.module === id).sort(byHeight);
    if (local.length < 2) continue;
    const high = local[0];
    const low = local[local.length - 1];
    const range = high.score - low.score;
    const title = assessmentModules[id].title;
    lines.push({
      kind: "region",
      text: range <= STORY_FLAT_RANGE
        ? `${title} 지역은 봉우리 높이가 비슷한 고른 지형이에요(가장 높은 ${name(high)}, 가장 낮은 ${name(low)}, 차이 ${range}).`
        : `${title} 지역은 높낮이가 뚜렷해요(가장 높은 ${name(high)}, 가장 낮은 ${name(low)}, 차이 ${range}).`,
      peaks: [high.id, low.id],
    });
  }

  const lowTraits = peaks.filter((peak) => peak.module === "traits" && peak.score <= 37);
  if (lowTraits.length) {
    lines.push({
      kind: "trait-note",
      text: `성격 5요인에서 낮게 펼쳐진 ${lowTraits.map((peak) => peak.label).join(", ")}은 부족함이 아니라 반대쪽 성향이에요. ${lowTraits.map((peak) => `${peak.label}이 낮으면 ‘${traitMeta.find((trait) => trait.id === peak.scale)!.lowPole}’ 쪽`).join(", ")}에 가깝다는 뜻이에요.`,
      peaks: lowTraits.map((peak) => peak.id),
    });
  }

  if (routes.length) {
    const titles = [...new Set(routes.map((route) => route.title))];
    const resources = new Set(routes.filter((route) => route.kind === "resource").map((route) => route.title));
    lines.push({
      kind: "route",
      text: `서로 다른 지역 사이에 ${titles.length}개의 길이 나 있어요: ${titles.map((title) => `${title}(${resources.has(title) ? "자원" : "살펴볼 흐름"})`).join(", ")}. 한 모듈만으로는 보이지 않던 연결이에요.`,
      peaks: [...new Set(routes.flatMap((route) => [route.from, route.to]))],
    });
  }

  lines.push({ kind: "note", text: "높이는 응답에서 그 경향이 드러난 정도일 뿐 좋고 나쁨이 아니에요. 지금의 지형은 상황과 시기에 따라 달라질 수 있어요.", peaks: [] });
  return lines;
}
