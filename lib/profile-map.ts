import { ATTACHMENT_NORMS } from "../data/attachment";
import { defenseTiers } from "../data/defense-mechanisms";
import { assessmentModules, moduleIds, type ModuleId } from "../data/modules";
import { integratedInsights, type ModuleResults } from "./integration";

/**
 * 통합 프로필: 네 검사의 지표를 같은 0–100 축 위에 나란히 놓고, 서로 다른 검사의 지표가
 * 함께 두드러질 때(연결 해석 규칙) 두 지표를 잇습니다. 이미 계산된 점수만 쓰며 새 점수를 만들지 않습니다.
 */
export interface ProfileRow {
  /** `${module}:${scale}` */
  id: string;
  module: ModuleId;
  scale: string;
  label: string;
  /** 좁은 화면용 짧은 이름 */
  short: string;
  /** 0–100 */
  score: number;
  /** 원 척도 평균 */
  mean: number;
  /** 원 척도의 가장 큰 번호(평균을 읽는 기준) */
  max: number;
  /** 비교 기준선(0–100). 애착은 ECR-R 표본 평균 */
  reference?: number;
}

export interface ProfileGroup {
  module: ModuleId;
  title: string;
  /** 점수 방향과 단위 안내 */
  direction: string;
  rows: readonly ProfileRow[];
  done: boolean;
  /** 이 검사가 그리는 지표 수(검사 전에도 자리를 잡아 두는 데 씁니다) */
  slots: number;
}

export interface ProfileLink {
  ruleId: string;
  kind: "pattern" | "resource";
  title: string;
  text: string;
  from: string;
  to: string;
  evidence: readonly { id: string; label: string; score: number }[];
}

const directions: Record<ModuleId, string> = {
  defense: "세 방어 스타일",
  emotion: "높을수록 조절 어려움 · 1–5",
  traits: "다섯 요인 · 1–5",
  attachment: "높을수록 불안·회피 · 1–7",
};

const slotCount: Record<ModuleId, number> = { emotion: 6, defense: 3, traits: 5, attachment: 2 };

const toScore = (mean: number, origin: number, points: number) => Math.round(((mean - origin) / (points - 1)) * 100);

export function profileGroups(results: ModuleResults): ProfileGroup[] {
  return moduleIds.map((module) => {
    const result = results[module];
    const meta = assessmentModules[module];
    if (!result) return { module, title: meta.title, direction: directions[module], rows: [], done: false, slots: slotCount[module] };
    const { points, origin } = result.profile.result;
    const max = origin + points - 1;
    const direction = module === "defense" ? `세 방어 스타일 · ${origin}–${max}` : directions[module];
    let rows: ProfileRow[];
    if (result.module === "defense") {
      rows = result.profile.tiers.map((tier) => ({
        id: `defense:${tier.tier}`, module, scale: tier.tier, label: defenseTiers.find((item) => item.id === tier.tier)!.name, short: defenseTiers.find((item) => item.id === tier.tier)!.name,
        score: tier.score, mean: tier.mean, max,
      }));
    } else {
      rows = result.profile.result.scales.map((scale) => ({
        id: `${module}:${scale.scale}`, module, scale: scale.scale,
        label: meta.scales.find((item) => item.id === scale.scale)?.name ?? scale.scale,
        short: meta.scales.find((item) => item.id === scale.scale)?.shortName ?? scale.scale,
        score: scale.score, mean: scale.mean, max,
        reference: module === "attachment" ? toScore(scale.scale === "attachmentAnxiety" ? ATTACHMENT_NORMS.anxiety : ATTACHMENT_NORMS.avoidance, origin, points) : undefined,
      }));
    }
    return { module, title: meta.title, direction, rows, done: true, slots: rows.length };
  });
}

/** 성립한 연결 해석을 두 지표 사이의 연결로 바꿉니다. 같은 규칙의 지표가 셋 이상이면 차례로 잇습니다. */
export function profileLinks(results: ModuleResults, groups: readonly ProfileGroup[]): ProfileLink[] {
  const rows = new Map(groups.flatMap((group) => group.rows).map((row) => [row.id, row]));
  const links: ProfileLink[] = [];
  for (const { rule, evidence } of integratedInsights(results).matched) {
    const ends = evidence.map((item) => rows.get(`${item.module}:${item.scale}`)).filter((row): row is ProfileRow => Boolean(row));
    for (let index = 1; index < ends.length; index += 1) {
      links.push({
        ruleId: rule.id, kind: rule.kind, title: rule.title, text: rule.text,
        from: ends[index - 1].id, to: ends[index].id,
        evidence: ends.map((row) => ({ id: row.id, label: row.label, score: row.score })),
      });
    }
  }
  return links;
}
