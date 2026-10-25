import { ATTACHMENT_NORMS } from "../data/attachment";
import { emotionMeta } from "../data/emotion";
import type { ModuleId } from "../data/modules";
import type { TraitId } from "../types/traits";
import type { ModuleResult } from "./module-results";

/**
 * 유형 카드: 이미 계산된 점수를 연구에서 쓰는 분류 기준에 대어 이름을 붙입니다. 새 점수를 만들지 않습니다.
 * 유형은 지금 응답 기준의 경향이며, 시기와 관계에 따라 바뀔 수 있습니다.
 */
export interface TypeCard {
  module: ModuleId;
  /** 유형 이름 */
  name: string;
  /** 학술 명칭 */
  academic: string;
  summary: string;
  /** 어떤 기준으로 정했는지 */
  basis: string;
}

/** DERS: 하위척도 평균(1–5)이 모두 이 값보다 낮으면 ‘정서조절 양호’로 봅니다(2 가끔 · 3 절반 정도의 중간). */
export const EMOTION_CALM_MAX = 2.5;
/** 성격 원형과의 유사도(코사인)가 이 값보다 낮으면 뚜렷한 원형이 없다고 봅니다. */
export const PROTOTYPE_MIN_SIMILARITY = 0.5;

/** DERS 하위척도별 이름(K-DERS 표기). 가장 높은 하위척도를 ‘우세’ 영역으로 부릅니다. */
const emotionTypes: Record<string, { name: string; summary: string }> = {
  nonacceptance: { name: "비수용성 우세", summary: "속상한 감정이 들면 그렇게 느끼는 나를 먼저 탓하는 편이에요." },
  goals: { name: "목표지향행동 어려움 우세", summary: "감정이 흔들리면 하던 일로 돌아가기 어려운 편이에요." },
  impulse: { name: "충동통제곤란 우세", summary: "감정이 클 때 행동이 먼저 나가기 쉬운 편이에요." },
  awareness: { name: "정서 자각 부족 우세", summary: "내 감정에 주의를 덜 기울이고 지나치기 쉬운 편이에요." },
  strategies: { name: "조절전략 접근 제한 우세", summary: "한번 가라앉으면 빠져나올 방법이 없다고 느끼기 쉬운 편이에요." },
  clarity: { name: "정서 명료성 부족 우세", summary: "지금 느끼는 감정이 무엇인지 헷갈리는 편이에요." },
};

/**
 * 성격 세 원형(Robins 외, 1996; Asendorpf 외, 2001)을 개방성·성실성·외향성·친화성·부정적 정서성 순서의 방향으로 단순화한 기준 벡터.
 * 탄력형: 부정적 정서성 낮음, 나머지 높음 · 과잉통제형: 부정적 정서성 높음, 외향성 낮음 · 과소통제형: 성실성·친화성 낮음.
 */
export const traitPrototypes = [
  { id: "resilient", name: "탄력형", academic: "Resilient", vector: [0.5, 0.5, 0.5, 0.5, -1], summary: "정서가 비교적 안정되고 사람과 일에 두루 열려 있는 편이에요." },
  { id: "overcontrolled", name: "과잉통제형", academic: "Overcontrolled", vector: [0, 0.25, -1, 0.25, 1], summary: "감정을 섬세하게 느끼고, 나서기보다 신중하게 지켜보는 편이에요." },
  { id: "undercontrolled", name: "과소통제형", academic: "Undercontrolled", vector: [0, -1, 0.25, -0.75, 0.5], summary: "틀에 매이기보다 즉흥적이고 자기 방식대로 움직이는 편이에요." },
] as const;

const traitOrder: readonly TraitId[] = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"];

function cosine(a: readonly number[], b: readonly number[]) {
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const norm = (v: readonly number[]) => Math.sqrt(v.reduce((sum, value) => sum + value * value, 0));
  const denominator = norm(a) * norm(b);
  return denominator === 0 ? 0 : dot / denominator;
}

export function typeCard(result: ModuleResult): TypeCard {
  switch (result.module) {
    case "emotion": {
      const scales = result.profile.result.scales;
      const top = [...scales].sort((a, b) => b.mean - a.mean || scales.indexOf(a) - scales.indexOf(b))[0];
      const meta = emotionMeta.find((item) => item.id === top.scale)!;
      if (top.mean < EMOTION_CALM_MAX) {
        return { module: "emotion", name: "정서조절 양호", academic: "DERS 전 하위요인 낮음", summary: "속상한 순간에도 감정을 알아차리고 다루는 힘이 고르게 있는 편이에요.", basis: `여섯 영역 모두 평균 ${EMOTION_CALM_MAX} 미만(1–5)` };
      }
      return { module: "emotion", name: emotionTypes[top.scale].name, academic: `DERS ${meta.english} 우세`, summary: emotionTypes[top.scale].summary, basis: `가장 높은 영역: ${meta.shortName} 평균 ${top.mean.toFixed(1)} / 5` };
    }
    case "defense": {
      const tiers = result.profile.tiers;
      const top = [...tiers].sort((a, b) => b.mean - a.mean)[0];
      const names = { adaptive: ["성숙한 방어 우세", "Mature style", "힘든 순간에도 감정을 알아차리고 현실적으로 다루는 방식에 많이 기대요."], inhibitory: ["신경증적 방어 우세", "Neurotic style", "감정을 마음속에서 바꾸거나 거리를 두어 다루는 방식에 많이 기대요."], immediate: ["미성숙한 방어 우세", "Immature style", "강한 스트레스 앞에서 감정과 현실을 빠르게 밀어내 마음을 지키는 편이에요."] } as const;
      const [name, academic, summary] = names[top.tier];
      return { module: "defense", name, academic, summary, basis: `세 방어 스타일 중 평균이 가장 높음(${top.mean.toFixed(1)} / 9)` };
    }
    case "traits": {
      const scores = new Map(result.profile.leanings.map((item) => [item.trait, item.score]));
      const vector = traitOrder.map((trait) => (scores.get(trait)! - 50) / 50);
      const ranked = traitPrototypes.map((prototype) => ({ prototype, similarity: cosine(vector, prototype.vector) })).sort((a, b) => b.similarity - a.similarity);
      const best = ranked[0];
      if (best.similarity < PROTOTYPE_MIN_SIMILARITY) {
        return { module: "traits", name: "원형 미분류", academic: "Unclassified", summary: "다섯 성향이 어느 한 원형으로 기울지 않고 고르게 섞여 있어요.", basis: `세 원형과의 유사도 모두 ${PROTOTYPE_MIN_SIMILARITY} 미만` };
      }
      return { module: "traits", name: best.prototype.name, academic: best.prototype.academic, summary: best.prototype.summary, basis: `성격 원형 유사도 ${best.similarity.toFixed(2)}` };
    }
    case "attachment": {
      const { anxiety, avoidance } = result.profile;
      const anxious = anxiety.mean > ATTACHMENT_NORMS.anxiety;
      const avoidant = avoidance.mean > ATTACHMENT_NORMS.avoidance;
      const [name, academic, summary] = !anxious && !avoidant ? ["안정형", "Secure", "관계를 믿으면서 가까워지는 것도 편한 편이에요."]
        : anxious && !avoidant ? ["몰입형", "Preoccupied", "가까움을 원하고 그만큼 관계의 신호에 민감한 편이에요."]
        : !anxious && avoidant ? ["거부형", "Dismissing", "관계를 크게 걱정하지 않지만 혼자가 편한 편이에요."]
        : ["두려움형", "Fearful", "가까워지고 싶으면서도 가까워지는 것이 두려운 편이에요."];
      return { module: "attachment", name, academic, summary, basis: `애착불안 ${anxiety.mean.toFixed(1)} · 애착회피 ${avoidance.mean.toFixed(1)} (1–7, 기준 ${ATTACHMENT_NORMS.anxiety} · ${ATTACHMENT_NORMS.avoidance})` };
    }
  }
}
