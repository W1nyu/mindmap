import { attachmentMeta } from "../data/attachment";
import { defenseMeta } from "../data/defense-mechanisms";
import { emotionMeta } from "../data/emotion";
import { assessmentModules, type ModuleId } from "../data/modules";
import { traitMeta } from "../data/traits";
import { integratedInsights, type ModuleResults } from "./integration";

/**
 * 강점과 살펴볼 점: 이미 계산된 점수와 정적 해석 문구만 모아 한 화면에 나란히 보여줍니다.
 * 새 점수를 만들지 않고, 같은 결과에서는 항상 같은 목록이 나옵니다.
 */
export const BALANCE_VERSION = "balance-v2";
export const BALANCE_LIMIT = 5;
const HIGH = 63;
const LOW = 37;

export interface BalanceItem {
  id: string;
  source: ModuleId | "cross";
  title: string;
  text: string;
  evidence: string;
}

export interface BalanceSummary {
  strengths: readonly BalanceItem[];
  care: readonly BalanceItem[];
}

const scaleName = (module: ModuleId, scale: string) => assessmentModules[module].scales.find((item) => item.id === scale)?.name
  ?? { adaptive: "성숙한 방어", inhibitory: "신경증적 방어", immediate: "미성숙한 방어" }[scale] ?? scale;

export function strengthsAndCare(results: ModuleResults): BalanceSummary {
  const strengths: BalanceItem[] = [];
  const care: BalanceItem[] = [];

  for (const { rule, evidence } of integratedInsights(results).matched) {
    const item: BalanceItem = {
      id: `rule:${rule.id}`, source: "cross", title: rule.title, text: rule.text,
      evidence: evidence.map((entry) => `${scaleName(entry.module, entry.scale)} ${entry.score}`).join(" · "),
    };
    (rule.kind === "resource" ? strengths : care).push(item);
  }

  const emotion = results.emotion;
  if (emotion?.module === "emotion") {
    const scales = emotion.profile.result.scales;
    const ordered = [...scales].sort((a, b) => a.score - b.score || scales.indexOf(a) - scales.indexOf(b));
    const easiest = ordered[0];
    const hardest = ordered[ordered.length - 1];
    const meta = (id: string) => emotionMeta.find((item) => item.id === id)!;
    if (easiest.score <= 50) strengths.push({ id: `emotion:${easiest.scale}`, source: "emotion", title: meta(easiest.scale).shortName, text: meta(easiest.scale).strength, evidence: `${meta(easiest.scale).name} ${easiest.score}` });
    if (hardest.score >= 50) care.push({ id: `emotion:${hardest.scale}`, source: "emotion", title: meta(hardest.scale).shortName, text: meta(hardest.scale).difficulty, evidence: `${meta(hardest.scale).name} ${hardest.score}` });
  }

  const defense = results.defense;
  if (defense?.module === "defense") {
    for (const id of defense.profile.resources.slice(0, 2)) {
      const meta = defenseMeta(id);
      const score = defense.profile.result.scales.find((scale) => scale.scale === id)!.score;
      strengths.push({ id: `defense:${id}`, source: "defense", title: meta.name, text: meta.protects, evidence: `${meta.name} ${score}` });
    }
    const costly = defense.profile.highlights.find((item) => item.tier !== "adaptive");
    if (costly) {
      const meta = defenseMeta(costly.defense);
      care.push({ id: `defense:${costly.defense}`, source: "defense", title: meta.name, text: meta.cost, evidence: `${meta.name} ${costly.score}` });
    }
  }

  const traits = results.traits;
  if (traits?.module === "traits") {
    const leaning = traits.profile.leanings.filter((item) => item.leaning !== "mixed")
      .map((item, index) => ({ item, index }))
      .sort((a, b) => Math.abs(b.item.score - 50) - Math.abs(a.item.score - 50) || a.index - b.index)
      .slice(0, 2);
    for (const { item } of leaning) {
      const meta = traitMeta.find((trait) => trait.id === item.trait)!;
      const high = item.leaning === "high";
      const evidence = `${meta.name} ${item.score}`;
      strengths.push({ id: `traits:${item.trait}`, source: "traits", title: `${meta.shortName} · ${high ? meta.highPole : meta.lowPole}`, text: high ? meta.highStrength : meta.lowStrength, evidence });
      care.push({ id: `traits:${item.trait}`, source: "traits", title: `${meta.shortName} · ${high ? meta.highPole : meta.lowPole}`, text: high ? meta.highChallenge : meta.lowChallenge, evidence });
    }
  }

  const attachment = results.attachment;
  if (attachment?.module === "attachment") {
    for (const [key, axis] of [["attachmentAnxiety", attachment.profile.anxiety], ["attachmentAvoidance", attachment.profile.avoidance]] as const) {
      const meta = attachmentMeta.find((item) => item.id === key)!;
      if (axis.score <= LOW) strengths.push({ id: `attachment:${key}`, source: "attachment", title: `${meta.name} · 낮은 편`, text: meta.low, evidence: `${meta.name} ${axis.score}` });
      if (axis.score >= HIGH) care.push({ id: `attachment:${key}`, source: "attachment", title: `${meta.name} · 높은 편`, text: meta.high, evidence: `${meta.name} ${axis.score}` });
    }
  }

  return { strengths: roundRobin(strengths), care: roundRobin(care) };
}

/** 한 출처가 목록을 독차지하지 않도록 출처마다 번갈아 하나씩 고릅니다(출처 순서와 출처 안 순서는 유지). */
function roundRobin(items: readonly BalanceItem[]): BalanceItem[] {
  const groups = new Map<string, BalanceItem[]>();
  for (const item of items) (groups.get(item.source) ?? groups.set(item.source, []).get(item.source)!).push(item);
  const picked: BalanceItem[] = [];
  for (let round = 0; picked.length < BALANCE_LIMIT && picked.length < items.length; round += 1) {
    for (const group of groups.values()) if (group[round] && picked.length < BALANCE_LIMIT) picked.push(group[round]);
  }
  return picked;
}
