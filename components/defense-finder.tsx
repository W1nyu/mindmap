"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { defenseKeywords } from "@/data/defense-keywords";
import { defenseMechanisms, defenseTiers } from "@/data/defense-mechanisms";
import type { DefenseTierId } from "@/types/defense";

/** 사전 안 찾기: 이름·영문명·설명·일상의 예·일상 낱말에서 낱말을 찾아 해당 카드로 이동합니다. */
export function DefenseFinder() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<DefenseTierId | null>(null);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = defenseMechanisms.filter((item) => (!tier || item.tier === tier) &&
    words.every((word) => `${item.name} ${item.englishName} ${item.summary} ${item.example} ${item.protects} ${defenseKeywords[item.id].join(" ")}`.toLowerCase().includes(word)));
  const active = words.length > 0 || tier !== null;
  return <section className="viz-card finder" aria-labelledby="finder-title">
    <div className="viz-heading"><div><h2 id="finder-title">빠르게 찾기</h2><p className="viz-caption" style={{ marginTop: 2 }}>이름뿐 아니라 상황으로도 찾을 수 있어요. 예: 농담, 미루기, 핑계, 거리</p></div></div>
    <div className="finder-controls">
      <label className="finder-input"><Icon name="search" size={18} /><span className="sr-only">방어기제 찾기</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름이나 상황 낱말" /></label>
      <div className="chip-options" role="group" aria-label="수준으로 거르기" style={{ marginTop: 0 }}>
        {defenseTiers.map((item) => <button key={item.id} type="button" className={`chip-option tier-${item.id}`} aria-pressed={tier === item.id} onClick={() => setTier(tier === item.id ? null : item.id)}><i aria-hidden="true" />{item.name}</button>)}
      </div>
    </div>
    {active && <p className="viz-caption" role="status">{results.length}개를 찾았어요.</p>}
    {active && (results.length ? <ul className="finder-results">{results.map((item) => <li key={item.id} className={`tier-${item.tier}`}>
      <a href={`#defense-${item.id}`}><strong>{item.name} <small>{item.englishName}</small></strong><span>{item.summary}</span></a>
    </li>)}</ul> : <p className="viz-text">맞는 방어기제가 없어요. 다른 낱말로 찾아보세요.</p>)}
  </section>;
}
