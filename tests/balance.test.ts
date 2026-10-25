import assert from "node:assert/strict";
import { test } from "node:test";
import { moduleIds } from "../data/modules";
import { BALANCE_LIMIT, strengthsAndCare } from "../lib/balance";
import type { ModuleResults } from "../lib/integration";
import { computeExampleResult } from "../lib/module-results";

const allExamples = (): ModuleResults => Object.fromEntries(moduleIds.map((id) => [id, computeExampleResult(id)]));
const banned = /장애|질환|병적|진단|비정상|문제 있는|유형입니다/;

test("strengths and care points are deterministic, capped, and never empty for the full example", () => {
  const a = strengthsAndCare(allExamples());
  assert.deepEqual(a, strengthsAndCare(allExamples()));
  assert.ok(a.strengths.length > 0 && a.strengths.length <= BALANCE_LIMIT);
  assert.ok(a.care.length > 0 && a.care.length <= BALANCE_LIMIT);
  assert.equal(new Set(a.strengths.map((item) => item.id)).size, a.strengths.length);
  assert.equal(new Set(a.care.map((item) => item.id)).size, a.care.length);
});

test("every item cites the score it came from and avoids pathologizing language", () => {
  const { strengths, care } = strengthsAndCare(allExamples());
  for (const item of [...strengths, ...care]) {
    assert.match(item.evidence, /\d/);
    assert.doesNotMatch(`${item.title} ${item.text}`, banned);
  }
});

test("no completed modules means nothing to show", () => {
  assert.deepEqual(strengthsAndCare({}), { strengths: [], care: [] });
});

test("a trait leaning always shows its strength and its difficulty together", () => {
  const { strengths, care } = strengthsAndCare({ traits: computeExampleResult("traits") });
  const strengthIds = strengths.filter((item) => item.source === "traits").map((item) => item.id);
  assert.deepEqual(strengthIds, care.filter((item) => item.source === "traits").map((item) => item.id));
});
