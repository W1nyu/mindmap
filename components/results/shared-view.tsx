"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Icon } from "@/components/icon";
import { moduleIds } from "@/data/modules";
import type { ModuleResults } from "@/lib/integration";
import { computeModuleResult } from "@/lib/module-results";
import { decodeShare } from "@/lib/share";
import { OverviewBody } from "./results-overview";

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

/** URL 조각(#)의 응답만 읽어 이 브라우저에서 계산합니다. 아무것도 저장하지 않습니다. */
export function SharedView() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => null);
  const results = useMemo(() => {
    if (hash === null) return undefined;
    const answers = decodeShare(hash);
    if (!answers) return null;
    const computed: ModuleResults = {};
    for (const id of moduleIds) {
      const responses = answers[id];
      if (responses) Object.assign(computed, { [id]: computeModuleResult(id, responses) });
    }
    return computed;
  }, [hash]);

  if (results === undefined) return <p role="status">공유된 결과를 읽고 있어요.</p>;
  if (results === null) return <div className="empty-state"><div className="eyebrow">SHARED MAP</div><h1 className="page-title">공유 링크를 읽지 못했어요</h1><p className="page-description">링크가 잘렸거나, 질문지 버전이 바뀌어 더 이상 계산할 수 없는 링크일 수 있어요. 결과의 주인에게 새 링크를 받아 주세요.</p><div className="hero-actions"><Link className="button button-primary" href="/questions">나도 해 보기 <Icon name="arrow" size={16} /></Link></div></div>;
  return <OverviewBody results={results} variant="shared" />;
}
