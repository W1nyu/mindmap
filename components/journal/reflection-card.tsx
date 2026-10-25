"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { useAllModuleResults } from "@/components/results/use-module-result";
import { assessmentModules } from "@/data/modules";
import { dayNumber, pickReflection } from "@/lib/reflection";

/** 오늘의 질문. 하루 동안 같은 질문이 유지되고, ‘다른 질문’으로 넘길 수 있어요. */
export function ReflectionCard() {
  const { ready, results } = useAllModuleResults(false);
  const [offset, setOffset] = useState(0);
  const [day] = useState(() => dayNumber(new Date()));
  if (!ready) return null;
  const picked = pickReflection(results, day + offset);
  return <section className="reflection-card" aria-labelledby="reflection-title">
    <div className="reflection-head"><span className="eyebrow small">TODAY&apos;S QUESTION</span>{picked.poolSize > 1 && <button type="button" className="text-link" onClick={() => setOffset((value) => value + 1)}>다른 질문 <Icon name="chevron" size={13} /></button>}</div>
    <h2 id="reflection-title">{picked.prompt.text}</h2>
    <p className="viz-caption">{picked.personalized
      ? `내 결과와 연결된 질문이에요 · ${picked.reasons.map((reason) => `${assessmentModules[reason.module].scales.find((scale) => scale.id === reason.scale)!.name} ${reason.score}`).join(", ")}`
      : "모듈을 마치면 내 결과와 연결된 질문도 함께 보여드려요."} 답하지 않고 지나가도 괜찮아요.</p>
  </section>;
}
