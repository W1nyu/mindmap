import assert from "node:assert/strict";
import { test } from "node:test";
import { questions } from "../data/questions";
import { createSession, parseSession, sessionResponses } from "../lib/session";
import { scoreQuestionnaire } from "../lib/scoring";

test("empty and partial sessions round-trip including a valid zero answer", () => {
  const empty = createSession();
  assert.deepEqual(parseSession(JSON.stringify(empty)), empty);
  const partial = { ...empty, answers: { [questions[0].id]: 0 as const }, currentQuestionIndex: 1 };
  assert.deepEqual(parseSession(JSON.stringify(partial)), partial);
  assert.deepEqual(sessionResponses(partial), [{ kind: "likert", questionId: questions[0].id, value: 0 }]);
});

test("completed sessions restore and score only with all 32 valid responses", () => {
  const complete = { ...createSession(), answers: Object.fromEntries(questions.map((question) => [question.id, 2 as const])), completed: true, currentQuestionIndex: 31 };
  const restored = parseSession(JSON.stringify(complete));
  assert.ok(restored);
  assert.ok(scoreQuestionnaire(sessionResponses(restored)).dimensions.every((item) => item.score === 50));
});

test("corrupted, old-version, unknown-ID and out-of-range stored data is rejected", () => {
  const session = createSession();
  for (const raw of ["{", "null", "[]", "42", JSON.stringify({ ...session, questionnaireVersion: "old" }),
    JSON.stringify({ ...session, answers: { unknown: 2 } }), JSON.stringify({ ...session, answers: { [questions[0].id]: 5 } }),
    JSON.stringify({ ...session, answers: [] }), JSON.stringify({ ...session, answers: { [questions[0].id]: "0" } }),
    JSON.stringify({ ...session, currentQuestionIndex: -1 }), JSON.stringify({ ...session, currentQuestionIndex: 32 }),
    JSON.stringify({ ...session, currentQuestionIndex: 0.5 }), JSON.stringify({ ...session, completed: "yes" }),
    JSON.stringify({ ...session, completed: true })]) {
    assert.equal(parseSession(raw), null);
  }
});
