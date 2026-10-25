import { dimensions } from "@/data/dimensions";
import type { DemoDimension } from "@/types/psychology";
import { mockResponses } from "@/data/mock-responses";
import { scoreQuestionnaire } from "@/lib/scoring";

export const mockResult = scoreQuestionnaire(mockResponses);
export const demoDimensions: DemoDimension[] = dimensions.map((dimension) => ({
  ...dimension,
  source: "demo",
  value: mockResult.dimensions.find((item) => item.dimension === dimension.id)!.score,
}));

export const reactionSteps = [
  { label: "상황", text: "비판 또는 오해" },
  { label: "자동 해석", text: "내 맥락이 빠졌어" },
  { label: "감정", text: "억울함 · 답답함" },
  { label: "핵심 욕구", text: "정확히 이해받기" },
  { label: "행동 경향", text: "설명 · 해명 증가" },
  { label: "회복", text: "관점 전환 · 인정" },
];
