import { attachmentMeta } from "../data/attachment";
import { defenseMeta } from "../data/defense-mechanisms";
import { dimensions } from "../data/dimensions";
import { assessmentModules, type ModuleId } from "../data/modules";
import { recoveryTexts } from "../data/reaction-insights";
import { traitMeta } from "../data/traits";
import { integratedInsights, type ModuleResults } from "./integration";
import { reactionInsights } from "./reaction-insights";

/**
 * 강점과 살펴볼 점: 이미 계산된 점수와 정적 해석 문구만 모아 한 화면에 나란히 보여줍니다.
 * 새 점수를 만들지 않고, 같은 결과에서는 항상 같은 목록이 나옵니다.
 */
export const BALANCE_VERSION = "balance-v1";
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

export function strengthsAndCare(results: ModuleResults): BalanceSummary {
  const strengths: BalanceItem[] = [];
  const care: BalanceItem[] = [];

  for (const { rule, evidence } of integratedInsights(results).matched) {
    const item: BalanceItem = {
      id: `rule:${rule.id}`, source: "cross", title: rule.title, text: rule.text,
      evidence: evidence.map((entry) => `${assessmentModules[entry.module].scales.find((scale) => scale.id === entry.scale)!.name} ${entry.score}`).join(" · "),
    };
    (rule.kind === "resource" ? strengths : care).push(item);
  }

  const reaction = results.reaction;
  if (reaction?.module === "reaction") {
    const insights = reactionInsights(reaction.result);
    if (insights.recovery.level === "high") strengths.push({ id: "reaction:recovery", source: "reaction", title: "관점을 되찾는 힘", text: recoveryTexts.high, evidence: `관점 전환·회복 능력 ${insights.recovery.score}` });
    if (insights.recovery.level === "low") care.push({ id: "reaction:recovery", source: "reaction", title: "관점을 되찾는 데 걸리는 시간", text: recoveryTexts.low, evidence: `관점 전환·회복 능력 ${insights.recovery.score}` });
    const top = insights.features.find((item) => item.dimension !== "perspectiveRecovery" && item.score >= HIGH);
    if (top) {
      const meta = dimensions.find((dimension) => dimension.id === top.dimension)!;
      care.push({ id: `reaction:${top.dimension}`, source: "reaction", title: `${meta.name} · 자주 드러나는 편`, text: `${meta.description}. 불편한 상황에서 이 반응이 먼저 올라올 수 있어요.`, evidence: `${meta.name} ${top.score}` });
    }
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
