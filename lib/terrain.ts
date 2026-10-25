import { defenseTiers } from "../data/defense-mechanisms";
import { moduleIds, assessmentModules, type ModuleId } from "../data/modules";
import { terrainSites } from "../data/terrain-layout";
import { integratedInsights, scaleScores, type ModuleResults } from "./integration";

/**
 * 마음 지형도: 척도 점수를 봉우리 높이로 삼아 등고선 지도를 그립니다.
 * 모든 계산은 같은 입력에 같은 출력을 내는 순수 함수이며, 점수를 바꾸거나 새로 만들지 않습니다.
 * 높이는 "응답에서 그 경향이 드러난 정도"일 뿐 좋고 나쁨이 아닙니다.
 */
export const TERRAIN_VERSION = "terrain-v1";

export interface TerrainPeak {
  id: string;
  module: ModuleId;
  scale: string;
  label: string;
  score: number;
  x: number;
  y: number;
}

export interface TerrainRoute {
  ruleId: string;
  kind: "pattern" | "resource";
  title: string;
  from: string;
  to: string;
}

export interface TerrainContour {
  level: number;
  d: string;
}

export interface TerrainModel {
  peaks: readonly TerrainPeak[];
  routes: readonly TerrainRoute[];
  contours: readonly TerrainContour[];
  width: number;
  height: number;
}

/** 완료한 모듈의 척도만 봉우리로 만듭니다. 방어기제는 세 수준 점수를 씁니다. */
export function terrainPeaks(results: ModuleResults): TerrainPeak[] {
  const peaks: TerrainPeak[] = [];
  for (const site of terrainSites) {
    const result = results[site.module];
    if (!result) continue;
    let score: number | undefined;
    let label: string | undefined;
    if (result.module === "defense") {
      score = result.profile.tiers.find((tier) => tier.tier === site.scale)?.score;
      label = defenseTiers.find((tier) => tier.id === site.scale)?.name;
    } else {
      score = scaleScores(result).get(site.scale);
      label = assessmentModules[site.module].scales.find((scale) => scale.id === site.scale)?.shortName;
    }
    if (score === undefined || label === undefined) continue;
    peaks.push({ id: `${site.module}:${site.scale}`, module: site.module, scale: site.scale, label, score, x: site.x, y: site.y });
  }
  return peaks;
}

/** 모듈 간 연결 해석 중 성립한 것을 봉우리 사이의 길로 바꿉니다. 방어기제 조건은 스타일 봉우리로 이어집니다. */
export function terrainRoutes(results: ModuleResults, peaks: readonly TerrainPeak[]): TerrainRoute[] {
  const ids = new Set(peaks.map((peak) => peak.id));
  const peakId = (module: ModuleId, scale: string) => `${module}:${scale}`;
  const routes: TerrainRoute[] = [];
  for (const { rule, evidence } of integratedInsights(results).matched) {
    const ends = [...new Set(evidence.map((item) => peakId(item.module, item.scale)))].filter((id) => ids.has(id));
    for (let index = 1; index < ends.length; index += 1) {
      routes.push({ ruleId: rule.id, kind: rule.kind, title: rule.title, from: ends[index - 1], to: ends[index] });
    }
  }
  return routes;
}

/** 봉우리 반경(정규화 좌표, 세로 기준). 가로는 화면비로 보정합니다. */
const SIGMA = 0.075;

/**
 * 격자 위 높이장. 봉우리마다 점수/100 높이의 가우스 언덕을 더하고, 지도가 너무 평평하지 않도록
 * 고정된 잔물결(난수 없음)을 아주 약하게 얹습니다.
 */
export function terrainField(peaks: readonly TerrainPeak[], cols: number, rows: number, aspect: number): Float64Array {
  const field = new Float64Array((cols + 1) * (rows + 1));
  const twoSigma2 = 2 * SIGMA * SIGMA;
  for (let j = 0; j <= rows; j += 1) {
    const y = j / rows;
    for (let i = 0; i <= cols; i += 1) {
      const x = i / cols;
      let z = 0.035 * (Math.sin(x * 9.1 + 0.7) * Math.cos(y * 7.3 + 1.9) + Math.sin((x + y) * 5.2)) + 0.03;
      for (const peak of peaks) {
        const dx = (x - peak.x) * aspect;
        const dy = y - peak.y;
        z += (peak.score / 100) * Math.exp(-(dx * dx + dy * dy) / twoSigma2);
      }
      field[j * (cols + 1) + i] = z;
    }
  }
  return field;
}

const fmt = (value: number) => (Math.round(value * 10) / 10).toString();

/**
 * 마칭 스퀘어로 한 높이의 등고선을 구해 이어진 선(path d)으로 돌려줍니다.
 * 선분 끝점을 격자 모서리 ID로 이어 붙이므로 부동소수 비교가 없습니다.
 */
export function contourPath(field: Float64Array, cols: number, rows: number, level: number, width: number, height: number): string {
  const stride = cols + 1;
  const value = (i: number, j: number) => field[j * stride + i];
  // 모서리 ID: 가로 모서리 (i,j)-(i+1,j) = 2*(j*stride+i), 세로 모서리 (i,j)-(i,j+1) = 2*(j*stride+i)+1
  const hEdge = (i: number, j: number) => 2 * (j * stride + i);
  const vEdge = (i: number, j: number) => 2 * (j * stride + i) + 1;
  const point = new Map<number, [number, number]>();
  const edgePoint = (edge: number): [number, number] => {
    const cached = point.get(edge);
    if (cached) return cached;
    const base = edge >> 1;
    const i = base % stride;
    const j = Math.floor(base / stride);
    const vertical = edge & 1;
    const a = value(i, j);
    const b = vertical ? value(i, j + 1) : value(i + 1, j);
    const t = a === b ? 0.5 : (level - a) / (b - a);
    const result: [number, number] = vertical ? [i * width / cols, (j + t) * height / rows] : [(i + t) * width / cols, j * height / rows];
    point.set(edge, result);
    return result;
  };
  const links = new Map<number, number[]>();
  const link = (a: number, b: number) => {
    (links.get(a) ?? links.set(a, []).get(a)!).push(b);
    (links.get(b) ?? links.set(b, []).get(b)!).push(a);
  };
  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < cols; i += 1) {
      const tl = value(i, j) >= level ? 8 : 0;
      const tr = value(i + 1, j) >= level ? 4 : 0;
      const br = value(i + 1, j + 1) >= level ? 2 : 0;
      const bl = value(i, j + 1) >= level ? 1 : 0;
      const code = tl | tr | br | bl;
      if (code === 0 || code === 15) continue;
      const top = hEdge(i, j);
      const bottom = hEdge(i, j + 1);
      const left = vEdge(i, j);
      const right = vEdge(i + 1, j);
      const center = (value(i, j) + value(i + 1, j) + value(i + 1, j + 1) + value(i, j + 1)) / 4 >= level;
      switch (code) {
        case 1: case 14: link(left, bottom); break;
        case 2: case 13: link(bottom, right); break;
        case 3: case 12: link(left, right); break;
        case 4: case 11: link(top, right); break;
        case 6: case 9: link(top, bottom); break;
        case 7: case 8: link(left, top); break;
        case 5: if (center) { link(left, top); link(bottom, right); } else { link(left, bottom); link(top, right); } break;
        case 10: if (center) { link(left, bottom); link(top, right); } else { link(left, top); link(bottom, right); } break;
      }
    }
  }
  const used = new Set<string>();
  const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const parts: string[] = [];
  // 열린 선(끝점 차수 1)부터 따라가고, 남은 닫힌 고리를 이어서 처리합니다.
  const starts = [...links.keys()].sort((a, b) => (links.get(a)!.length - links.get(b)!.length) || a - b);
  for (const start of starts) {
    for (const first of links.get(start)!) {
      if (used.has(key(start, first))) continue;
      const chain = [start];
      let previous = start;
      let current = first;
      used.add(key(start, first));
      while (true) {
        chain.push(current);
        const next = links.get(current)!.find((candidate) => candidate !== previous && !used.has(key(current, candidate)));
        if (next === undefined) break;
        used.add(key(current, next));
        previous = current;
        current = next;
      }
      const coords = chain.map(edgePoint);
      parts.push(`M${coords.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join("L")}${chain[0] === chain[chain.length - 1] ? "Z" : ""}`);
    }
  }
  return parts.join("");
}

export const TERRAIN_LEVELS = [0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84, 0.92] as const;

/** 지형도 전체 모델. 완료한 모듈이 없으면 봉우리 없이 잔물결 등고선만 남습니다. */
export function buildTerrain(results: ModuleResults, width = 1000, height = 620, cols = 100, rows = 62): TerrainModel {
  const peaks = terrainPeaks(results);
  const field = terrainField(peaks, cols, rows, width / height);
  const contours = TERRAIN_LEVELS.map((level) => ({ level, d: contourPath(field, cols, rows, level, width, height) })).filter((item) => item.d);
  return { peaks, routes: terrainRoutes(results, peaks), contours, width, height };
}

/** 완료 여부와 관계없이 지형도에 지역을 가진 모듈 목록(범례용) */
export const terrainModules: readonly ModuleId[] = moduleIds;
