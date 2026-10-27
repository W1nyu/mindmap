import type { LikertInstrument, LikertOption } from "../types/assessment";

/** 원 척도의 선택지를 그대로 따릅니다. 이름은 mindmap이 옮긴 한국어입니다. */
const options = (labels: readonly string[]): LikertOption[] => labels.map((label, value) => ({ value, label }));

/** BFI-2: Disagree strongly – Agree strongly (5점) */
export const agree5 = options(["전혀 아니다", "약간 아니다", "보통이다", "약간 그렇다", "매우 그렇다"]);
/** DERS: almost never (0–10%) – almost always (91–100%) (5점). 표기는 K-DERS(조용래, 2007) */
export const frequency5 = options(["거의 그렇지 않다 (0–10%)", "때때로 그렇다 (11–35%)", "대략 반쯤 그렇다 (36–65%)", "대부분 그렇다 (66–90%)", "거의 언제나 그렇다 (91–100%)"]);
/** ECR-R·ECR-RS: Strongly disagree – Strongly agree (7점) */
export const agree7 = options(["전혀 아니다", "아니다", "약간 아니다", "보통이다", "약간 그렇다", "그렇다", "매우 그렇다"]);
/** DMRS-SR-30: Not at all (0) – Very often/much (4) (5점) */
export const frequency5dmrs = options(["전혀 없었다", "드물게 있었다", "가끔 있었다", "자주 있었다", "매우 자주 있었다"]);
/** DSQ: 1 strongly disagree · 5 neither · 9 strongly agree (9점). 원 척도는 양 끝과 가운데만 이름이 있어 나머지는 mindmap이 붙인 표현입니다. */
export const agree9 = options(["전혀 아니다", "거의 아니다", "아닌 편이다", "약간 아니다", "보통이다", "약간 그렇다", "그런 편이다", "꽤 그렇다", "매우 그렇다"]);

/** [문항, 척도, 역채점] 목록에서 원 문항 번호 순서대로 도구를 만듭니다. 문항 ID는 `${id}-${번호}`입니다. */
export function buildInstrument<S extends string>(spec: {
  id: string;
  version: string;
  options: readonly LikertOption[];
  /** 원 척도의 첫 번호. 기본 1 */
  origin?: number;
  scaleIds: readonly S[];
  items: readonly (readonly [text: string, scale: S, reverse?: boolean])[];
}): LikertInstrument<S> {
  return {
    id: spec.id,
    version: spec.version,
    points: spec.options.length,
    options: spec.options,
    origin: spec.origin ?? 1,
    scaleIds: spec.scaleIds,
    items: spec.items.map(([text, scale, reverse], index) => ({ id: `${spec.id}-${index + 1}`, kind: "likert", text, scale, reverse: Boolean(reverse), weight: 1 })),
  };
}
