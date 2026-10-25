import Anthropic from "@anthropic-ai/sdk";
import { EXPLAIN_SYSTEM_PROMPT, explainUserMessage, explanationSchema, validateExplanation, type ExplainPayload, type Explanation } from "./explain";

/** 서버 전용. 브라우저 번들에서 가져오지 않습니다(API 키는 서버 환경 변수로만 읽습니다). */
export const EXPLAIN_MODEL = "claude-opus-5-5";

export type ExplainOutcome =
  | { ok: true; explanation: Explanation; model: string }
  | { ok: false; reason: "refusal" | "invalid" | "rate_limited" | "api_error" };

/**
 * 점수 설명만 요청합니다. 구조화 출력으로 형식을 고정하고, 응답은 validateExplanation으로 다시 검사해
 * 숫자·진단 표현이 있으면 버립니다. 정책상 거절되면 서버 기본 대체 모델로 다시 시도합니다.
 */
export async function requestExplanation(payload: ExplainPayload, client: Anthropic): Promise<ExplainOutcome> {
  try {
    const response = await client.beta.messages.create({
      model: EXPLAIN_MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: explanationSchema } },
      system: EXPLAIN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: explainUserMessage(payload) }],
    });
    if (response.stop_reason === "refusal") return { ok: false, reason: "refusal" };
    const text = response.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, reason: "invalid" };
    }
    const explanation = validateExplanation(parsed);
    return explanation ? { ok: true, explanation, model: response.model } : { ok: false, reason: "invalid" };
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return { ok: false, reason: "rate_limited" };
    if (error instanceof Anthropic.APIError) return { ok: false, reason: "api_error" };
    throw error;
  }
}
