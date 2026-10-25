import assert from "node:assert/strict";
import { test } from "node:test";
import { assessmentModules, isModuleId, moduleIds } from "../data/modules";
import { traitInstrument, traitMeta, traitQuestions } from "../data/traits";
import { validateInstrument } from "../lib/likert-engine";
import { computeExampleResult, computeModuleResult } from "../lib/module-results";
import { createInstrumentSession, instrumentResponses, parseInstrumentSession } from "../lib/session";
import { analyzeTraits, traitLeaning } from "../lib/trait-analysis";
import type { LikertResponse, LikertValue } from "../types/assessment";
import { traitIds } from "../types/traits";

test("every module instrument is valid, versioned, and uses a distinct storage key", () => {
  for (const id of moduleIds) {
    const assessment = assessmentModules[id];
    assert.equal(assessment.id, id);
    validateInstrument(assessment.instrument);
    assert.deepEqual(assessment.scales.map((scale) => scale.id), [...assessment.instrument.scaleIds]);
  }
  assert.equal(new Set(moduleIds.map((id) => assessmentModules[id].storageKey)).size, moduleIds.length);
  assert.equal(new Set(moduleIds.flatMap((id) => assessmentModules[id].instrument.items.map((item) => item.id))).size, 32 + 45 + 20 + 12);
  assert.equal(isModuleId("defense"), true);
  assert.equal(isModuleId("unknown"), false);
});

test("20 trait items: 5 traits × 4 with two reverse items each, spaced five apart", () => {
  validateInstrument(traitInstrument);
  assert.equal(traitQuestions.length, 20);
  assert.deepEqual(traitMeta.map((item) => item.id), [...traitIds]);
  for (const id of traitIds) {
    const group = traitQuestions.filter((item) => item.scale === id);
    assert.equal(group.length, 4);
    assert.equal(group.filter((item) => item.reverse).length, 2, id);
  }
  traitQuestions.forEach((item, index) => assert.equal(item.scale, traitIds[index % 5]));
});

test("trait leaning bands are low ≤37, mixed 38–62, high ≥63", () => {
  assert.deepEqual([0, 37, 38, 62, 63, 100].map(traitLeaning), ["low", "low", "mixed", "mixed", "high", "high"]);
  const forward: LikertResponse[] = traitQuestions.map((item) => ({ kind: "likert", questionId: item.id, value: (item.reverse ? 0 : 4) as LikertValue }));
  assert.ok(analyzeTraits(forward).leanings.every((item) => item.score === 100 && item.leaning === "high"));
});

test("generic sessions round-trip per instrument and reject other instruments' data", () => {
  const defense = assessmentModules.defense.instrument;
  const traits = assessmentModules.traits.instrument;
  const session = { ...createInstrumentSession(defense), answers: { [defense.items[0].id]: 0 as const }, currentQuestionIndex: 44 };
  assert.deepEqual(parseInstrumentSession(JSON.stringify(session), defense), session);
  assert.deepEqual(instrumentResponses(defense, session), [{ kind: "likert", questionId: defense.items[0].id, value: 0 }]);
  assert.equal(parseInstrumentSession(JSON.stringify(session), traits), null);
  assert.equal(parseInstrumentSession(JSON.stringify({ ...session, currentQuestionIndex: 45 }), defense), null);
  assert.equal(parseInstrumentSession(JSON.stringify({ ...session, completed: true }), defense), null);
});

test("examples are computed through the same engine for every module", () => {
  for (const id of moduleIds) {
    const example = computeExampleResult(id);
    assert.equal(example.module, id);
    const responses = assessmentModules[id].instrument.items.map((item) => ({ kind: "likert" as const, questionId: item.id, value: 2 as const }));
    assert.equal(computeModuleResult(id, responses).module, id);
  }
  const defense = computeExampleResult("defense");
  assert.ok(defense.module === "defense" && defense.profile.highlights[0].defense === "anticipation");
});

test("attachment: 12 items, 6 per dimension with two reverse each, alternating, no type labels", async () => {
  const { attachmentInstrument, attachmentQuestions, attachmentIds } = await import("../data/attachment");
  const { analyzeAttachment } = await import("../lib/attachment-analysis");
  validateInstrument(attachmentInstrument);
  assert.equal(attachmentQuestions.length, 12);
  for (const id of attachmentIds) {
    const group = attachmentQuestions.filter((item) => item.scale === id);
    assert.equal(group.length, 6);
    assert.equal(group.filter((item) => item.reverse).length, 2);
  }
  attachmentQuestions.forEach((item, index) => assert.equal(item.scale, attachmentIds[index % 2]));
  const answer = (anxiety: LikertValue, avoidance: LikertValue) => attachmentQuestions.map((item) => {
    const target = item.scale === "attachmentAnxiety" ? anxiety : avoidance;
    return { kind: "likert" as const, questionId: item.id, value: (item.reverse ? 4 - target : target) as LikertValue };
  });
  const highLow = analyzeAttachment(answer(4, 0));
  assert.deepEqual([highLow.anxiety, highLow.avoidance], [{ score: 100, leaning: "high" }, { score: 0, leaning: "low" }]);
  assert.ok(highLow.combined && highLow.combined.includes("가까움을 원하고"));
  const neutral = analyzeAttachment(answer(2, 2));
  assert.deepEqual([neutral.anxiety.leaning, neutral.avoidance.leaning, neutral.combined], ["mixed", "mixed", null]);
});

test("responses rebuilt from result evidence rescore to the same result", async () => {
  const { moduleResponses } = await import("../lib/module-results");
  for (const id of moduleIds) {
    const example = computeExampleResult(id);
    const rebuilt = moduleResponses(example);
    assert.equal(rebuilt.length, assessmentModules[id].instrument.items.length);
    assert.deepEqual(computeModuleResult(id, rebuilt), example);
  }
});
