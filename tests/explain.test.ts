import assert from "node:assert/strict";
import { test } from "node:test";
import { buildExplainPayload, describePayload, explainUserMessage, parseExplainRequest, validateExplanation } from "../lib/explain";
import { computeExampleResult } from "../lib/module-results";

const results = { defense: computeExampleResult("defense"), attachment: computeExampleResult("attachment") };

test("payload contains only module scale IDs and integer scores, in module order", () => {
  const payload = buildExplainPayload({ attachment: results.attachment, defense: results.defense });
  assert.deepEqual(payload.modules.map((item) => item.module), ["defense", "attachment"]);
  assert.equal(payload.modules[0].scales.length, 15);
  assert.deepEqual(Object.keys(payload.modules[1].scales[0]).sort(), ["id", "score"]);
  assert.deepEqual(parseExplainRequest({ ...payload, consent: true }), payload);
  const text = describePayload(payload);
  assert.ok(text.includes("## 방어기제 프로필") && text.includes("관계 불안"));
  assert.ok(explainUserMessage(payload).includes(text));
});

test("server-side request validation rejects missing consent, unknown or partial data", () => {
  const payload = buildExplainPayload(results);
  const bad = [
    null, [], { modules: payload.modules }, { ...payload, consent: "yes" }, { modules: [], consent: true },
    { modules: [{ module: "iq", scales: [] }], consent: true },
    { modules: [payload.modules[0], payload.modules[0]], consent: true },
    { modules: [{ ...payload.modules[1], scales: payload.modules[1].scales.slice(1) }], consent: true },
    { modules: [{ ...payload.modules[1], scales: [{ id: "attachmentAnxiety", score: 101 }, payload.modules[1].scales[1]] }], consent: true },
    { modules: [{ ...payload.modules[1], scales: [{ id: "attachmentAnxiety", score: 50.5 }, payload.modules[1].scales[1]] }], consent: true },
    { modules: [{ ...payload.modules[1], scales: [{ id: "x", score: 50 }, payload.modules[1].scales[1]] }], consent: true },
  ];
  for (const body of bad) assert.equal(parseExplainRequest(body), null, JSON.stringify(body)?.slice(0, 80));
});

test("explanations with digits, diagnostic wording, wrong shapes or lengths are rejected", () => {
  const good = { overview: "스트레스 앞에서 미리 준비하는 힘이 돋보일 수 있어요.", strengths: ["계획하는 힘"], cautions: ["준비가 걱정으로 길어질 수 있어요"], questions: ["무엇을 내려놓을 수 있을까요?"] };
  assert.deepEqual(validateExplanation(good), good);
  assert.deepEqual(validateExplanation({ ...good, overview: `  ${good.overview}  ` }), good);
  const bad = [
    { ...good, overview: "예상 점수가 83점으로 높아요." },
    { ...good, strengths: ["불안장애 가능성"] },
    { ...good, cautions: ["당신은 회피 유형입니다"] },
    { ...good, questions: [] },
    { ...good, questions: ["a", "b", "c", "d", "e"] },
    { ...good, overview: "가".repeat(601) },
    { ...good, strengths: [3] },
    { overview: good.overview, strengths: good.strengths, cautions: good.cautions },
    "text",
  ];
  for (const value of bad) assert.equal(validateExplanation(value), null);
});
