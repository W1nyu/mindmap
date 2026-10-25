import assert from "node:assert/strict";
import { test } from "node:test";
import { questionnaire, questions } from "../data/questions";
import { mockResponses } from "../data/mock-responses";
import { isLikertValue, validateQuestionnaire } from "../lib/questionnaire";
import { SCORING_VERSION, ScoringError, scoreQuestionnaire, type ScoringErrorCode } from "../lib/scoring";
import { dimensionIds, type LikertResponse, type LikertValue, type Questionnaire } from "../types/psychology";

function answers(value: LikertValue): LikertResponse[] {
  return questions.map((question) => ({ kind: "likert", questionId: question.id, value }));
}

function expectError(input: readonly LikertResponse[], code: ScoringErrorCode, set = questionnaire) {
  assert.throws(() => scoreQuestionnaire(input, set), (error) => error instanceof ScoringError && error.code === code);
}

test("32 unique questions cover 8 dimensions with 4 items and one reverse item each", () => {
  validateQuestionnaire(questionnaire);
  assert.equal(questions.length, 32);
  assert.equal(new Set(questions.map((question) => question.id)).size, 32);
  for (const dimension of dimensionIds) {
    const group = questions.filter((question) => question.dimension === dimension);
    assert.equal(group.length, 4);
    assert.equal(group.filter((question) => question.reverse).length, 1);
    assert.ok(group.every((question) => question.weight === 1));
  }
});

test("minimum and maximum scored responses produce 0 and 100 in every dimension", () => {
  for (const maximum of [false, true]) {
    const input: LikertResponse[] = questions.map((question) => ({ kind: "likert", questionId: question.id, value: (question.reverse !== maximum ? 4 : 0) as LikertValue }));
    assert.deepEqual(scoreQuestionnaire(input).dimensions.map((item) => item.score), dimensionIds.map(() => maximum ? 100 : 0));
  }
});

test("neutral answers produce 50; raw extremes respect reverse scoring", () => {
  assert.ok(scoreQuestionnaire(answers(2)).dimensions.every((item) => item.score === 50));
  assert.ok(scoreQuestionnaire(answers(0)).dimensions.every((item) => item.score === 25));
  assert.ok(scoreQuestionnaire(answers(4)).dimensions.every((item) => item.score === 75));
});

test("weighted mean, rounding, and reverse evidence match independent calculation", () => {
  const set: Questionnaire = { ...questionnaire, questions: questions.map((question, index) => ({ ...question, weight: index === 0 ? 3 : 1 })) };
  const input = answers(2);
  input[0] = { ...input[0], value: 4 };
  const result = scoreQuestionnaire(input, set);
  const evaluation = result.dimensions[0];
  assert.equal(evaluation.weightSum, 6);
  assert.equal(evaluation.weightedSum, 18);
  assert.equal(evaluation.score, 75);
  const reverse = evaluation.evidence[3];
  assert.deepEqual(reverse, { questionId: questions[3].id, rawValue: 2, scoredValue: 2, reverse: true, weight: 1, weightedValue: 2 });
  assert.equal(scoreQuestionnaire(mockResponses).dimensions[0].score, 69);
});

test("identical and reordered inputs produce identical versioned results without mutation", () => {
  const input = answers(3);
  const before = JSON.stringify(input);
  const result = scoreQuestionnaire(input);
  assert.deepEqual(result, scoreQuestionnaire(input));
  assert.deepEqual(result, scoreQuestionnaire([...input].reverse()));
  assert.equal(JSON.stringify(input), before);
  assert.equal(result.source, "computed");
  assert.equal(result.questionnaireVersion, questionnaire.version);
  assert.equal(result.scoringVersion, SCORING_VERSION);
  assert.equal(result.responseCount, 32);
});

test("every Likert value is bounded and reversed explicitly", () => {
  for (const value of [0, 1, 2, 3, 4] as const) {
    const result = scoreQuestionnaire(answers(value));
    for (const dimension of result.dimensions) {
      assert.ok(Number.isInteger(dimension.score) && dimension.score >= 0 && dimension.score <= 100);
      for (const item of dimension.evidence) assert.equal(item.scoredValue, item.reverse ? 4 - value : value);
    }
  }
});

test("missing responses are rejected instead of substituted with zero", () => {
  expectError([], "MISSING_RESPONSE");
  expectError(answers(2).slice(1), "MISSING_RESPONSE");
});

test("duplicate and unknown question IDs are rejected", () => {
  const input = answers(2);
  expectError([...input, input[0]], "DUPLICATE_RESPONSE");
  expectError([{ ...input[0], questionId: "unknown" }, ...input.slice(1)], "UNKNOWN_QUESTION");
});

test("invalid values, kinds, nulls, and non-list inputs are rejected at runtime", () => {
  for (const value of [-1, 5, 1.5, NaN, Infinity, "2", null, undefined, true]) {
    assert.equal(isLikertValue(value), false);
    expectError([{ ...answers(2)[0], value }, ...answers(2).slice(1)] as unknown as LikertResponse[], "INVALID_RESPONSE");
  }
  expectError([null] as unknown as LikertResponse[], "INVALID_RESPONSE");
  expectError([{ kind: "text", questionId: questions[0].id, value: 2 }] as unknown as LikertResponse[], "INVALID_RESPONSE");
  expectError(null as unknown as LikertResponse[], "INVALID_RESPONSE");
});

test("malformed question data is rejected before scoring", () => {
  const badSets: Questionnaire[] = [
    { ...questionnaire, version: "" },
    { ...questionnaire, questions: [...questions, questions[0]] },
    { ...questionnaire, questions: questions.filter((question) => question.dimension !== dimensionIds[0]) },
    ...[0, -1, NaN, Infinity].map((weight) => ({ ...questionnaire, questions: questions.map((question, index) => ({ ...question, weight: index === 0 ? weight : 1 })) })),
    ...[{ dimension: "unknown" }, { reverse: "true" }, { text: "" }, { id: "" }].map((override) => ({ ...questionnaire, questions: questions.map((question, index) => index === 0 ? { ...question, ...override } : question) }) as unknown as Questionnaire),
  ];
  for (const set of badSets) expectError(answers(2), "INVALID_QUESTIONNAIRE", set);
});

test("overflowing weight sums are rejected", () => {
  const set = { ...questionnaire, questions: questions.map((question) => ({ ...question, weight: Number.MAX_VALUE })) };
  expectError(answers(4), "INVALID_QUESTIONNAIRE", set);
});
