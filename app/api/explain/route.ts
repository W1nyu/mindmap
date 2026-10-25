import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { EXPLAIN_MAX_BODY_BYTES, EXPLAIN_VERSION, parseExplainRequest } from "@/lib/explain";
import { EXPLAIN_MODEL, requestExplanation } from "@/lib/explain-claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 운영자가 SELFMAP_AI_EXPLAIN=on 과 Anthropic 자격 증명을 설정했을 때만 켜집니다. */
const enabled = () => process.env.SELFMAP_AI_EXPLAIN === "on";
let client: Anthropic | null = null;

export function GET() {
  return NextResponse.json({ enabled: enabled(), model: enabled() ? EXPLAIN_MODEL : null });
}

/** 요청 본문(점수)은 기록하지 않습니다. */
export async function POST(request: Request) {
  if (!enabled()) return NextResponse.json({ error: "disabled" }, { status: 404 });
  const raw = await request.text();
  if (raw.length > EXPLAIN_MAX_BODY_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const payload = parseExplainRequest(body);
  if (!payload) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  let outcome: Awaited<ReturnType<typeof requestExplanation>>;
  try {
    client ??= new Anthropic({ timeout: 60_000, maxRetries: 1 });
    outcome = await requestExplanation(payload, client);
  } catch {
    // 자격 증명 누락·네트워크 오류 등. 원인 상세와 요청 본문은 응답이나 로그에 남기지 않습니다.
    return NextResponse.json({ error: "api_error" }, { status: 502 });
  }
  if (!outcome.ok) return NextResponse.json({ error: outcome.reason }, { status: outcome.reason === "rate_limited" ? 429 : 502 });
  return NextResponse.json({ explanation: outcome.explanation, model: outcome.model, version: EXPLAIN_VERSION });
}
