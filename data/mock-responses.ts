import { attachmentQuestions, type AttachmentId } from "./attachment";
import { defenseQuestions } from "./defense-questions";
import { questions } from "./questions";
import { traitQuestions } from "./traits";
import type { DefenseId } from "../types/defense";
import type { LikertResponse, LikertValue } from "../types/psychology";
import type { TraitId } from "../types/traits";

/** 고정 mock 응답: 예시 점수 역시 실제 scoring engine으로만 계산합니다. */
const mockValues: readonly LikertValue[] = [
  2, 3, 3, 1, 4, 3, 4, 2, 3, 2, 3, 2, 2, 3, 2, 3,
  2, 1, 3, 3, 3, 2, 2, 2, 3, 4, 3, 2, 3, 2, 4, 2,
];

export const mockResponses: readonly LikertResponse[] = questions.map((question, index) => ({
  kind: "likert", questionId: question.id, value: mockValues[index],
}));

/** 방어기제 예시용 고정 응답: [1번째, 2번째, 3번째 문항] 원응답 */
const defenseMockValues: Record<DefenseId, readonly [LikertValue, LikertValue, LikertValue]> = {
  sublimation: [2, 3, 2], humor: [2, 2, 1], anticipation: [4, 3, 3], suppression: [3, 2, 3], affiliation: [1, 2, 2],
  intellectualization: [4, 3, 3], reactionFormation: [2, 1, 2], displacement: [2, 2, 1], undoing: [2, 3, 2],
  denial: [1, 1, 0], projection: [1, 2, 1], rationalization: [2, 2, 3], passiveAggression: [1, 1, 2], actingOut: [1, 2, 1], withdrawal: [3, 2, 3],
};

export const defenseMockResponses: readonly LikertResponse[] = defenseQuestions.map((item) => ({
  kind: "likert", questionId: item.id, value: defenseMockValues[item.scale][Number(item.id.slice(-1)) - 1],
}));

/** 5요인 예시용 고정 원응답. 역채점 문항도 원응답으로 적었습니다. */
const traitMockValues: Record<TraitId, readonly LikertValue[]> = {
  openness: [3, 1, 3, 1], conscientiousness: [3, 2, 3, 2], extraversion: [1, 3, 2, 3],
  agreeableness: [3, 1, 3, 1], negativeEmotionality: [3, 1, 2, 2],
};

export const traitMockResponses: readonly LikertResponse[] = traitQuestions.map((item) => ({
  kind: "likert", questionId: item.id, value: traitMockValues[item.scale][Number(item.id.slice(-1)) - 1],
}));

/** 애착 예시용 고정 원응답(역채점 문항 포함). */
const attachmentMockValues: Record<AttachmentId, readonly LikertValue[]> = {
  attachmentAnxiety: [3, 3, 1, 2, 3, 2],
  attachmentAvoidance: [2, 1, 3, 2, 2, 3],
};

export const attachmentMockResponses: readonly LikertResponse[] = attachmentQuestions.map((item) => ({
  kind: "likert", questionId: item.id, value: attachmentMockValues[item.scale][Number(item.id.slice(-1)) - 1],
}));
