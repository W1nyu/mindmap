import assert from "node:assert/strict";
import { test } from "node:test";
import Anthropic from "@anthropic-ai/sdk";
import { buildExplainPayload } from "../lib/explain";
import { EXPLAIN_MODEL, requestExplanation } from "../lib/explain-claude";
import { computeExampleResult } from "../lib/module-results";

const payload = buildExplainPayload({ traits: computeExampleResult("traits") });
const good = { overview: "새로운 생각에 열려 있는 편일 수 있어요.", strengths: ["호기심"], cautions: ["마무리가 늦어질 수 있어요"], questions: ["무엇을 끝까지 해 보고 싶나요?"] };

/** 네트워크 없이 요청 형태와 응답 처리만 확인하는 가짜 클라이언트입니다. */
function fakeClient(respond: (params: Record<string, unknown>) => unknown) {
  const calls: Record<string, unknown>[] = [];
  const client = { beta: { messages: { create: async (params: Record<string, unknown>) => { calls.push(params); return respond(params); } } } };
  return { client: client as unknown as Anthropic, calls };
}

const message = (text: string, stop_reason = "end_turn") => ({ model: EXPLAIN_MODEL, stop_reason, content: [{ type: "text", text }] });

test("sends only the score description with structured output and default fallbacks", async () => {
  const { client, calls } = fakeClient(() => message(JSON.stringify(good)));
  const outcome = await requestExplanation(payload, client);
  assert.deepEqual(outcome, { ok: true, explanation: good, model: EXPLAIN_MODEL });
  const params = calls[0];
  assert.equal(params.model, "claude-opus-5-5");
  assert.equal(params.fallbacks, "default");
  assert.deepEqual(params.betas, ["server-side-fallback-2026-07-01"]);
  assert.equal((params.output_config as { format: { type: string } }).format.type, "json_schema");
  const content = (params.messages as { content: string }[])[0].content;
  assert.ok(content.includes("경험 개방성") && !content.includes("상상력이 풍부한 편이다"), "no item text or raw answers");
});

test("refusals, non-JSON, rule-breaking output and API errors fall back without throwing", async () => {
  assert.deepEqual(await requestExplanation(payload, fakeClient(() => message("", "refusal")).client), { ok: false, reason: "refusal" });
  assert.deepEqual(await requestExplanation(payload, fakeClient(() => message("not json")).client), { ok: false, reason: "invalid" });
  assert.deepEqual(await requestExplanation(payload, fakeClient(() => message(JSON.stringify({ ...good, overview: "개방성 75점" }))).client), { ok: false, reason: "invalid" });
  const rateLimited = Object.create(Anthropic.RateLimitError.prototype);
  assert.deepEqual(await requestExplanation(payload, fakeClient(() => { throw rateLimited; }).client), { ok: false, reason: "rate_limited" });
  const apiError = Object.create(Anthropic.InternalServerError.prototype);
  assert.deepEqual(await requestExplanation(payload, fakeClient(() => { throw apiError; }).client), { ok: false, reason: "api_error" });
});
