import type { LikertInstrument, LikertResponse, ResponseQuality, ScoreBand } from "../types/assessment";

/** 정·역방향 문항에 평균 2점 이상 어긋나게(같은 방향으로) 답했을 때 해석 주의를 안내합니다. */
export const REVERSE_GAP_FLAG = 0.5;

/** 0–24 드묾, 25–49 가끔, 50–74 자주, 75–100 두드러짐(0–100 점수의 네 구간). */
export function scoreBand(score: number): ScoreBand {
  if (score >= 75) return "prominent";
  if (score >= 50) return "often";
  if (score >= 25) return "sometimes";
  return "rare";
}

export const bandLabels: Record<ScoreBand, string> = {
  rare: "드묾",
  sometimes: "가끔",
  often: "자주",
  prominent: "두드러짐",
};

/**
 * 척도마다 정방향 원응답 평균 F와 역방향 원응답 평균 R을 구해 |F + R − M| / M 을 계산하고 평균합니다(M = 선택지 수 − 1).
 * 일관되게 답하면 F + R ≈ M(한쪽에 동의하면 반대 문장엔 동의하지 않음)이므로 0에 가깝습니다.
 */
export function reverseGap(instrument: LikertInstrument, responses: readonly LikertResponse[]): number | null {
  const max = instrument.points - 1;
  const values = new Map(responses.map((response) => [response.questionId, response.value]));
  const gaps = instrument.scaleIds.flatMap((scale) => {
    const items = instrument.items.filter((item) => item.scale === scale && values.has(item.id));
    const forward = items.filter((item) => !item.reverse).map((item) => values.get(item.id)!);
    const reverse = items.filter((item) => item.reverse).map((item) => values.get(item.id)!);
    if (forward.length === 0 || reverse.length === 0) return [];
    const mean = (list: number[]) => list.reduce((sum, value) => sum + value, 0) / list.length;
    return [Math.abs(mean(forward) + mean(reverse) - max) / max];
  });
  return gaps.length ? Math.round((gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length) * 100) / 100 : null;
}

/** 원응답 기준의 응답 스타일 참고 정보입니다. 역채점 전 값을 0–1로 옮겨 씁니다. */
export function responseQuality(responses: readonly LikertResponse[], instrument: LikertInstrument): ResponseQuality {
  const count = responses.length;
  const gap = reverseGap(instrument, responses);
  if (count === 0) return { responseCount: 0, meanRaw: 0, allIdentical: false, highAgreement: false, lowAgreement: false, reverseGap: gap, inconsistentReverse: false };
  const meanRaw = Math.round((responses.reduce((sum, response) => sum + response.value, 0) / count / (instrument.points - 1)) * 100) / 100;
  return {
    responseCount: count,
    meanRaw,
    allIdentical: count > 1 && responses.every((response) => response.value === responses[0].value),
    highAgreement: meanRaw >= 0.875,
    lowAgreement: meanRaw <= 0.125,
    reverseGap: gap,
    inconsistentReverse: gap !== null && gap >= REVERSE_GAP_FLAG,
  };
}

/** 합이 정확히 100이 되도록 최대 나머지 방식으로 정수 비율을 나눕니다. 동률은 입력 순서를 따릅니다. */
export function largestRemainder(values: readonly number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  const exact = values.map((value) => (value / total) * 100);
  const shares = exact.map(Math.floor);
  const order = exact.map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (let left = 100 - shares.reduce((sum, value) => sum + value, 0), cursor = 0; left > 0; left -= 1, cursor += 1) {
    shares[order[cursor].index] += 1;
  }
  return shares;
}
