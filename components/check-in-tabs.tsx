"use client";

import { useState } from "react";
import { EmotionStateCheckApp } from "@/components/emotion-state/emotion-state-check";
import { WellbeingCheckApp } from "@/components/wellbeing/wellbeing-check";

const tabs = [
  { id: "wellbeing", label: "웰빙 (WHO-5)", text: "오늘이나 이번 주의 웰빙을 0–100으로 기록해요." },
  { id: "emotion", label: "정서조절 (S-DERS)", text: "지금 이 순간 감정을 얼마나 받아들이고 다룰 수 있는지 기록해요." },
] as const;

export function CheckInTabs() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("wellbeing");
  const current = tabs.find((item) => item.id === tab)!;
  return <>
    <div className="wb-period" role="group" aria-label="체크 종류">{tabs.map((item) => <button key={item.id} type="button" aria-pressed={tab === item.id} onClick={() => setTab(item.id)}>{item.label}</button>)}</div>
    <p className="page-description" style={{ marginTop: 0 }}>{current.text} 진단이 아니에요.</p>
    {tab === "wellbeing" ? <WellbeingCheckApp /> : <EmotionStateCheckApp />}
  </>;
}
