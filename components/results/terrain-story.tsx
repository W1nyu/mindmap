"use client";

import { useMemo } from "react";
import { Icon, type IconName } from "@/components/icon";
import type { ModuleResults } from "@/lib/integration";
import { buildTerrain } from "@/lib/terrain";
import { terrainStory, type StoryLine } from "@/lib/terrain-story";

const icons: Record<StoryLine["kind"], IconName> = { summit: "mountain", region: "map", route: "compass", "trait-note": "layers", note: "shield" };

/** 지형도를 문장으로 읽어 줍니다. 문장에 올리거나 초점을 두면 지도에서 해당 봉우리만 또렷해져요. */
export function TerrainStory({ results, onHighlight }: { results: ModuleResults; onHighlight: (ids: readonly string[]) => void }) {
  const story = useMemo(() => {
    const model = buildTerrain(results);
    return terrainStory(model.peaks, model.routes);
  }, [results]);
  if (story.length === 0) return null;
  return <section className="viz-card story-card" aria-labelledby="story-title">
    <div className="viz-heading"><div><h2 id="story-title">지도 이야기</h2><p className="viz-caption" style={{ marginTop: 2 }}>지형도를 문장으로 읽어 봤어요. 문장에 마우스를 올리면 지도에서 그 봉우리가 또렷해져요.</p></div></div>
    <ol className="story-list">{story.map((line, index) => <li key={index} className={`story-${line.kind}`} tabIndex={line.peaks.length ? 0 : undefined}
      onMouseEnter={() => onHighlight(line.peaks)} onMouseLeave={() => onHighlight([])} onFocus={() => onHighlight(line.peaks)} onBlur={() => onHighlight([])}>
      <Icon name={icons[line.kind]} size={18} /><p>{line.text}</p>
    </li>)}</ol>
  </section>;
}
